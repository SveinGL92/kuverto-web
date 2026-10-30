-- Når kunden trekker forespørselen (eller Kuverto avviser den), får alle som har låst opp klippene tilbake,
-- også de som har sendt tilbud. Er klippene allerede refundert etter 7-dagersregelen, skjer det ikke to ganger.
create or replace function public.refunder_opplasinger(p_foresporsel uuid)
returns int
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  o record;
  n int := 0;
begin
  for o in select op.id, op.leverandor_id, op.klipp from opplasinger op where op.foresporsel_id = p_foresporsel and op.status = 'aktiv'
  loop
    if not exists (select 1 from klipp_transaksjoner where referanse = 'refusjon-7d:' || o.id) then
      insert into klipp_transaksjoner (leverandor_id, endring, grunn, referanse)
        values (o.leverandor_id, o.klipp, 'refusjon', 'refusjon:' || o.id) on conflict (referanse) do nothing;
      if found then n := n + 1; end if;
    end if;
    update opplasinger set status = 'refundert' where id = o.id;
  end loop;
  return n;
end $$;
revoke all on function public.refunder_opplasinger(uuid) from public, anon, authenticated;

create or replace function public.trekk_foresporsel(p_foresporsel uuid, p_epost text)
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  f foresporsler%rowtype;
begin
  select * into f from foresporsler where id = p_foresporsel for update;
  if not found or f.kunde_epost <> lower(p_epost) then return 'finnes_ikke'; end if;
  if f.status not in ('aktiv','venter_bekreftelse') then return 'ikke_aktiv'; end if;
  update foresporsler set status = 'trukket' where id = f.id;
  perform refunder_opplasinger(f.id);
  return 'ok';
end $$;
revoke all on function public.trekk_foresporsel(uuid, text) from public, anon, authenticated;
grant execute on function public.refunder_opplasinger(uuid) to service_role;
grant execute on function public.trekk_foresporsel(uuid, text) to service_role;
