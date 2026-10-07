-- 1. Räknar-triggers: de ursprungliga använde gamla kolumnnamn (views_count/
--    clicks_count) och finns inte längre, så view_count/click_count räknades
--    aldrig upp. Återskapade med rätt kolumner.
create or replace function public.update_ad_views()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.advertisements set view_count = view_count + 1 where id = new.advertisement_id;
  update public.content_links set view_count = view_count + 1 where id = new.content_link_id;
  return new;
end; $$;
create or replace function public.update_content_clicks()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.content_links set click_count = click_count + 1 where id = new.content_link_id;
  if new.advertisement_id is not null then
    update public.advertisements set click_count = click_count + 1 where id = new.advertisement_id;
  end if;
  return new;
end; $$;
revoke execute on function public.update_ad_views() from public, anon, authenticated;
revoke execute on function public.update_content_clicks() from public, anon, authenticated;
drop trigger if exists trigger_update_ad_views on public.ad_impressions;
create trigger trigger_update_ad_views after insert on public.ad_impressions for each row execute function public.update_ad_views();
drop trigger if exists trigger_update_content_clicks on public.content_clicks;
create trigger trigger_update_content_clicks after insert on public.content_clicks for each row execute function public.update_content_clicks();

-- 2. Annonsörer/leverantörer kunde själva sätta spent och räknare. Klienter
--    (utom admin) kan nu inte ändra dem; budget sätts som förut.
create or replace function public.protect_ad_counters()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('anon', 'authenticated') and not public.has_role(auth.uid(), 'admin'::app_role) then
    if tg_op = 'INSERT' then
      new.view_count := 0; new.click_count := 0;
      if tg_table_name = 'advertisements' then new.spent := 0; end if;
    else
      new.view_count := old.view_count; new.click_count := old.click_count;
      if tg_table_name = 'advertisements' then new.spent := old.spent; end if;
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists protect_ad_counters on public.advertisements;
create trigger protect_ad_counters before insert or update on public.advertisements for each row execute function public.protect_ad_counters();
drop trigger if exists protect_ad_counters on public.content_links;
create trigger protect_ad_counters before insert or update on public.content_links for each row execute function public.protect_ad_counters();

-- 3. Visningar/klick: bara för aktiva annonser och länkar, och ingen
--    klientangiven IP-adress (Gateway skickar null).
drop policy if exists "Anyone can insert impressions" on public.ad_impressions;
create policy "Anyone can insert impressions" on public.ad_impressions for insert with check (
  visitor_ip is null
  and exists (select 1 from public.advertisements a where a.id = advertisement_id and a.is_active)
  and exists (select 1 from public.content_links l where l.id = content_link_id and l.is_active)
);
drop policy if exists "Anyone can insert clicks" on public.content_clicks;
create policy "Anyone can insert clicks" on public.content_clicks for insert with check (
  visitor_ip is null
  and exists (select 1 from public.content_links l where l.id = content_link_id and l.is_active)
  and (advertisement_id is null or exists (select 1 from public.advertisements a where a.id = advertisement_id and a.is_active))
);
