import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { tilForesporsel, tilKontakt } from '@/lib/server/data';
import { db, innloggetEpost } from '@/lib/server/supabase';
import { Oversikt, type Opplast } from './Oversikt';

export const metadata: Metadata = {
  title: 'Leverandør – oversikt',
  description: 'Se nye cateringforespørsler i området ditt, lås opp dem du vil svare på og send tilbud.',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

function Melding({ tittel, children }: { tittel: string; children: React.ReactNode }) {
  return (
    <main id="innhold" className="k-wrap flex min-h-dvh items-center justify-center py-10">
      <div className="flex max-w-[520px] flex-col gap-4 rounded-card bg-surface p-7">
        <Link href="/" className="k-heading text-xl text-primary no-underline">
          kuverto
        </Link>
        <h1 className="k-heading m-0 text-[30px] leading-tight">{tittel}</h1>
        {children}
        <form action="/logg-ut" method="post">
          <button className="text-[15px] font-semibold underline">Logg ut</button>
        </form>
      </div>
    </main>
  );
}

export default async function LeverandorSide() {
  const epost = await innloggetEpost();
  if (!epost) redirect('/logg-inn?rolle=leverandor');
  const s = db();
  const { data: lev } = await s.from('leverandorer').select('*').eq('epost', epost).maybeSingle();

  if (!lev)
    return (
      <Melding tittel="Bedriften er ikke registrert">
        <p className="m-0 text-base leading-normal text-text-muted">
          Vi finner ingen leverandør med e-postadressen <strong className="text-text">{epost}</strong>. Registrer bedriften først, eller logg inn med e-posten dere registrerte.
        </p>
        <ButtonLink href="/bli-leverandor" className="self-start">
          Registrer bedriften
        </ButtonLink>
      </Melding>
    );
  if (lev.status === 'venter')
    return (
      <Melding tittel="Venter på godkjenning">
        <p className="m-0 text-base leading-normal text-text-muted">Vi sjekker {lev.navn} og godkjenner så raskt vi kan. Du får en e-post når du kan begynne å svare på forespørsler.</p>
      </Melding>
    );
  if (lev.status !== 'godkjent')
    return (
      <Melding tittel="Kontoen er ikke aktiv">
        <p className="m-0 text-base leading-normal text-text-muted">
          Ta kontakt på <a href="mailto:hei@kuverto.no">hei@kuverto.no</a> hvis du har spørsmål.
        </p>
      </Melding>
    );

  const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
  const [{ data: dekning }, { data: saldo }, { data: mineOppl }] = await Promise.all([
    s.from('dekning').select('kommunenr').eq('leverandor_id', lev.id),
    s.rpc('klippsaldo', { p_leverandor: lev.id }),
    s.from('opplasinger').select('foresporsel_id, svarfrist, opprettet').eq('leverandor_id', lev.id).eq('status', 'aktiv').order('opprettet', { ascending: false }),
  ]);
  const kommuner = (dekning ?? []).map((d) => d.kommunenr);
  const opplasteIder = (mineOppl ?? []).map((o) => o.foresporsel_id);

  // Nye: aktive i dekningsområdet, ikke passert, ikke låst opp av meg, og ikke fulle.
  const { data: kandidater } = kommuner.length
    ? await s.from('foresporsler').select('*').eq('status', 'aktiv').in('kommunenr', kommuner).or(`dato.is.null,dato.gte.${idag}`).order('opprettet', { ascending: false }).limit(100)
    : { data: [] };
  const kandIder = (kandidater ?? []).map((f) => f.id);
  const { data: alleOppl } = kandIder.length ? await s.from('opplasinger').select('foresporsel_id').in('foresporsel_id', kandIder).eq('status', 'aktiv') : { data: [] };
  const telling = new Map<string, number>();
  for (const o of alleOppl ?? []) telling.set(o.foresporsel_id, (telling.get(o.foresporsel_id) ?? 0) + 1);
  const nye = (kandidater ?? [])
    .filter((f) => !opplasteIder.includes(f.id) && (telling.get(f.id) ?? 0) < f.maks_leverandorer)
    // Før opplåsing: bare område, ikke eksakt postnummer.
    .map((f) => ({ ...tilForesporsel(f), postnummer: `${String(f.postnummer).slice(0, 2)}xx`, andreOpplast: telling.get(f.id) ?? 0 }));

  // Mine opplåste med kontaktinfo og eget tilbud.
  let opplaste: Opplast[] = [];
  if (opplasteIder.length) {
    const [{ data: fs }, { data: ks }, { data: ts }] = await Promise.all([
      s.from('foresporsler').select('*').in('id', opplasteIder),
      s.from('foresporsel_kontakt').select('*').in('foresporsel_id', opplasteIder),
      s.from('tilbud').select('*').in('foresporsel_id', opplasteIder).eq('leverandor_id', lev.id),
    ]);
    opplaste = (mineOppl ?? []).flatMap((o) => {
      const f = fs?.find((x) => x.id === o.foresporsel_id);
      const k = ks?.find((x) => x.foresporsel_id === o.foresporsel_id);
      const t = ts?.find((x) => x.foresporsel_id === o.foresporsel_id);
      if (!f || !k) return [];
      return [
        {
          foresporsel: tilForesporsel(f),
          // Adressen er bare for leverandøren kunden har valgt.
          kontakt: { ...tilKontakt(k), adresse: t?.status === 'godtatt' ? (k.adresse ?? undefined) : undefined },
          svarfrist: o.svarfrist,
          foresporselStatus: f.status,
          tilbud: t
            ? {
                status: t.status,
                prisPerKuvert: t.pris_per_kuvert / 100,
                meny: t.meny,
                kostholdDekket: t.kosthold_dekket,
                kostholdTekst: t.kosthold_tekst,
                leveringInkludert: t.levering_inkludert,
                leveringPris: (t.levering_pris ?? 0) / 100,
                oppsettOgRydding: t.oppsett_og_rydding,
                servise: t.servise,
                gyldigTil: t.gyldig_til,
                betingelser: t.betingelser ?? '',
              }
            : undefined,
        },
      ];
    });
  }

  return <Oversikt firma={lev.navn} dekning={lev.dekning_visning} saldo={(saldo as number) ?? 0} nye={nye} opplaste={opplaste} />;
}
