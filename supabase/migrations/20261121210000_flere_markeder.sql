-- Flere markeder: Sverige (se), Danmark (dk) og Finland (fi) i tillegg til Norge (no).
-- Postnumre lagres per marked. Kommunenumre utenfor Norge har landprefiks: se1276, dk615, fi091.

alter table public.postnummer add column if not exists marked text not null default 'no';
alter table public.postnummer drop constraint if exists postnummer_postnummer_check;
alter table public.postnummer add constraint postnummer_postnummer_check check (postnummer ~ '^\d{4,5}$');
alter table public.foresporsler drop constraint if exists foresporsler_postnummer_fkey;
alter table public.postnummer drop constraint if exists postnummer_pkey;
alter table public.postnummer add constraint postnummer_pkey primary key (marked, postnummer);
-- fylkesnr var generert fra kommunenummeret og passer ikke for andre land.
alter table public.postnummer drop column if exists fylkesnr;
alter table public.postnummer add column fylkesnr text;
update public.postnummer set fylkesnr = left(kommunenr, 2) where marked = 'no';

alter table public.foresporsler add column if not exists marked text not null default 'no';
alter table public.foresporsler add constraint foresporsler_marked_check check (marked in ('no','se','dk','fi'));
alter table public.foresporsler add constraint foresporsler_postnummer_fkey foreign key (marked, postnummer) references public.postnummer (marked, postnummer);

alter table public.leverandorer add column if not exists marked text not null default 'no';
alter table public.leverandorer add constraint leverandorer_marked_check check (marked in ('no','se','dk','fi'));
alter table public.leverandorer add column if not exists mva_nummer text;
alter table public.leverandorer drop constraint if exists leverandorer_orgnr_check;
alter table public.leverandorer add constraint leverandorer_orgnr_check check (orgnr ~ '^\d{8,10}$');
drop index if exists public.leverandorer_orgnr_godkjent;
create unique index leverandorer_orgnr_godkjent on public.leverandorer (marked, orgnr) where status = 'godkjent';

alter table public.kommuner add column if not exists marked text not null default 'no';
alter table public.kommuner drop constraint if exists kommuner_kommunenr_check;
alter table public.kommuner add constraint kommuner_kommunenr_check check (kommunenr ~ '^(\d{4}|se\d{4}|dk\d{3}|fi\d{3})$');

-- Leverandører kan bare låse opp forespørsler i eget marked.
create or replace function public.las_opp(p_foresporsel uuid, p_leverandor uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  f foresporsler%rowtype;
  l leverandorer%rowtype;
  antall int;
  saldo int;
begin
  select * into f from foresporsler where id = p_foresporsel for update;
  if not found then return 'finnes_ikke'; end if;
  if f.status <> 'aktiv' then return 'ikke_aktiv'; end if;
  select * into l from leverandorer where id = p_leverandor for update;
  if not found or l.status <> 'godkjent' then return 'ikke_godkjent'; end if;
  if l.marked <> f.marked then return 'utenfor_dekning'; end if;
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
revoke all on function public.las_opp(uuid, uuid) from public, anon, authenticated;
grant execute on function public.las_opp(uuid, uuid) to service_role;
