-- Vedlegg og menylenke på tilbud, lesestatus på meldinger (chat på Kuverto).
alter table public.tilbud add column if not exists meny_url text check (meny_url is null or meny_url ~* '^https?://'),
  add column if not exists vedlegg jsonb not null default '[]'::jsonb;
alter table public.meldinger add column if not exists lest timestamptz;
create index if not exists meldinger_samtale on public.meldinger (foresporsel_id, leverandor_id, opprettet);

-- Privat bøtte. Opplasting via signerte URL-er fra serveren, nedlasting via signerte URL-er.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vedlegg', 'vedlegg', false, 10485760,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
