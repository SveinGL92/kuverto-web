-- Kuverto fase 2 (kjørt 29.10.2026). Datamodellen følger lib/types.ts. Beløp i øre, e-post med små bokstaver.
-- RLS er på for alle tabeller. Klienter får bare lese postnummer. Alt annet går via serveren med secret key.

create table public.postnummer (
  postnummer text primary key check (postnummer ~ '^\d{4}$'),
  poststed text not null,
  kommunenr text not null,
  kommunenavn text not null,
  fylkesnr text generated always as (left(kommunenr, 2)) stored
);
create index on public.postnummer (kommunenr);

create table public.admins (epost text primary key check (epost = lower(epost)));

create table public.leverandorer (
  id uuid primary key default gen_random_uuid(),
  navn text not null,
  orgnr text not null unique check (orgnr ~ '^\d{9}$'),
  epost text not null unique check (epost = lower(epost)),
  kontaktperson text not null,
  telefon text,
  nettside text,
  beskrivelse text,
  status text not null default 'venter' check (status in ('venter','godkjent','avvist','suspendert')),
  dekning_visning text not null default '',
  markedsforing_samtykke boolean not null default false,
  opprettet timestamptz not null default now(),
  godkjent timestamptz
);

create table public.dekning (
  leverandor_id uuid not null references public.leverandorer(id) on delete cascade,
  kommunenr text not null,
  primary key (leverandor_id, kommunenr)
);
create index on public.dekning (kommunenr);

create table public.foresporsler (
  id uuid primary key default gen_random_uuid(),
  kunde_epost text not null check (kunde_epost = lower(kunde_epost)),
  status text not null default 'aktiv' check (status in ('utkast','til_godkjenning','aktiv','tildelt','lukket','trukket','avvist')),
  anledning text not null check (anledning in ('firmalunsj','motemat','julebord','bryllup','konfirmasjon','minnesamvaer','privat_fest','annet')),
  gjester integer not null check (gjester between 1 and 9999),
  dato date,
  klokkeslett text not null check (klokkeslett ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  varighet text not null default '',
  fleksibel_dato boolean not null default false,
  postnummer text not null references public.postnummer(postnummer),
  poststed text not null,
  kommunenr text not null,
  fylkesnr text not null,
  levering text not null check (levering in ('levering','henting')),
  servering text not null check (servering in ('levert_ferdig','buffet_oppsett','servert_bordet','fingermat')),
  kosthold jsonb not null default '[]'::jsonb,
  budsjett text not null check (budsjett in ('under_250','250_400','400_600','over_600','vet_ikke')),
  maks_leverandorer integer not null default 5,
  klipp_pris integer not null check (klipp_pris > 0),
  omrade_visning text not null,
  opprettet timestamptz not null default now(),
  check (dato is not null or fleksibel_dato)
);
create index on public.foresporsler (kommunenr, status);
create index on public.foresporsler (kunde_epost);

create table public.foresporsel_kontakt (
  foresporsel_id uuid primary key references public.foresporsler(id) on delete cascade,
  navn text not null,
  firma text,
  epost text not null check (epost = lower(epost)),
  telefon text,
  adresse text,
  melding text check (char_length(melding) <= 1000)
);

create table public.opplasinger (
  id uuid primary key default gen_random_uuid(),
  foresporsel_id uuid not null references public.foresporsler(id) on delete cascade,
  leverandor_id uuid not null references public.leverandorer(id) on delete cascade,
  metode text not null default 'klipp' check (metode in ('klipp','kort','admin')),
  klipp integer not null,
  status text not null default 'aktiv' check (status in ('aktiv','refundert','trukket')),
  svarfrist date,
  opprettet timestamptz not null default now(),
  unique (foresporsel_id, leverandor_id)
);

create table public.klipp_transaksjoner (
  id uuid primary key default gen_random_uuid(),
  leverandor_id uuid not null references public.leverandorer(id) on delete cascade,
  endring integer not null,
  grunn text not null check (grunn in ('kjop','opplasing','refusjon','gratis','admin')),
  referanse text unique,
  opprettet timestamptz not null default now()
);
create index on public.klipp_transaksjoner (leverandor_id);

create table public.tilbud (
  id uuid primary key default gen_random_uuid(),
  foresporsel_id uuid not null references public.foresporsler(id) on delete cascade,
  leverandor_id uuid not null references public.leverandorer(id) on delete cascade,
  pris_per_kuvert integer not null check (pris_per_kuvert > 0),
  total_inkl_mva integer not null check (total_inkl_mva > 0),
  meny text not null check (char_length(meny) <= 2000),
  kosthold_dekket boolean not null default false,
  kosthold_tekst text not null default '',
  kosthold_merknad text,
  levering_inkludert boolean not null default true,
  levering_pris integer,
  oppsett_og_rydding boolean not null default false,
  servise text not null default '',
  gyldig_til date not null,
  betingelser text check (char_length(betingelser) <= 1000),
  status text not null default 'sendt' check (status in ('sendt','endret','godtatt','avslatt','trukket','utlopt')),
  opprettet timestamptz not null default now(),
  unique (foresporsel_id, leverandor_id)
);

create table public.meldinger (
  id uuid primary key default gen_random_uuid(),
  foresporsel_id uuid not null references public.foresporsler(id) on delete cascade,
  leverandor_id uuid not null references public.leverandorer(id) on delete cascade,
  fra text not null check (fra in ('kunde','leverandor')),
  tekst text not null check (char_length(tekst) between 1 and 2000),
  opprettet timestamptz not null default now()
);
create index on public.meldinger (foresporsel_id);

alter table public.postnummer enable row level security;
alter table public.admins enable row level security;
alter table public.leverandorer enable row level security;
alter table public.dekning enable row level security;
alter table public.foresporsler enable row level security;
alter table public.foresporsel_kontakt enable row level security;
alter table public.opplasinger enable row level security;
alter table public.klipp_transaksjoner enable row level security;
alter table public.tilbud enable row level security;
alter table public.meldinger enable row level security;
create policy "postnummer er offentlig" on public.postnummer for select to anon, authenticated using (true);

create or replace function public.klippsaldo(p_leverandor uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(endring), 0)::int from klipp_transaksjoner where leverandor_id = p_leverandor;
$$;

create or replace function public.las_opp(p_foresporsel uuid, p_leverandor uuid)
returns text language plpgsql security definer set search_path = public as $$
declare f foresporsler%rowtype; l leverandorer%rowtype; antall int; saldo int;
begin
  select * into f from foresporsler where id = p_foresporsel for update;
  if not found then return 'finnes_ikke'; end if;
  if f.status <> 'aktiv' then return 'ikke_aktiv'; end if;
  select * into l from leverandorer where id = p_leverandor for update;
  if not found or l.status <> 'godkjent' then return 'ikke_godkjent'; end if;
  if not exists (select 1 from dekning where leverandor_id = l.id and kommunenr = f.kommunenr) then return 'utenfor_dekning'; end if;
  if exists (select 1 from opplasinger where foresporsel_id = f.id and leverandor_id = l.id) then return 'allerede'; end if;
  select count(*) into antall from opplasinger where foresporsel_id = f.id and status = 'aktiv';
  if antall >= f.maks_leverandorer then return 'full'; end if;
  saldo := klippsaldo(l.id);
  if saldo < f.klipp_pris then return 'for_lite'; end if;
  insert into opplasinger (foresporsel_id, leverandor_id, metode, klipp, svarfrist)
    values (f.id, l.id, 'klipp', f.klipp_pris, (now() at time zone 'Europe/Oslo')::date + 2);
  insert into klipp_transaksjoner (leverandor_id, endring, grunn, referanse)
    values (l.id, -f.klipp_pris, 'opplasing', 'opplasing:' || f.id || ':' || l.id);
  return 'ok';
end $$;

create or replace function public.velg_tilbud(p_tilbud uuid, p_epost text, p_adresse text)
returns text language plpgsql security definer set search_path = public as $$
declare t tilbud%rowtype; f foresporsler%rowtype;
begin
  select * into t from tilbud where id = p_tilbud;
  if not found then return 'finnes_ikke'; end if;
  select * into f from foresporsler where id = t.foresporsel_id for update;
  if f.kunde_epost <> lower(p_epost) then return 'ikke_din'; end if;
  if f.status <> 'aktiv' then return 'ikke_aktiv'; end if;
  if t.status not in ('sendt','endret') then return 'ikke_gyldig'; end if;
  if t.gyldig_til < (now() at time zone 'Europe/Oslo')::date then return 'utlopt'; end if;
  update tilbud set status = 'godtatt' where id = t.id;
  update tilbud set status = 'avslatt' where foresporsel_id = f.id and id <> t.id and status in ('sendt','endret');
  update foresporsler set status = 'tildelt' where id = f.id;
  update foresporsel_kontakt set adresse = nullif(trim(p_adresse), '') where foresporsel_id = f.id;
  return 'ok';
end $$;

revoke all on function public.klippsaldo(uuid) from public, anon, authenticated;
revoke all on function public.las_opp(uuid, uuid) from public, anon, authenticated;
revoke all on function public.velg_tilbud(uuid, text, text) from public, anon, authenticated;
grant execute on function public.klippsaldo(uuid) to service_role;
grant execute on function public.las_opp(uuid, uuid) to service_role;
grant execute on function public.velg_tilbud(uuid, text, text) to service_role;

insert into public.admins (epost) values ('s.lierstuen@gmail.com'), ('hei@kuverto.no');
-- Postnumrene for Oslo og Akershus ble lastet inn separat (959 rader fra Postens register via npm-pakken «postnummer»).
