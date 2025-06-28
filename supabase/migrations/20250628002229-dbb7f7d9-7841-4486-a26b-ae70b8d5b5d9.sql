
-- Step 1 & 2: Recreate Missing Triggers with SECURITY DEFINER and Error Handling
DROP TRIGGER IF EXISTS trigger_update_ad_views ON public.ad_impressions;
DROP FUNCTION IF EXISTS update_ad_views();

CREATE OR REPLACE FUNCTION update_ad_views()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    BEGIN
        UPDATE public.advertisements 
        SET views_count = views_count + 1,
            updated_at = now()
        WHERE id = NEW.advertisement_id;
        
        -- Log success for debugging
        RAISE LOG 'Updated ad views for advertisement_id: %', NEW.advertisement_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the insert
        RAISE LOG 'Error updating ad views for advertisement_id %: %', NEW.advertisement_id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_ad_views
    AFTER INSERT ON public.ad_impressions
    FOR EACH ROW EXECUTE FUNCTION update_ad_views();

-- Fix the trigger to update content clicks count
DROP TRIGGER IF EXISTS trigger_update_content_clicks ON public.content_clicks;
DROP FUNCTION IF EXISTS update_content_clicks();

CREATE OR REPLACE FUNCTION update_content_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    BEGIN
        -- Update content link clicks count
        UPDATE public.content_links 
        SET clicks_count = clicks_count + 1,
            updated_at = now()
        WHERE id = NEW.content_link_id;
        
        -- Also update advertisement clicks count if an ad was involved
        IF NEW.advertisement_id IS NOT NULL THEN
            UPDATE public.advertisements 
            SET clicks_count = clicks_count + 1,
                updated_at = now()
            WHERE id = NEW.advertisement_id;
            
            RAISE LOG 'Updated clicks for content_link_id: % and advertisement_id: %', 
                NEW.content_link_id, NEW.advertisement_id;
        ELSE
            RAISE LOG 'Updated clicks for content_link_id: %', NEW.content_link_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the insert
        RAISE LOG 'Error updating clicks for content_link_id %: %', NEW.content_link_id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_content_clicks
    AFTER INSERT ON public.content_clicks
    FOR EACH ROW EXECUTE FUNCTION update_content_clicks();

-- Step 3: Backfill Historical Data
-- Update advertisement views based on existing impressions
UPDATE public.advertisements 
SET views_count = (
    SELECT COUNT(*) 
    FROM public.ad_impressions 
    WHERE advertisement_id = advertisements.id
),
updated_at = now()
WHERE id IN (
    SELECT DISTINCT advertisement_id 
    FROM public.ad_impressions
);

-- Update advertisement clicks based on existing clicks
UPDATE public.advertisements 
SET clicks_count = (
    SELECT COUNT(*) 
    FROM public.content_clicks 
    WHERE advertisement_id = advertisements.id
),
updated_at = now()
WHERE id IN (
    SELECT DISTINCT advertisement_id 
    FROM public.content_clicks 
    WHERE advertisement_id IS NOT NULL
);

-- Update content link clicks based on existing clicks
UPDATE public.content_links 
SET clicks_count = (
    SELECT COUNT(*) 
    FROM public.content_clicks 
    WHERE content_link_id = content_links.id
),
updated_at = now()
WHERE id IN (
    SELECT DISTINCT content_link_id 
    FROM public.content_clicks
);

-- Step 5: Create monitoring function to verify data consistency
CREATE OR REPLACE FUNCTION verify_counter_consistency()
RETURNS TABLE(
    table_name text,
    record_id uuid,
    stored_count bigint,
    actual_count bigint,
    discrepancy bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Check advertisement views
    SELECT 
        'advertisements_views'::text,
        a.id,
        a.views_count::bigint,
        COALESCE(ai.actual_count, 0)::bigint,
        (a.views_count - COALESCE(ai.actual_count, 0))::bigint
    FROM public.advertisements a
    LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as actual_count
        FROM public.ad_impressions
        GROUP BY advertisement_id
    ) ai ON a.id = ai.advertisement_id
    WHERE a.views_count != COALESCE(ai.actual_count, 0)
    
    UNION ALL
    
    -- Check advertisement clicks
    SELECT 
        'advertisements_clicks'::text,
        a.id,
        a.clicks_count::bigint,
        COALESCE(cc.actual_count, 0)::bigint,
        (a.clicks_count - COALESCE(cc.actual_count, 0))::bigint
    FROM public.advertisements a
    LEFT JOIN (
        SELECT advertisement_id, COUNT(*) as actual_count
        FROM public.content_clicks
        WHERE advertisement_id IS NOT NULL
        GROUP BY advertisement_id
    ) cc ON a.id = cc.advertisement_id
    WHERE a.clicks_count != COALESCE(cc.actual_count, 0)
    
    UNION ALL
    
    -- Check content link clicks
    SELECT 
        'content_links_clicks'::text,
        cl.id,
        cl.clicks_count::bigint,
        COALESCE(cc.actual_count, 0)::bigint,
        (cl.clicks_count - COALESCE(cc.actual_count, 0))::bigint
    FROM public.content_links cl
    LEFT JOIN (
        SELECT content_link_id, COUNT(*) as actual_count
        FROM public.content_clicks
        GROUP BY content_link_id
    ) cc ON cl.id = cc.content_link_id
    WHERE cl.clicks_count != COALESCE(cc.actual_count, 0);
$$;
