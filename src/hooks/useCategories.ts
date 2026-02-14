import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
      .then(({ data }) => {
        setCategories(data || []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export async function getContentLinkCategoryIds(contentLinkId: string) {
  const { data } = await supabase
    .from('content_link_categories')
    .select('category_id')
    .eq('content_link_id', contentLinkId);
  return (data || []).map(r => r.category_id);
}

export async function getAdCategoryIds(advertisementId: string) {
  const { data } = await supabase
    .from('advertisement_categories')
    .select('category_id')
    .eq('advertisement_id', advertisementId);
  return (data || []).map(r => r.category_id);
}

export async function saveContentLinkCategories(contentLinkId: string, categoryIds: string[]) {
  await supabase.from('content_link_categories').delete().eq('content_link_id', contentLinkId);
  if (categoryIds.length > 0) {
    await supabase.from('content_link_categories').insert(
      categoryIds.map(cid => ({ content_link_id: contentLinkId, category_id: cid }))
    );
  }
}

export async function saveAdCategories(advertisementId: string, categoryIds: string[]) {
  await supabase.from('advertisement_categories').delete().eq('advertisement_id', advertisementId);
  if (categoryIds.length > 0) {
    await supabase.from('advertisement_categories').insert(
      categoryIds.map(cid => ({ advertisement_id: advertisementId, category_id: cid }))
    );
  }
}
