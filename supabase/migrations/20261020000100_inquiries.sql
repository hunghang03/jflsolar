-- Website inquiries saved for staff (Admin → Inquiries). Rows are written only by
-- the server with the secret (service-role) key after the form's spam checks;
-- the public has no access at all. Safe to run once on an existing project.

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Hash of the form token + values: a resubmitted form is stored once.
  submission_key text not null unique check (submission_key ~ '^[0-9a-f]{48}$'),
  name text not null check (length(name) between 1 and 100),
  phone text check (phone is null or length(phone) <= 30),
  email text check (email is null or length(email) <= 254),
  inquiry_type text not null check (length(inquiry_type) between 1 and 40),
  location text check (location is null or length(location) <= 120),
  bill_range text check (bill_range is null or length(bill_range) <= 20),
  item_label text check (item_label is null or length(item_label) <= 300),
  message text not null check (length(message) between 1 and 3000),
  status text not null default 'new' check (status in ('new', 'handled', 'archived')),
  staff_notes text check (staff_notes is null or length(staff_notes) <= 4000),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  check (phone is not null or email is not null)
);
create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create trigger inquiries_touch before update on public.inquiries
  for each row execute function public.touch_updated();

alter table public.inquiries enable row level security;

-- Staff read them, change only the status and notes, and may delete archived ones.
-- New tables inherit Supabase's broad default privileges: remove them first, then
-- grant only what is needed. No grants to anon: visitors cannot read or write inquiries.
revoke all on public.inquiries from anon, authenticated;
grant select, delete on public.inquiries to authenticated;
grant update (status, staff_notes) on public.inquiries to authenticated;
grant select, insert on public.inquiries to service_role;
create policy inquiries_staff_read on public.inquiries for select to authenticated using (public.is_staff());
create policy inquiries_staff_update on public.inquiries for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy inquiries_staff_delete on public.inquiries for delete to authenticated using (public.is_staff() and status = 'archived');

-- Same tightening for page_texts (20261019000100), which was created after the
-- initial blanket revoke: keep exactly the grants that migration intended.
revoke all on public.page_texts from anon, authenticated;
grant select (key, value, updated_at) on public.page_texts to anon;
grant select, insert, update, delete on public.page_texts to authenticated;
