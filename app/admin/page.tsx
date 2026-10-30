import type { Metadata } from 'next';
import Link from 'next/link';
import { anledningNavn } from '@/lib/labels';
import { dt, foresporselStatus, klippGrunn, kr, kravAdminSide, leverandorStatus, tilbudStatus } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';
import { bekreftForKunde, godkjennLeverandor, settLeverandorStatus } from './actions';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const knapp = 'min-h-touch rounded-pill border-[1.5px] border-border-input bg-surface px-4 text-[15px] font-bold hover:border-primary';

interface Hendelse {
  tid: string;
  tekst: string;
  lenke: string;
}

export default async function Admin() {
  await kravAdminSide();
  const s = db();
  const [{ data: lev }, { data: forsp }, { data: trans }, { data: oppl }, { data: tilb }, { data: meld }, { data: kont }] = await Promise.all([
    s.from('leverandorer').select('*').order('opprettet', { ascending: false }),
    s.from('foresporsler').select('id, anledning, gjester, dato, poststed, status, opprettet, kunde_epost, klipp_pris').order('opprettet', { ascending: false }).limit(200),
    s.from('klipp_transaksjoner').select('leverandor_id, endring, grunn, opprettet, referanse').order('opprettet', { ascending: false }),
    s.from('opplasinger').select('foresporsel_id, leverandor_id, klipp, opprettet').order('opprettet', { ascending: false }),
    s.from('tilbud').select('foresporsel_id, leverandor_id, status, pris_per_kuvert, opprettet').order('opprettet', { ascending: false }),
    s.from('meldinger').select('foresporsel_id, leverandor_id, fra, opprettet').order('opprettet', { ascending: false }).limit(100),
    s.from('foresporsel_kontakt').select('foresporsel_id, navn, firma'),
  ]);
  const levNavn = new Map((lev ?? []).map((l) => [l.id, l.navn as string]));
  const fInfo = new Map((forsp ?? []).map((f) => [f.id, `${anledningNavn(f.anledning as Anledning)} for ${f.gjester} i ${f.poststed}`]));
  const kunde = new Map((kont ?? []).map((k) => [k.foresporsel_id, [k.navn, k.firma].filter(Boolean).join(', ')]));

  const saldo = new Map<string, number>();
  for (const t of trans ?? []) saldo.set(t.leverandor_id, (saldo.get(t.leverandor_id) ?? 0) + t.endring);
  const antallOppl = new Map<string, number>();
  for (const o of oppl ?? []) antallOppl.set(o.foresporsel_id, (antallOppl.get(o.foresporsel_id) ?? 0) + 1);
  const antallTilb = new Map<string, number>();
  for (const t of tilb ?? []) antallTilb.set(t.foresporsel_id, (antallTilb.get(t.foresporsel_id) ?? 0) + 1);
  const venter = (lev ?? []).filter((l) => l.status === 'venter');
  const andre = (lev ?? []).filter((l) => l.status !== 'venter');
  const klippSolgt = (trans ?? []).filter((t) => t.grunn === 'kjop').reduce((sum, t) => sum + t.endring, 0);

  const tall = [
    { navn: 'Aktive forespørsler', verdi: (forsp ?? []).filter((f) => f.status === 'aktiv').length },
    { navn: 'Venter på bekreftelse', verdi: (forsp ?? []).filter((f) => f.status === 'venter_bekreftelse').length },
    { navn: 'Tildelt', verdi: (forsp ?? []).filter((f) => f.status === 'tildelt').length },
    { navn: 'Godkjente leverandører', verdi: (lev ?? []).filter((l) => l.status === 'godkjent').length },
    { navn: 'Opplåsinger', verdi: oppl?.length ?? 0 },
    { navn: 'Tilbud', verdi: tilb?.length ?? 0 },
    { navn: 'Klipp solgt', verdi: klippSolgt },
  ];

  const hendelser: Hendelse[] = [
    ...(forsp ?? []).map((f) => ({ tid: f.opprettet, tekst: `Ny forespørsel: ${fInfo.get(f.id)} fra ${kunde.get(f.id) || f.kunde_epost}`, lenke: `/admin/foresporsler/${f.id}` })),
    ...(lev ?? []).map((l) => ({ tid: l.opprettet, tekst: `Leverandør registrert: ${l.navn}`, lenke: `/admin/leverandorer/${l.id}` })),
    ...(oppl ?? []).map((o) => ({ tid: o.opprettet, tekst: `${levNavn.get(o.leverandor_id)} låste opp ${fInfo.get(o.foresporsel_id) ?? 'en forespørsel'} (${o.klipp} klipp)`, lenke: `/admin/foresporsler/${o.foresporsel_id}` })),
    ...(tilb ?? []).map((t) => ({
      tid: t.opprettet,
      tekst: `${levNavn.get(t.leverandor_id)} sendte tilbud på ${fInfo.get(t.foresporsel_id) ?? 'en forespørsel'}: ${kr(t.pris_per_kuvert)}/kuvert (${tilbudStatus[t.status] ?? t.status})`,
      lenke: `/admin/foresporsler/${t.foresporsel_id}`,
    })),
    ...(meld ?? []).map((m) => ({
      tid: m.opprettet,
      tekst: m.fra === 'kunde' ? `Kunden sendte spørsmål til ${levNavn.get(m.leverandor_id)}` : `${levNavn.get(m.leverandor_id)} sendte melding til kunden`,
      lenke: `/admin/foresporsler/${m.foresporsel_id}`,
    })),
    ...(trans ?? [])
      .filter((t) => t.grunn !== 'opplasing')
      .map((t) => ({ tid: t.opprettet, tekst: `${klippGrunn[t.grunn] ?? t.grunn}: ${t.endring > 0 ? '+' : ''}${t.endring} klipp til ${levNavn.get(t.leverandor_id)}`, lenke: `/admin/leverandorer/${t.leverandor_id}` })),
  ]
    .sort((a, b) => b.tid.localeCompare(a.tid))
    .slice(0, 40);

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

      <section aria-label="Nøkkeltall" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {tall.map((t) => (
          <div key={t.navn} className="flex flex-col gap-1 rounded-card bg-surface p-4">
            <span className="k-heading k-num text-[30px] leading-none">{t.verdi}</span>
            <span className="text-small text-text-muted">{t.navn}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="venter" className="flex flex-col gap-4">
        <h2 id="venter" className="k-heading m-0 text-h2">
          Leverandører som venter ({venter.length})
        </h2>
        {venter.length === 0 && <p className="m-0 text-text-muted">Ingen venter på godkjenning.</p>}
        {venter.map((l) => (
          <article key={l.id} className="flex flex-col gap-3 rounded-card bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="m-0 text-xl font-bold">
                <Link href={`/admin/leverandorer/${l.id}`}>{l.navn}</Link>
              </h3>
              <span className="text-small text-text-muted">Registrert {dt(l.opprettet)}</span>
            </div>
            <p className="m-0 text-[15px] leading-normal">
              Org.nr.{' '}
              <a href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${l.orgnr}`} target="_blank" rel="noopener">
                {l.orgnr}
              </a>{' '}
              · {l.kontaktperson} · <a href={`mailto:${l.epost}`}>{l.epost}</a>
              {l.telefon ? ` · ${l.telefon}` : ''}
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

      <section aria-labelledby="aktivitet" className="flex flex-col gap-4">
        <h2 id="aktivitet" className="k-heading m-0 text-h2">
          Siste aktivitet
        </h2>
        <ul className="m-0 flex list-none flex-col rounded-card bg-surface p-0">
          {hendelser.length === 0 && <li className="p-4 text-text-muted">Ingen aktivitet ennå.</li>}
          {hendelser.map((h, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-border px-4 py-3 last:border-0">
              <Link href={h.lenke} className="text-[15px] font-semibold">
                {h.tekst}
              </Link>
              <span className="k-num text-small text-text-muted">{dt(h.tid)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="foresporsler" className="flex flex-col gap-4">
        <h2 id="foresporsler" className="k-heading m-0 text-h2">
          Forespørsler ({forsp?.length ?? 0})
        </h2>
        <div className="relative overflow-x-auto rounded-card bg-surface">
          <table className="w-full min-w-[860px] border-collapse text-left text-[15px]">
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
                    <Link href={`/admin/foresporsler/${f.id}`}>
                      {anledningNavn(f.anledning as Anledning)} · {f.gjester}
                    </Link>
                  </td>
                  <td className="p-3">{f.poststed}</td>
                  <td className="p-3">{f.dato ?? 'fleksibel'}</td>
                  <td className="p-3">
                    {kunde.get(f.id) || '–'}
                    <br />
                    <span className="text-small text-text-muted">{f.kunde_epost}</span>
                  </td>
                  <td className="k-num p-3">
                    {antallOppl.get(f.id) ?? 0} / {antallTilb.get(f.id) ?? 0}
                  </td>
                  <td className="p-3">{foresporselStatus[f.status] ?? f.status}</td>
                  <td className="p-3">
                    {f.status === 'venter_bekreftelse' && (
                      <form action={bekreftForKunde.bind(null, f.id)}>
                        <button className="text-[15px] font-semibold underline">Bekreft for kunden</button>
                      </form>
                    )}
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
              </tr>
            </thead>
            <tbody>
              {andre.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-semibold">
                    <Link href={`/admin/leverandorer/${l.id}`}>{l.navn}</Link>
                  </td>
                  <td className="p-3">{l.epost}</td>
                  <td className="p-3">{l.dekning_visning}</td>
                  <td className="p-3">{leverandorStatus[l.status] ?? l.status}</td>
                  <td className="k-num p-3">{saldo.get(l.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
