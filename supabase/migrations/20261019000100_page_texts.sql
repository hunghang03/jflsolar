-- Editable page wording (Admin → Page text). Each row overrides one default in
-- lib/page-text.ts; a missing row means the original wording is shown.
-- Safe to run once on an existing project (Supabase → SQL Editor, or `supabase db push`).

create table public.page_texts (
  key text primary key check (key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$' and length(key) <= 80),
  value text not null check (length(btrim(value)) between 1 and 1200),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
);
create trigger page_texts_touch before update on public.page_texts
  for each row execute function public.touch_updated();

alter table public.page_texts enable row level security;

-- Public site wording: anyone may read; only staff may change it.
grant select (key, value, updated_at) on public.page_texts to anon;
grant select, insert, update, delete on public.page_texts to authenticated;
create policy page_texts_public_read on public.page_texts for select to anon using (true);
create policy page_texts_staff_read on public.page_texts for select to authenticated using (public.is_staff());
create policy page_texts_staff_insert on public.page_texts for insert to authenticated with check (public.is_staff());
create policy page_texts_staff_update on public.page_texts for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy page_texts_staff_delete on public.page_texts for delete to authenticated using (public.is_staff());

-- Version token for a set of keys (one admin page). Changes whenever any of them
-- is added, changed or removed.
create or replace function public.page_texts_version(p_keys text[])
returns text
language sql stable security invoker set search_path = ''
as $$
  select coalesce(md5(string_agg(t.key || '@' || t.updated_at::text, '|' order by t.key)), 'none')
  from public.page_texts t
  where t.key = any (p_keys);
$$;

-- Current overrides and version for one admin page, read in one snapshot so the
-- editor never pairs old values with a newer version.
create or replace function public.page_texts_load(p_keys text[])
returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'version', public.page_texts_version(p_keys),
    'rows', coalesce((select jsonb_object_agg(t.key, t.value) from public.page_texts t where t.key = any (p_keys)), '{}'::jsonb)
  );
$$;

-- Save one admin page atomically: check the version under a lock, then delete and
-- upsert. SECURITY INVOKER, so the caller's RLS rights still apply.
create or replace function public.save_page_texts(p_keys text[], p_version text, p_set jsonb, p_delete text[])
returns text
language plpgsql security invoker set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'not_staff' using errcode = '42501';
  end if;
  if exists (select 1 from jsonb_object_keys(p_set) k where not (k = any (p_keys)))
     or exists (select 1 from unnest(p_delete) d where not (d = any (p_keys))) then
    raise exception 'key_outside_page' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext('public.page_texts'));
  if public.page_texts_version(p_keys) is distinct from p_version then
    raise exception 'stale_version' using errcode = '40001';
  end if;
  delete from public.page_texts where key = any (p_delete);
  insert into public.page_texts (key, value)
    select e.key, e.value from jsonb_each_text(p_set) e
    on conflict (key) do update set value = excluded.value;
  return public.page_texts_version(p_keys);
end;
$$;

revoke all on function public.page_texts_version(text[]) from public, anon;
revoke all on function public.page_texts_load(text[]) from public, anon;
revoke all on function public.save_page_texts(text[], text, jsonb, text[]) from public, anon;
grant execute on function public.page_texts_version(text[]) to authenticated;
grant execute on function public.page_texts_load(text[]) to authenticated;
grant execute on function public.save_page_texts(text[], text, jsonb, text[]) to authenticated;
