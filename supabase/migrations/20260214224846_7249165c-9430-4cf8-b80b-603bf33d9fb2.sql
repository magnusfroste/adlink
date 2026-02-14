
-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Junction: content_links <-> categories
CREATE TABLE public.content_link_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_link_id uuid NOT NULL REFERENCES public.content_links(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (content_link_id, category_id)
);

ALTER TABLE public.content_link_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view link categories" ON public.content_link_categories FOR SELECT USING (true);
CREATE POLICY "Link owners can manage" ON public.content_link_categories FOR INSERT TO authenticated
  WITH CHECK (content_link_id IN (
    SELECT cl.id FROM content_links cl
    JOIN content_providers cp ON cl.provider_id = cp.id
    WHERE cp.user_id = auth.uid()
  ));
CREATE POLICY "Link owners can delete" ON public.content_link_categories FOR DELETE TO authenticated
  USING (content_link_id IN (
    SELECT cl.id FROM content_links cl
    JOIN content_providers cp ON cl.provider_id = cp.id
    WHERE cp.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage link categories" ON public.content_link_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Junction: advertisements <-> categories
CREATE TABLE public.advertisement_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertisement_id uuid NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (advertisement_id, category_id)
);

ALTER TABLE public.advertisement_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ad categories" ON public.advertisement_categories FOR SELECT USING (true);
CREATE POLICY "Ad owners can manage" ON public.advertisement_categories FOR INSERT TO authenticated
  WITH CHECK (advertisement_id IN (
    SELECT a.id FROM advertisements a
    JOIN advertisers adv ON a.advertiser_id = adv.id
    WHERE adv.user_id = auth.uid()
  ));
CREATE POLICY "Ad owners can delete" ON public.advertisement_categories FOR DELETE TO authenticated
  USING (advertisement_id IN (
    SELECT a.id FROM advertisements a
    JOIN advertisers adv ON a.advertiser_id = adv.id
    WHERE adv.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage ad categories" ON public.advertisement_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed some default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Nyheter', 'nyheter'),
  ('Sport', 'sport'),
  ('Ekonomi', 'ekonomi'),
  ('Teknik', 'teknik'),
  ('Kultur', 'kultur'),
  ('Hälsa', 'halsa'),
  ('Nöje', 'noje'),
  ('Vetenskap', 'vetenskap');

-- Update get_random_advertisement to prefer category-matched ads
CREATE OR REPLACE FUNCTION public.get_random_advertisement_for_link(p_content_link_id uuid)
RETURNS advertisements
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT a.* FROM advertisements a
  WHERE a.is_active = true AND a.spent < a.budget
  ORDER BY
    -- Prefer ads matching content link categories
    (EXISTS (
      SELECT 1 FROM advertisement_categories ac
      JOIN content_link_categories clc ON ac.category_id = clc.category_id
      WHERE ac.advertisement_id = a.id AND clc.content_link_id = p_content_link_id
    )) DESC,
    random()
  LIMIT 1;
$$;
