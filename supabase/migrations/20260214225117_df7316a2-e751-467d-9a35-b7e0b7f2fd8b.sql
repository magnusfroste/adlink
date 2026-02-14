
-- Blocked categories per content link (brand safety)
CREATE TABLE public.content_link_blocked_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_link_id uuid NOT NULL REFERENCES public.content_links(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE (content_link_id, category_id)
);

ALTER TABLE public.content_link_blocked_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for ad matching)
CREATE POLICY "Anyone can view blocked categories" ON public.content_link_blocked_categories FOR SELECT USING (true);

-- Link owners can manage
CREATE POLICY "Link owners can insert blocked categories" ON public.content_link_blocked_categories FOR INSERT TO authenticated
  WITH CHECK (content_link_id IN (
    SELECT cl.id FROM content_links cl
    JOIN content_providers cp ON cl.provider_id = cp.id
    WHERE cp.user_id = auth.uid()
  ));

CREATE POLICY "Link owners can delete blocked categories" ON public.content_link_blocked_categories FOR DELETE TO authenticated
  USING (content_link_id IN (
    SELECT cl.id FROM content_links cl
    JOIN content_providers cp ON cl.provider_id = cp.id
    WHERE cp.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage blocked categories" ON public.content_link_blocked_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update the ad matching function to respect blocked categories
CREATE OR REPLACE FUNCTION public.get_random_advertisement_for_link(p_content_link_id uuid)
RETURNS advertisements
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT a.* FROM advertisements a
  WHERE a.is_active = true AND a.spent < a.budget
    -- Exclude ads whose categories are blocked by this content link
    AND NOT EXISTS (
      SELECT 1 FROM advertisement_categories ac
      JOIN content_link_blocked_categories clbc ON ac.category_id = clbc.category_id
      WHERE ac.advertisement_id = a.id AND clbc.content_link_id = p_content_link_id
    )
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
