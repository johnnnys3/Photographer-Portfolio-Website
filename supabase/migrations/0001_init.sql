-- Schema for the portfolio site, inferred from src/content/data.ts, src/components/admin/*,
-- app/api/send-email and app/api/revalidate. Run once in the Supabase SQL editor.
-- After running: create your admin user (Authentication -> Users -> Add user), then run
--   insert into public.admin_users (email) values ('you@example.com');

-- ---------------------------------------------------------------- admin allow-list
create table if not exists public.admin_users (
  email  text primary key,
  role   text not null default 'admin',
  active boolean not null default true
);
alter table public.admin_users enable row level security; -- no policies: read only through is_admin()

-- True when the signed-in user's email is an active admin. Used by RLS and by /api/revalidate.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where active and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- galleries (projects)
create table if not exists public.galleries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text unique,
  client     text,
  category   text check (category in ('portraits','editorial','events','commercial','landscapes')),
  location   text,
  shot_date  date,
  camera     text,
  story      text,
  scope      text[] not null default '{}',
  links      jsonb  not null default '[]',
  featured   boolean not null default false,
  published  boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.galleries enable row level security;
create policy galleries_read  on public.galleries for select using (published or public.is_admin());
create policy galleries_write on public.galleries for all    using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- images (photos)
create table if not exists public.images (
  id              uuid primary key default gen_random_uuid(),
  filename        text not null,
  url             text not null,
  title           text not null,
  description     text,
  tags            text[] not null default '{}',
  gallery         text not null references public.galleries(name) on update cascade on delete cascade,
  role            text not null default 'gallery' check (role in ('cover','hover','hero','gallery')),
  layout          text check (layout in ('portrait','wide','full')),
  category        text check (category in ('portraits','editorial','events','commercial','landscapes')),
  alt             text,
  exif            jsonb,
  width           integer,
  height          integer,
  sort_order      integer not null default 0,
  photographer_id uuid references auth.users(id) on delete set null,
  uploaded_at     timestamptz not null default now()
);
create index if not exists images_gallery_idx on public.images (gallery, sort_order);
alter table public.images enable row level security;
-- Visitors see photos of published projects only (the galleries policy filters the subquery).
create policy images_read on public.images for select using (
  public.is_admin() or exists (select 1 from public.galleries g where g.name = images.gallery)
);
create policy images_write on public.images for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- site_content (editable pages)
create table if not exists public.site_content (
  section      text primary key,
  content      jsonb not null default '{}',
  content_type text not null default 'json',
  updated_at   timestamptz not null default now()
);
alter table public.site_content enable row level security;
create policy site_content_read  on public.site_content for select using (true);
create policy site_content_write on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- enquiries (contact form)
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name)  <= 120),
  email       text not null check (char_length(email) <= 254),
  phone       text check (char_length(phone)  <= 40),
  need        text check (char_length(need)   <= 60),
  budget      text check (char_length(budget) <= 60),
  wanted_date text check (char_length(wanted_date) <= 40),
  message     text check (char_length(message) <= 5000),
  handled     boolean not null default false
);
alter table public.enquiries enable row level security;
create policy enquiries_insert on public.enquiries for insert to anon, authenticated with check (true);
create policy enquiries_admin  on public.enquiries for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 15728640, array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict (id) do nothing;

-- Public buckets serve files without a read policy; writes are admin-only.
create policy images_bucket_insert on storage.objects for insert with check (bucket_id = 'images' and public.is_admin());
create policy images_bucket_update on storage.objects for update using (bucket_id = 'images' and public.is_admin());
create policy images_bucket_delete on storage.objects for delete using (bucket_id = 'images' and public.is_admin());

-- Admin Storage panel lists files through this (it cannot select from storage.objects directly).
create or replace function public.admin_storage_objects()
returns table (name text, size bigint)
language plpgsql stable security definer set search_path = public, storage
as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query select o.name, coalesce((o.metadata ->> 'size')::bigint, 0) from storage.objects o where o.bucket_id = 'images';
end;
$$;
grant execute on function public.admin_storage_objects() to authenticated;
