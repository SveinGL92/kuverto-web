import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { anledningNavn } from '@/lib/labels';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';
import { godkjennLeverandor, giKlipp, settForesporselStatus, settLeverandorStatus } from './actions';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const dt = (iso: string) => new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' });
const knapp = 'min-h-touch rounded-pill border-[1.5px] border-border-input bg-surface px-4 text-[15px] font-bold hover:border-primary';

export default async function Admin() {
  const epost = await innloggetEpost();
  if (!epost) redirect('/logg-inn');
  if (!(await erAdmin(epost))) redirect('/min-side');
  const s = db();
  const [{ data: lev }, { data: forsp }, { data: trans }, { data: oppl }, { data: tilb }] = await Promise.all([
    s.from('leverandorer').select('*').order('opprettet', { ascending: false }),
    s.from('foresporsler').select('id, anledning, gjester, dato, poststed, status, opprettet, kunde_epost, klipp_pris').order('opprettet', { ascending: false }).limit(100),
    s.from('klipp_transaksjoner').select('leverandor_id, endring'),
    s.from('opplasinger').select('foresporsel_id'),
    s.from('tilbud').select('foresporsel_id, status'),
  ]);
  const saldo = new Map<string, number>();
  for (const t of trans ?? []) saldo.set(t.leverandor_id, (saldo.get(t.leverandor_id) ?? 0) + t.endring);
  const antallOppl = new Map<string, number>();
  for (const o of oppl ?? []) antallOppl.set(o.foresporsel_id, (antallOppl.get(o.foresporsel_id) ?? 0) + 1);
  const antallTilb = new Map<string, number>();
  for (const t of tilb ?? []) antallTilb.set(t.foresporsel_id, (antallTilb.get(t.foresporsel_id) ?? 0) + 1);
  const venter = (lev ?? []).filter((l) => l.status === 'venter');
  const andre = (lev ?? []).filter((l) => l.status !== 'venter');

  return (
    <main id="innhold" className="k-wrap flex flex-col gap-10 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="k-heading m-0 text-h1">Admin</h1>
        <div className="flex items-center gap-3 text-[15px]">
          <Link href="/">Til forsiden</Link>
          <form action="/logg-ut" method="post">
            <button className={knapp}>Logg ut</button>
          </form>
        </div>
      </div>

      <section aria-labelledby="venter" className="flex flex-col gap-4">
        <h2 id="venter" className="k-heading m-0 text-h2">
          Leverandører som venter ({venter.length})
        </h2>
        {venter.length === 0 && <p className="m-0 text-text-muted">Ingen venter på godkjenning.</p>}
        {venter.map((l) => (
          <article key={l.id} className="flex flex-col gap-3 rounded-card bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="m-0 text-xl font-bold">{l.navn}</h3>
              <span className="text-small text-text-muted">Registrert {dt(l.opprettet)}</span>
            </div>
            <p className="m-0 text-[15px] leading-normal">
              Org.nr.{' '}
              <a href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${l.orgnr}`} target="_blank" rel="noopener">
                {l.orgnr}
              </a>{' '}
              · {l.kontaktperson} · <a href={`mailto:${l.epost}`}>{l.epost}</a>
              {l.telefon ? ` · ${l.telefon}` : ''}
              {l.nettside ? (
                <>
                  {' '}
                  ·{' '}
                  <a href={l.nettside.startsWith('http') ? l.nettside : `https://${l.nettside}`} target="_blank" rel="noopener">
                    nettside
                  </a>
                </>
              ) : null}
            </p>
            <p className="m-0 text-[15px] text-text-muted">Dekning: {l.dekning_visning}</p>
            {l.beskrivelse && <p className="m-0 text-[15px]">{l.beskrivelse}</p>}
            <div className="flex flex-wrap gap-2">
              <form action={godkjennLeverandor.bind(null, l.id)}>
                <button className="min-h-touch rounded-pill bg-primary px-5 text-[15px] font-bold text-primary-on">Godkjenn og gi gratis klipp</button>
              </form>
              <form action={settLeverandorStatus.bind(null, l.id, 'avvist')}>
                <button className={knapp}>Avvis</button>
              </form>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="foresporsler" className="flex flex-col gap-4">
        <h2 id="foresporsler" className="k-heading m-0 text-h2">
          Forespørsler ({forsp?.length ?? 0})
        </h2>
        <div className="relative overflow-x-auto rounded-card bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
            <thead className="text-small text-text-muted">
              <tr className="border-b border-border">
                <th scope="col" className="p-3">Mottatt</th>
                <th scope="col" className="p-3">Anledning</th>
                <th scope="col" className="p-3">Sted</th>
                <th scope="col" className="p-3">Dato</th>
                <th scope="col" className="p-3">Kunde</th>
                <th scope="col" className="p-3">Opplåst / tilbud</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3"><span className="sr-only">Handling</span></th>
              </tr>
            </thead>
            <tbody>
              {(forsp ?? []).map((f) => (
                <tr key={f.id} className="border-b border-border last:border-0">
                  <td className="p-3">{dt(f.opprettet)}</td>
                  <td className="p-3 font-semibold">
                    {anledningNavn(f.anledning as Anledning)} · {f.gjester}
                  </td>
                  <td className="p-3">{f.poststed}</td>
                  <td className="p-3">{f.dato ?? 'fleksibel'}</td>
                  <td className="p-3">{f.kunde_epost}</td>
                  <td className="k-num p-3">
                    {antallOppl.get(f.id) ?? 0} / {antallTilb.get(f.id) ?? 0}
                  </td>
                  <td className="p-3">
                    <Badge tone={f.status === 'aktiv' ? 'ny' : 'opplast'}>{f.status}</Badge>
                  </td>
                  <td className="p-3">
                    {f.status === 'aktiv' ? (
                      <form action={settForesporselStatus.bind(null, f.id, 'avvist')}>
                        <button className="text-[15px] font-semibold text-error underline">Avvis</button>
                      </form>
                    ) : f.status === 'avvist' ? (
                      <form action={settForesporselStatus.bind(null, f.id, 'aktiv')}>
                        <button className="text-[15px] font-semibold underline">Aktiver</button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="leverandorer" className="flex flex-col gap-4">
        <h2 id="leverandorer" className="k-heading m-0 text-h2">
          Leverandører ({andre.length})
        </h2>
        <div className="relative overflow-x-auto rounded-card bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
            <thead className="text-small text-text-muted">
              <tr className="border-b border-border">
                <th scope="col" className="p-3">Navn</th>
                <th scope="col" className="p-3">E-post</th>
                <th scope="col" className="p-3">Dekning</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Klipp</th>
                <th scope="col" className="p-3"><span className="sr-only">Handlinger</span></th>
              </tr>
            </thead>
            <tbody>
              {andre.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-semibold">{l.navn}</td>
                  <td className="p-3">{l.epost}</td>
                  <td className="p-3">{l.dekning_visning}</td>
                  <td className="p-3">{l.status}</td>
                  <td className="k-num p-3">{saldo.get(l.id) ?? 0}</td>
                  <td className="flex flex-wrap gap-3 p-3">
                    <form action={giKlipp.bind(null, l.id, 10)}>
                      <button className="text-[15px] font-semibold underline">+10 klipp</button>
                    </form>
                    {l.status === 'godkjent' ? (
                      <form action={settLeverandorStatus.bind(null, l.id, 'suspendert')}>
                        <button className="text-[15px] font-semibold text-error underline">Suspender</button>
                      </form>
                    ) : (
                      <form action={godkjennLeverandor.bind(null, l.id)}>
                        <button className="text-[15px] font-semibold underline">Godkjenn</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
