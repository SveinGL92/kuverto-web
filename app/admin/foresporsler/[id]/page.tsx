import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { anledningNavn, budsjettNavn, kostholdLinje, serveringNavn } from '@/lib/labels';
import { dt, foresporselStatus, kr, kravAdminSide, tilbudStatus } from '@/lib/server/admin';
import { datoTekst, type KostholdRad } from '@/lib/server/formatering';
import { db } from '@/lib/server/supabase';
import type { Anledning, Budsjett, Servering } from '@/lib/types';
import { bekreftForKunde, settForesporselStatus } from '../../actions';

export const metadata: Metadata = { title: 'Forespørsel – admin', robots: { index: false } };
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

function Kort({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-card bg-surface p-5 md:p-6" aria-label={tittel}>
      <h2 className="m-0 text-xl font-bold">{tittel}</h2>
      {children}
    </section>
  );
}

export default async function AdminForesporsel({ params }: { params: Promise<{ id: string }> }) {
  await kravAdminSide();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const s = db();
  const { data: f } = await s.from('foresporsler').select('*').eq('id', id).maybeSingle();
  if (!f) notFound();
  const [{ data: k }, { data: oppl }, { data: tilb }, { data: meld }] = await Promise.all([
    s.from('foresporsel_kontakt').select('*').eq('foresporsel_id', id).maybeSingle(),
    s.from('opplasinger').select('*').eq('foresporsel_id', id).order('opprettet'),
    s.from('tilbud').select('*').eq('foresporsel_id', id).order('opprettet'),
    s.from('meldinger').select('*').eq('foresporsel_id', id).order('opprettet'),
  ]);
  const levIder = [...new Set([...(oppl ?? []), ...(tilb ?? []), ...(meld ?? [])].map((x) => x.leverandor_id))];
  const { data: lev } = levIder.length ? await s.from('leverandorer').select('id, navn, epost').in('id', levIder) : { data: [] };
  const levNavn = (lid: string) => lev?.find((l) => l.id === lid)?.navn ?? 'Ukjent leverandør';
  const kosthold = (f.kosthold as KostholdRad[]) ?? [];

  return (
    <main id="innhold" className="k-wrap flex flex-col gap-6 py-8">
      <Link href="/admin" className="text-[15px] font-semibold">
        ← Til admin
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="k-heading m-0 text-h1">
            {anledningNavn(f.anledning as Anledning)} · {f.gjester} gjester
          </h1>
          <p className="m-0 text-text-muted">
            {foresporselStatus[f.status] ?? f.status} · mottatt {dt(f.opprettet)} · {f.klipp_pris} klipp å låse opp
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {f.status === 'venter_bekreftelse' && (
            <form action={bekreftForKunde.bind(null, f.id)}>
              <button className="min-h-touch rounded-pill bg-primary px-5 text-[15px] font-bold text-primary-on">Bekreft og send til leverandørene</button>
            </form>
          )}
          {['aktiv', 'venter_bekreftelse'].includes(f.status) && (
            <form action={settForesporselStatus.bind(null, f.id, 'avvist')}>
              <button className={`${knapp} text-error`}>Avvis</button>
            </form>
          )}
          {f.status === 'avvist' && (
            <form action={settForesporselStatus.bind(null, f.id, 'aktiv')}>
              <button className={knapp}>Aktiver igjen</button>
            </form>
          )}
          <Link href={`/foresporsler/${f.id}`} className={`${knapp} inline-flex items-center no-underline`}>
            Se kundens side
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Kort tittel="Forespørselen">
          <dl className="m-0">
            <Rad navn="Anledning">{anledningNavn(f.anledning as Anledning)}</Rad>
            <Rad navn="Gjester">{f.gjester}</Rad>
            <Rad navn="Dato">
              {f.dato ? `${datoTekst(f.dato)} kl. ${f.klokkeslett}` : `Fleksibel, kl. ${f.klokkeslett}`}
              {f.dato && f.fleksibel_dato ? ' (fleksibel)' : ''}
            </Rad>
            <Rad navn="Sted">
              {f.postnummer} {f.poststed} (kommune {f.kommunenr}) · {f.levering === 'henting' ? 'henting' : 'levering'}
            </Rad>
            <Rad navn="Leverandører ser">{f.omrade_visning}</Rad>
            {f.servering && <Rad navn="Servering">{serveringNavn(f.servering as Servering)}</Rad>}
            <Rad navn="Budsjett">{budsjettNavn(f.budsjett as Budsjett)}</Rad>
            <Rad navn="Kosthold">{kosthold.length ? kosthold.map(kostholdLinje).join(', ') : 'Ingen oppgitt'}</Rad>
            <Rad navn="Maks leverandører">{f.maks_leverandorer}</Rad>
          </dl>
        </Kort>
        <Kort tittel="Kunden">
          {k ? (
            <dl className="m-0">
              <Rad navn="Navn">{k.navn}</Rad>
              <Rad navn="Bedrift">{k.firma || '–'}</Rad>
              <Rad navn="E-post">
                <a href={`mailto:${k.epost}`}>{k.epost}</a>
              </Rad>
              <Rad navn="Telefon">{k.telefon ? <a href={`tel:${k.telefon.replace(/\s/g, '')}`}>{k.telefon}</a> : '–'}</Rad>
              <Rad navn="Adresse">{k.adresse || (f.levering === 'henting' ? 'Henting' : 'Ikke oppgitt ennå')}</Rad>
              <Rad navn="Andre ønsker">{k.melding || '–'}</Rad>
            </dl>
          ) : (
            <p className="m-0 text-text-muted">Mangler kontaktinfo.</p>
          )}
        </Kort>
      </div>

      <Kort tittel={`Opplåsinger (${oppl?.length ?? 0})`}>
        {oppl?.length ? (
          <ul className="m-0 flex list-none flex-col p-0">
            {oppl.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-2.5 last:border-0">
                <Link href={`/admin/leverandorer/${o.leverandor_id}`} className="font-semibold">
                  {levNavn(o.leverandor_id)}
                </Link>
                <span className="text-[15px] text-text-muted">
                  {dt(o.opprettet)} · {o.klipp} klipp · {o.status}
                  {o.svarfrist ? ` · svarfrist ${o.svarfrist}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-text-muted">Ingen har låst opp ennå.</p>
        )}
      </Kort>

      <Kort tittel={`Tilbud (${tilb?.length ?? 0})`}>
        {tilb?.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {tilb.map((t) => (
              <article key={t.id} className="rounded-alert border border-border p-4">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/admin/leverandorer/${t.leverandor_id}`} className="text-[17px] font-bold">
                    {levNavn(t.leverandor_id)}
                  </Link>
                  <span className="text-[15px] font-semibold">{tilbudStatus[t.status] ?? t.status}</span>
                </div>
                <dl className="m-0">
                  <Rad navn="Pris per kuvert">{kr(t.pris_per_kuvert)} inkl. mva</Rad>
                  <Rad navn="Totalt">{kr(t.total_inkl_mva)} inkl. mva</Rad>
                  <Rad navn="Meny">{t.meny}</Rad>
                  <Rad navn="Kosthold">
                    {t.kosthold_dekket ? 'Dekket' : 'Ikke bekreftet'}
                    {t.kosthold_tekst ? ` · ${t.kosthold_tekst}` : ''}
                  </Rad>
                  <Rad navn="Levering">{t.levering_inkludert ? 'Inkludert' : `${kr(t.levering_pris)} i tillegg`}</Rad>
                  <Rad navn="Oppsett og rydding">{t.oppsett_og_rydding ? 'Inkludert' : 'Ikke inkludert'}</Rad>
                  <Rad navn="Servise">{t.servise || '–'}</Rad>
                  <Rad navn="Gjelder til">{t.gyldig_til}</Rad>
                  <Rad navn="Betingelser">{t.betingelser || '–'}</Rad>
                  <Rad navn="Sendt">{dt(t.opprettet)}</Rad>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="m-0 text-text-muted">Ingen tilbud ennå.</p>
        )}
      </Kort>

      <Kort tittel={`Meldinger (${meld?.length ?? 0})`}>
        {meld?.length ? (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {meld.map((m) => (
              <li key={m.id} className="rounded-alert bg-surface-soft p-4">
                <p className="m-0 mb-1 text-small font-semibold text-text-muted">
                  {m.fra === 'kunde' ? `Kunden → ${levNavn(m.leverandor_id)}` : `${levNavn(m.leverandor_id)} → kunden`} · {dt(m.opprettet)}
                </p>
                <p className="m-0 whitespace-pre-wrap">{m.tekst}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-text-muted">Ingen meldinger. Svar som sendes direkte på e-post, vises ikke her.</p>
        )}
      </Kort>
    </main>
  );
}
