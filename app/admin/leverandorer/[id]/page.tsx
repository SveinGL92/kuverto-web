import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { anledningNavn } from '@/lib/labels';
import { dt, klippGrunn, kr, kravAdminSide, leverandorStatus, tilbudStatus } from '@/lib/server/admin';
import { db } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';
import { godkjennLeverandor, justerKlipp, settLeverandorStatus } from '../../actions';

export const metadata: Metadata = { title: 'Leverandør – admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const knapp = 'min-h-touch rounded-pill border-[1.5px] border-border-input bg-surface px-4 text-[15px] font-bold hover:border-primary';

function Rad({ navn, children }: { navn: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 border-b border-border py-2.5 last:border-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[15px] font-semibold text-text-muted">{navn}</dt>
      <dd className="m-0 whitespace-pre-wrap break-words text-base">{children}</dd>
    </div>
  );
}

export default async function AdminLeverandor({ params }: { params: Promise<{ id: string }> }) {
  await kravAdminSide();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const s = db();
  const { data: l } = await s.from('leverandorer').select('*').eq('id', id).maybeSingle();
  if (!l) notFound();
  const [{ data: dekning }, { data: trans }, { data: oppl }, { data: tilb }, { data: meld }, { data: andre }] = await Promise.all([
    s.from('dekning').select('kommunenr').eq('leverandor_id', id),
    s.from('klipp_transaksjoner').select('*').eq('leverandor_id', id).order('opprettet', { ascending: false }),
    s.from('opplasinger').select('*').eq('leverandor_id', id).order('opprettet', { ascending: false }),
    s.from('tilbud').select('*').eq('leverandor_id', id).order('opprettet', { ascending: false }),
    s.from('meldinger').select('*').eq('leverandor_id', id).order('opprettet', { ascending: false }),
    s.from('leverandorer').select('id, epost, status').eq('orgnr', l.orgnr).neq('id', id),
  ]);
  const kommuneNr = (dekning ?? []).map((d) => d.kommunenr);
  const { data: kommuner } = kommuneNr.length ? await s.from('postnummer').select('kommunenr, kommunenavn').in('kommunenr', kommuneNr) : { data: [] };
  const kommuneNavn = [...new Set((kommuner ?? []).map((k) => k.kommunenavn))].sort((a, b) => a.localeCompare(b, 'nb'));
  const fIder = [...new Set([...(oppl ?? []), ...(tilb ?? [])].map((x) => x.foresporsel_id))];
  const { data: fs } = fIder.length ? await s.from('foresporsler').select('id, anledning, gjester, poststed').in('id', fIder) : { data: [] };
  const fNavn = (fid: string) => {
    const f = fs?.find((x) => x.id === fid);
    return f ? `${anledningNavn(f.anledning as Anledning)} · ${f.gjester} · ${f.poststed}` : 'Forespørsel';
  };
  const saldo = (trans ?? []).reduce((sum, t) => sum + t.endring, 0);
  const kjopt = (trans ?? []).filter((t) => t.grunn === 'kjop').reduce((sum, t) => sum + t.endring, 0);

  return (
    <main id="innhold" className="k-wrap flex flex-col gap-6 py-8">
      <Link href="/admin" className="text-[15px] font-semibold">
        ← Til admin
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="k-heading m-0 text-h1">{l.navn}</h1>
          <p className="m-0 text-text-muted">
            {leverandorStatus[l.status] ?? l.status} · registrert {dt(l.opprettet)}
            {l.godkjent ? ` · godkjent ${dt(l.godkjent)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {l.status !== 'godkjent' && (
            <form action={godkjennLeverandor.bind(null, l.id)}>
              <button className="min-h-touch rounded-pill bg-primary px-5 text-[15px] font-bold text-primary-on">Godkjenn</button>
            </form>
          )}
          {l.status === 'godkjent' && (
            <form action={settLeverandorStatus.bind(null, l.id, 'suspendert')}>
              <button className={`${knapp} text-error`}>Suspender</button>
            </form>
          )}
          {l.status === 'venter' && (
            <form action={settLeverandorStatus.bind(null, l.id, 'avvist')}>
              <button className={`${knapp} text-error`}>Avvis</button>
            </form>
          )}
        </div>
      </div>

      {(andre?.length ?? 0) > 0 && (
        <p className="m-0 rounded-alert bg-warning-bg p-4 font-semibold text-warning">
          Samme org.nr. er også registrert med: {andre!.map((a) => `${a.epost} (${leverandorStatus[a.status] ?? a.status})`).join(', ')}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-card bg-surface p-5 md:p-6" aria-label="Bedriften">
          <h2 className="m-0 mb-2 text-xl font-bold">Bedriften</h2>
          <dl className="m-0">
            <Rad navn="Org.nr.">
              <a href={`https://virksomhet.brreg.no/nb/oppslag/enheter/${l.orgnr}`} target="_blank" rel="noopener">
                {l.orgnr}
              </a>
            </Rad>
            <Rad navn="Kontaktperson">{l.kontaktperson}</Rad>
            <Rad navn="E-post">
              <a href={`mailto:${l.epost}`}>{l.epost}</a>
            </Rad>
            <Rad navn="Telefon">{l.telefon || '–'}</Rad>
            <Rad navn="Nettside">
              {l.nettside ? (
                <a href={l.nettside.startsWith('http') ? l.nettside : `https://${l.nettside}`} target="_blank" rel="noopener">
                  {l.nettside}
                </a>
              ) : (
                '–'
              )}
            </Rad>
            <Rad navn="Beskrivelse">{l.beskrivelse || '–'}</Rad>
            <Rad navn="Dekning">{kommuneNavn.length ? `${kommuneNavn.join(', ')} (${kommuneNavn.length})` : 'Ingen'}</Rad>
            <Rad navn="Nyhetsbrev">{l.markedsforing_samtykke ? 'Ja, har samtykket' : 'Nei'}</Rad>
          </dl>
        </section>

        <section className="flex flex-col gap-3 rounded-card bg-surface p-5 md:p-6" aria-label="Klipp">
          <h2 className="m-0 text-xl font-bold">Klipp</h2>
          <p className="m-0 text-[17px]">
            Saldo: <strong className="k-num">{saldo}</strong> · kjøpt totalt: <strong className="k-num">{kjopt}</strong>
          </p>
          <form action={justerKlipp.bind(null, l.id)} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-[15px] font-semibold">
              Gi eller trekk klipp
              <input name="antall" type="number" inputMode="numeric" placeholder="10 eller -5" className="min-h-touch w-[140px] rounded-input border-[1.5px] border-border-input bg-surface px-3" />
            </label>
            <button className={knapp}>Lagre</button>
          </form>
          <ul className="m-0 flex max-h-[320px] list-none flex-col overflow-y-auto p-0">
            {(trans ?? []).map((t) => (
              <li key={t.id} className="flex justify-between gap-3 border-b border-border py-2 text-[15px] last:border-0">
                <span>
                  {klippGrunn[t.grunn] ?? t.grunn}
                  {t.referanse?.startsWith('stripe:') ? ' (Stripe)' : ''}
                </span>
                <span className="k-num">
                  <strong className={t.endring < 0 ? 'text-error' : 'text-success'}>{t.endring > 0 ? `+${t.endring}` : t.endring}</strong> · {dt(t.opprettet)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-card bg-surface p-5 md:p-6" aria-label="Opplåsinger og tilbud">
        <h2 className="m-0 mb-3 text-xl font-bold">
          Opplåsinger ({oppl?.length ?? 0}) og tilbud ({tilb?.length ?? 0})
        </h2>
        {oppl?.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {oppl.map((o) => {
              const t = tilb?.find((x) => x.foresporsel_id === o.foresporsel_id);
              return (
                <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-2.5 last:border-0">
                  <Link href={`/admin/foresporsler/${o.foresporsel_id}`} className="font-semibold">
                    {fNavn(o.foresporsel_id)}
                  </Link>
                  <span className="text-[15px] text-text-muted">
                    Låst opp {dt(o.opprettet)} ({o.klipp} klipp, {o.status}) · {t ? `Tilbud ${kr(t.pris_per_kuvert)}/kuvert, ${tilbudStatus[t.status] ?? t.status}` : 'Ikke svart'}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="m-0 text-text-muted">Har ikke låst opp noen forespørsler.</p>
        )}
      </section>

      <section className="rounded-card bg-surface p-5 md:p-6" aria-label="Meldinger">
        <h2 className="m-0 mb-3 text-xl font-bold">Meldinger ({meld?.length ?? 0})</h2>
        {meld?.length ? (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {meld.map((m) => (
              <li key={m.id} className="rounded-alert bg-surface-soft p-4">
                <p className="m-0 mb-1 text-small font-semibold text-text-muted">
                  {m.fra === 'kunde' ? 'Fra kunden' : 'Til kunden'} · {dt(m.opprettet)} ·{' '}
                  <Link href={`/admin/foresporsler/${m.foresporsel_id}`}>{fNavn(m.foresporsel_id)}</Link>
                </p>
                <p className="m-0 whitespace-pre-wrap">{m.tekst}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-text-muted">Ingen meldinger.</p>
        )}
      </section>
    </main>
  );
}
