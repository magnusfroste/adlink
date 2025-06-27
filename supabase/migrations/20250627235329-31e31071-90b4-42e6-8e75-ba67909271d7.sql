
-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('content_provider', 'advertiser');

-- Create enum for ad types
CREATE TYPE public.ad_type AS ENUM ('image', 'html');

-- Create enum for ad status
CREATE TYPE public.ad_status AS ENUM ('active', 'inactive', 'pending');

-- Create advertisers table
CREATE TABLE public.advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content providers table
CREATE TABLE public.content_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    organization_name TEXT NOT NULL,
    website_domain TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create advertisements table
CREATE TABLE public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    ad_type public.ad_type NOT NULL DEFAULT 'image',
    image_url TEXT,
    html_content TEXT,
    click_url TEXT NOT NULL,
    status public.ad_status NOT NULL DEFAULT 'pending',
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_ad_content CHECK (
        (ad_type = 'image' AND image_url IS NOT NULL) OR 
        (ad_type = 'html' AND html_content IS NOT NULL)
    )
);

-- Create content links table
CREATE TABLE public.content_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_provider_id UUID REFERENCES public.content_providers(id) ON DELETE CASCADE NOT NULL,
    original_url TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ad impressions tracking table
CREATE TABLE public.ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE NOT NULL,
    content_link_id UUID REFERENCES public.content_links(id) ON DELETE CASCADE NOT NULL,
    visitor_ip TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content clicks tracking table
CREATE TABLE public.content_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_link_id UUID REFERENCES public.content_links(id) ON DELETE CASCADE NOT NULL,
    advertisement_id UUID REFERENCES public.advertisements(id),
    visitor_ip TEXT,
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advertisers
CREATE POLICY "Users can view their own advertiser profile" ON public.advertisers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advertiser profile" ON public.advertisers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advertiser profile" ON public.advertisers
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for content providers
CREATE POLICY "Users can view their own content provider profile" ON public.content_providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content provider profile" ON public.content_providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content provider profile" ON public.content_providers
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for advertisements
CREATE POLICY "Advertisers can manage their own ads" ON public.advertisements
    FOR ALL USING (
        advertiser_id IN (
            SELECT id FROM public.advertisers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view active ads" ON public.advertisements
    FOR SELECT USING (status = 'active');

-- RLS Policies for content links
CREATE POLICY "Content providers can manage their own links" ON public.content_links
    FOR ALL USING (
        content_provider_id IN (
            SELECT id FROM public.content_providers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view content links" ON public.content_links
    FOR SELECT USING (true);

-- RLS Policies for tracking tables (public read for analytics)
CREATE POLICY "Advertisers can view impressions for their ads" ON public.ad_impressions
    FOR SELECT USING (
        advertisement_id IN (
            SELECT a.id FROM public.advertisements a
            JOIN public.advertisers adv ON a.advertiser_id = adv.id
            WHERE adv.user_id = auth.uid()
        )
    );

CREATE POLICY "Content providers can view clicks for their content" ON public.content_clicks
    FOR SELECT USING (
        content_link_id IN (
            SELECT cl.id FROM public.content_links cl
            JOIN public.content_providers cp ON cl.content_provider_id = cp.id
            WHERE cp.user_id = auth.uid()
        )
    );

-- Allow public insertion for tracking (needed for the gateway)
CREATE POLICY "Allow public ad impression tracking" ON public.ad_impressions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public content click tracking" ON public.content_clicks
    FOR INSERT WITH CHECK (true);

-- Function to generate random short codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to get random active advertisement
CREATE OR REPLACE FUNCTION get_random_advertisement()
RETURNS public.advertisements
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ad_record public.advertisements;
BEGIN
    SELECT * INTO ad_record
    FROM public.advertisements
    WHERE status = 'active'
    ORDER BY random()
    LIMIT 1;
    
    RETURN ad_record;
END;
$$;

-- Trigger to update views count on advertisements
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

-- Trigger to update clicks count on content links
CREATE OR REPLACE FUNCTION update_content_clicks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.content_links 
    SET clicks_count = clicks_count + 1,
        updated_at = now()
    WHERE id = NEW.content_link_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_content_clicks
    AFTER INSERT ON public.content_clicks
    FOR EACH ROW EXECUTE FUNCTION update_content_clicks();
