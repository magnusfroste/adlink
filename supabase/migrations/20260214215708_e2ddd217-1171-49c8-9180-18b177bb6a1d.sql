
-- Profiles table for user metadata
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  user_type TEXT NOT NULL CHECK (user_type IN ('content_provider', 'advertiser')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Content providers
CREATE TABLE public.content_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  organization_name TEXT NOT NULL,
  website_domain TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own provider" ON public.content_providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own provider" ON public.content_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own provider" ON public.content_providers FOR UPDATE USING (auth.uid() = user_id);

-- Advertisers
CREATE TABLE public.advertisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own advertiser" ON public.advertisers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own advertiser" ON public.advertisers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own advertiser" ON public.advertisers FOR UPDATE USING (auth.uid() = user_id);

-- Content links
CREATE TABLE public.content_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.content_providers(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can view own links" ON public.content_links FOR SELECT USING (
  provider_id IN (SELECT id FROM public.content_providers WHERE user_id = auth.uid())
);
CREATE POLICY "Providers can insert own links" ON public.content_links FOR INSERT WITH CHECK (
  provider_id IN (SELECT id FROM public.content_providers WHERE user_id = auth.uid())
);
CREATE POLICY "Providers can update own links" ON public.content_links FOR UPDATE USING (
  provider_id IN (SELECT id FROM public.content_providers WHERE user_id = auth.uid())
);
CREATE POLICY "Public can view active links by short_code" ON public.content_links FOR SELECT USING (is_active = true);

-- Advertisements
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'image' CHECK (ad_type IN ('image', 'html')),
  image_url TEXT,
  html_content TEXT,
  click_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  budget NUMERIC(10,2) NOT NULL DEFAULT 0,
  spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advertisers can view own ads" ON public.advertisements FOR SELECT USING (
  advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid())
);
CREATE POLICY "Advertisers can insert own ads" ON public.advertisements FOR INSERT WITH CHECK (
  advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid())
);
CREATE POLICY "Advertisers can update own ads" ON public.advertisements FOR UPDATE USING (
  advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid())
);
CREATE POLICY "Public can view active ads" ON public.advertisements FOR SELECT USING (is_active = true);

-- Ad impressions tracking
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertisement_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  content_link_id UUID NOT NULL REFERENCES public.content_links(id) ON DELETE CASCADE,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert impressions" ON public.ad_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view impressions" ON public.ad_impressions FOR SELECT USING (
  advertisement_id IN (SELECT id FROM public.advertisements WHERE advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid()))
  OR content_link_id IN (SELECT id FROM public.content_links WHERE provider_id IN (SELECT id FROM public.content_providers WHERE user_id = auth.uid()))
);

-- Content clicks tracking
CREATE TABLE public.content_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_link_id UUID NOT NULL REFERENCES public.content_links(id) ON DELETE CASCADE,
  advertisement_id UUID REFERENCES public.advertisements(id) ON DELETE SET NULL,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert clicks" ON public.content_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view clicks" ON public.content_clicks FOR SELECT USING (
  content_link_id IN (SELECT id FROM public.content_links WHERE provider_id IN (SELECT id FROM public.content_providers WHERE user_id = auth.uid()))
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_providers_updated_at BEFORE UPDATE ON public.content_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advertisers_updated_at BEFORE UPDATE ON public.advertisers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_links_updated_at BEFORE UPDATE ON public.content_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get a random active advertisement
CREATE OR REPLACE FUNCTION public.get_random_advertisement()
RETURNS public.advertisements AS $$
  SELECT * FROM public.advertisements WHERE is_active = true ORDER BY random() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
