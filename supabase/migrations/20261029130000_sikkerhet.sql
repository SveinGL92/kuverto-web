-- Etter sikkerhetsgjennomgang 29.10.2026.

-- 1. Forespørsler bekreftes på e-post før leverandørene varsles (stopper spam og skrivefeil i e-post).
alter table public.foresporsler drop constraint if exists foresporsler_status_check;
alter table public.foresporsler add constraint foresporsler_status_check
  check (status in ('utkast','venter_bekreftelse','til_godkjenning','aktiv','tildelt','lukket','trukket','avvist'));
alter table public.foresporsler add column if not exists bekreft_token text unique;
alter table public.foresporsler add column if not exists ip_hash text;
create index if not exists foresporsler_ip_idx on public.foresporsler (ip_hash, opprettet);

-- 2. Flere ventende registreringer på samme org.nr. er lov. Bare én kan være godkjent.
alter table public.leverandorer drop constraint if exists leverandorer_orgnr_key;
create unique index if not exists leverandorer_orgnr_godkjent on public.leverandorer (orgnr) where status = 'godkjent';

-- 3. Trekk forespørsel atomisk. Refunderer bare opplåsinger uten tilbud.
create or replace function public.trekk_foresporsel(p_foresporsel uuid, p_epost text)
returns text language plpgsql security definer set search_path = public as $$
declare
  f foresporsler%rowtype;
  o record;
begin
  select * into f from foresporsler where id = p_foresporsel for update;
  if not found or f.kunde_epost <> lower(p_epost) then return 'finnes_ikke'; end if;
  if f.status not in ('aktiv','venter_bekreftelse') then return 'ikke_aktiv'; end if;
  update foresporsler set status = 'trukket' where id = f.id;
  for o in select op.id, op.leverandor_id, op.klipp from opplasinger op
           where op.foresporsel_id = f.id and op.status = 'aktiv'
             and not exists (select 1 from tilbud t where t.foresporsel_id = f.id and t.leverandor_id = op.leverandor_id)
  loop
    insert into klipp_transaksjoner (leverandor_id, endring, grunn, referanse)
      values (o.leverandor_id, o.klipp, 'refusjon', 'refusjon:' || o.id) on conflict (referanse) do nothing;
    update opplasinger set status = 'refundert' where id = o.id;
  end loop;
  return 'ok';
end $$;
revoke all on function public.trekk_foresporsel(uuid, text) from public, anon, authenticated;
grant execute on function public.trekk_foresporsel(uuid, text) to service_role;
