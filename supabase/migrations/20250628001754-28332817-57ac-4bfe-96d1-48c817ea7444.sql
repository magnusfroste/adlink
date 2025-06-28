
-- Fix the trigger to update advertisement views count
DROP TRIGGER IF EXISTS trigger_update_ad_views ON public.ad_impressions;
DROP FUNCTION IF EXISTS update_ad_views();

CREATE OR REPLACE FUNCTION update_ad_views()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.advertisements 
    SET views_count = views_count + 1,
        updated_at = now()
    WHERE id = NEW.advertisement_id;
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
AS $$
BEGIN
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
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_content_clicks
    AFTER INSERT ON public.content_clicks
    FOR EACH ROW EXECUTE FUNCTION update_content_clicks();
