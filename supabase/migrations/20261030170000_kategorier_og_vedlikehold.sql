-- Flere kategorier (anledninger og mattyper).
alter table public.foresporsler drop constraint if exists foresporsler_anledning_check;
alter table public.foresporsler add constraint foresporsler_anledning_check check (anledning in (
  'firmalunsj','motemat','julebord','bryllup','konfirmasjon','minnesamvaer','privat_fest',
  'sommerfest','dap','jubileum','kurs_konferanse',
  'kaker_bakst','frokost','fingermat','buffet','grill','vegetar_vegansk',
  'annet'));

-- Daglig vedlikehold:
-- 1) Klipp refunderes når kunden ikke har svart på et tilbud innen 7 dager (ikke valgt, avslått eller skrevet til leverandøren).
--    Opplåsingen beholdes, så leverandøren fortsatt kan se forespørselen og svare kunden.
-- 2) Forespørsler som aldri ble bekreftet, slettes etter 7 dager.
create or replace function public.daglig_vedlikehold()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  antall_ref int := 0;
  antall_slettet int := 0;
  o record;
begin
  for o in
    select op.id, op.leverandor_id, op.klipp
    from opplasinger op
    join foresporsler f on f.id = op.foresporsel_id
    join tilbud t on t.foresporsel_id = op.foresporsel_id and t.leverandor_id = op.leverandor_id
    where op.status = 'aktiv'
      and f.status = 'aktiv'
      and t.status in ('sendt', 'endret')
      and t.opprettet < now() - interval '7 days'
      and not exists (
        select 1 from meldinger m
        where m.foresporsel_id = op.foresporsel_id and m.leverandor_id = op.leverandor_id and m.fra = 'kunde')
  loop
    insert into klipp_transaksjoner (leverandor_id, endring, grunn, referanse)
    values (o.leverandor_id, o.klipp, 'refusjon', 'refusjon-7d:' || o.id)
    on conflict (referanse) do nothing;
    if found then antall_ref := antall_ref + 1; end if;
  end loop;

  delete from foresporsler where status = 'venter_bekreftelse' and opprettet < now() - interval '7 days';
  get diagnostics antall_slettet = row_count;

  return jsonb_build_object('refundert', antall_ref, 'slettet', antall_slettet);
end $$;
revoke all on function public.daglig_vedlikehold() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'kuverto-daglig';
select cron.schedule('kuverto-daglig', '15 2 * * *', $$select public.daglig_vedlikehold()$$);
