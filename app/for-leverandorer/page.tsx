import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { StegListe, type Steg } from '@/components/innhold/StegListe';
import { Sporsmal, type SporsmalSvar } from '@/components/innhold/Sporsmal';
import { ButtonLink } from '@/components/ui/Button';
import { KLIPPAKKER, MAKS_LEVERANDORER, PILOT_GRATIS_KLIPP, TRINN, klippPrisSpenn, pakkePris, prisPerKlipp, refusjonKort, refusjonLang } from '@/lib/klipp';
import { fraNok } from '@/lib/markets';
import { sprak } from '@/lib/server/marked';

export async function generateMetadata(): Promise<Metadata> {
  const { t, sti } = await sprak();
  return {
    title: t('For cateringleverandører – flere oppdrag uten provisjon'),
    description: t('Få forespørsler fra kunder som trenger catering i ditt område. Velg hvilke du vil svare på, og betal bare for dem du låser opp. Ingen provisjon og ingen abonnement.'),
    alternates: { canonical: sti('/for-leverandorer') },
  };
}

export default async function ForLeverandorer() {
  const { marked, info, t, sti, penger } = await sprak();
  const REGISTRER = sti('/bli-leverandor');
  const spenn = klippPrisSpenn(marked);
  /** «kr 10 000–30 000», «10 000–30 000 kr», «1 000–3 000 €». Beløp i markedets valuta (minste enhet). */
  const fraTil = (a: number, b: number) => {
    const tall = (n: number) => penger(n).replace(/[^\d\s]/g, '').trim();
    return marked === 'no' ? `${penger(a)}–${tall(b)}` : penger(b).replace(tall(b), `${tall(a)}–${tall(b)}`);
  };
  const trinnTekst = (i: number) => {
    const nedre = i === 0 ? 0 : fraNok(TRINN[i - 1].under, marked);
    const ovre = Number.isFinite(TRINN[i].under) ? fraNok(TRINN[i].under, marked) : Infinity;
    if (i === 0) return t('Under {belop}', { belop: penger(ovre) });
    if (!Number.isFinite(ovre)) return t('Over {belop}', { belop: penger(nedre) });
    return fraTil(nedre, ovre);
  };

  const steg: Steg[] = [
    {
      tittel: t('Registrer bedriften'),
      tekst: t('Oppgi organisasjonsnummer og velg kommunene du leverer til. Vi godkjenner bedriften før du får se forespørsler.'),
      illustrasjon: '/illustrasjoner/kart.svg',
    },
    {
      tittel: t('Velg forespørslene du vil ha'),
      tekst: t('Du ser anledning, dato, antall gjester, område, budsjett og kosthold før du bestemmer deg. Lås opp dem som passer.'),
      illustrasjon: '/illustrasjoner/bordkort.svg',
    },
    {
      tittel: t('Send tilbud og vinn oppdraget'),
      tekst: t('Svar med meny og pris per kuvert. Kunden sammenligner og velger, og du avtaler detaljene direkte med kunden.'),
      illustrasjon: '/illustrasjoner/tallerken-hake.svg',
    },
  ];

  const passerFor = [t('Cateringbedrifter'), t('Restauranter som leverer catering'), t('Kantiner og storkjøkken'), t('Bakerier og kafeer med selskapsmat')];

  const sporsmal: SporsmalSvar[] = [
    {
      sporsmal: t('Hva ser jeg før jeg låser opp en forespørsel?'),
      svar: t('Anledning, dato og klokkeslett, antall gjester, område (for eksempel «Oslo sentrum, 01xx»), budsjett per kuvert, kosthold og allergier. Kundens navn, kontaktinfo og melding ser du etter opplåsing. Adressen får du når kunden velger tilbudet ditt.'),
    },
    {
      sporsmal: t('Hvor mange leverandører kan svare på samme forespørsel?'),
      svar: t('Høyst {maks}. Når {maks} har låst opp, forsvinner forespørselen fra oversikten til de andre, så du konkurrerer aldri mot flere enn {andre} andre.', { maks: MAKS_LEVERANDORER, andre: MAKS_LEVERANDORER - 1 }),
    },
    {
      sporsmal: t('Når får jeg klippene tilbake?'),
      svar: refusjonLang(t),
    },
    {
      sporsmal: t('Er det abonnement eller bindingstid?'),
      svar: t('Nei. Du kjøper klipp når du trenger dem og bruker dem på forespørslene du vil svare på. Kuverto tar ingen provisjon av oppdragene.'),
    },
    {
      sporsmal: t('Hvordan blir bedriften godkjent?'),
      svar: t('Vi sjekker organisasjonsnummeret i Enhetsregisteret og at bedriften driver med mat eller servering, og godkjenner manuelt. Du får beskjed på e-post når du er godkjent.'),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="innhold">
        {/* Hero */}
        <section aria-labelledby="lev-tittel" className="k-wrap flex flex-col gap-8 pt-4 md:flex-row md:flex-wrap md:items-center md:gap-x-14 md:pt-8">
          <div className="flex min-w-0 flex-col gap-5 md:max-w-[640px] md:flex-[1.1_1_480px] md:gap-7">
            <p className="m-0 text-[15px] font-bold text-text-muted">{t('For cateringleverandører')}</p>
            <h1 id="lev-tittel" className="k-heading m-0 text-[clamp(36px,10vw,46px)] leading-[1.0] tracking-[-0.045em] md:text-[clamp(44px,4.6vw,66px)]">
              {t('Flere relevante cateringoppdrag. Uten provisjon.')}
            </h1>
            <p className="m-0 max-w-[40ch] text-[17px] leading-normal text-text-muted md:text-[20px]">
              {t('Se forespørsler fra kunder som trenger catering i ditt område. Velg hvilke du vil svare på, og betal bare for dem du låser opp.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={REGISTRER} size="lg">
                {t('Registrer bedriften')}
              </ButtonLink>
              <ButtonLink href="#priser" variant="secondary" size="lg">
                {t('Se priser')}
              </ButtonLink>
            </div>
            <p className="m-0 text-[15px] text-text-muted">{t('Nye leverandører får {klipp} gratis klipp å starte med.', { klipp: PILOT_GRATIS_KLIPP })}</p>
          </div>
          <div className="relative h-[280px] min-w-0 overflow-hidden rounded-media bg-[var(--k-photo-placeholder)] md:h-[clamp(380px,38vw,540px)] md:flex-[1_1_380px] md:rounded-panel">
            <Image src="/bilder/leverandor.webp" alt={t('Eksempelbilde: kokk som setter frem fat med salat og grønnsaker')} fill priority sizes="(min-width: 768px) 42vw, 92vw" className="object-cover" />
          </div>
        </section>

        {/* Slik fungerer det */}
        <section aria-labelledby="lev-steg" className="k-wrap pt-14 md:pt-24">
          <h2 id="lev-steg" className="k-heading mb-6 mt-0 text-[30px] leading-[1.05] md:mb-9 md:text-[clamp(32px,3.2vw,44px)]">
            {t('Slik fungerer det')}
          </h2>
          <StegListe steg={steg} />
        </section>

        {/* Hvem */}
        <section aria-labelledby="lev-hvem" className="k-wrap pt-14 md:pt-24">
          <div className="grid gap-6 rounded-media bg-surface-soft px-[22px] py-8 md:grid-cols-2 md:gap-12 md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-14">
            <div className="flex flex-col gap-3">
              <h2 id="lev-hvem" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
                {t('Hvem passer det for?')}
              </h2>
              <p className="m-0 text-base leading-normal text-text-muted md:text-[17px]">
                {t('Alle som lager mat til selskaper, i hele Norge. Du velger selv fylkene og kommunene du dekker, og ser bare forespørsler derfra.')}
              </p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {passerFor.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[17px] font-semibold">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--k-success)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Priser */}
        <section id="priser" aria-labelledby="lev-priser" className="k-wrap scroll-mt-6 pt-14 md:pt-24">
          <div className="mb-6 flex flex-col gap-2 md:mb-9">
            <h2 id="lev-priser" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
              {t('Priser')}
            </h2>
            <p className="m-0 max-w-[60ch] text-base text-text-muted md:text-[17px]">
              {info.omvendtAvgift
                ? t('Du kjøper klipp og bruker dem til å låse opp forespørsler. Store oppdrag koster flere klipp enn små. Fakturaen er uten mva (omvendt avgiftsplikt).')
                : t('Du kjøper klipp og bruker dem til å låse opp forespørsler. Store oppdrag koster flere klipp enn små. Alle priser er eks. mva.')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="rounded-card bg-surface p-5 md:p-7">
              <h3 className="m-0 mb-4 text-xl font-bold">{t('Klippakker')}</h3>
              <table className="w-full border-collapse text-left text-[15px] md:text-base">
                <caption className="sr-only">{info.omvendtAvgift ? t('Klippakker med pris uten mva') : t('Klippakker med pris eks. mva')}</caption>
                <thead>
                  <tr className="border-b border-border text-small text-text-muted">
                    <th scope="col" className="py-2 font-semibold">{t('Pakke')}</th>
                    <th scope="col" className="py-2 font-semibold">{t('Klipp')}</th>
                    <th scope="col" className="py-2 text-right font-semibold">{t('Pris')}</th>
                    <th scope="col" className="py-2 text-right font-semibold">{t('Per klipp')}</th>
                  </tr>
                </thead>
                <tbody>
                  {KLIPPAKKER.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <th scope="row" className="py-3 font-bold">{t(p.navn)}</th>
                      <td className="k-num py-3">{p.klipp}</td>
                      <td className="k-num py-3 text-right font-bold">{penger(pakkePris(p, marked))}</td>
                      <td className="k-num py-3 text-right text-text-muted">{penger(prisPerKlipp(p, marked))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-card bg-surface p-5 md:p-7">
              <h3 className="m-0 mb-1 text-xl font-bold">{t('Pris for å låse opp')}</h3>
              <p className="m-0 mb-4 text-[15px] text-text-muted">{t('Etter anslått verdi på oppdraget: antall gjester × budsjett per kuvert.')}</p>
              <table className="w-full border-collapse text-left text-[15px] md:text-base">
                <caption className="sr-only">{t('Antall klipp per forespørsel etter anslått verdi')}</caption>
                <thead>
                  <tr className="border-b border-border text-small text-text-muted">
                    <th scope="col" className="py-2 font-semibold">{t('Anslått verdi')}</th>
                    <th scope="col" className="py-2 font-semibold">{t('Klipp')}</th>
                    <th scope="col" className="py-2 text-right font-semibold">{t('Omtrent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {TRINN.map((tr, i) => (
                    <tr key={tr.klipp} className="border-b border-border last:border-0">
                      <th scope="row" className="k-num py-3 font-semibold">{trinnTekst(i)}</th>
                      <td className="k-num py-3 font-bold">{tr.klipp}</td>
                      <td className="k-num py-3 text-right text-text-muted">{fraTil(tr.klipp * spenn.min, tr.klipp * spenn.maks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="m-0 mt-6 grid list-none gap-3 p-0 text-base text-text-muted md:grid-cols-3 md:gap-6">
            <li>{t('Høyst {maks} leverandører per forespørsel.', { maks: MAKS_LEVERANDORER })}</li>
            <li>{refusjonKort(t)}</li>
            <li>{t('Ingen provisjon, abonnement eller bindingstid.')}</li>
          </ul>
        </section>

        {/* Spørsmål */}
        <section aria-labelledby="lev-sporsmal" className="k-wrap grid gap-6 pt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14 md:pt-24">
          <h2 id="lev-sporsmal" className="k-heading m-0 text-[30px] leading-[1.05] md:text-[clamp(32px,3.2vw,44px)]">
            {t('Spørsmål og svar')}
          </h2>
          <Sporsmal liste={sporsmal} />
        </section>

        {/* Avslutning */}
        <section aria-labelledby="lev-cta" className="k-wrap pt-14 md:pt-20">
          <div className="flex flex-col gap-4 rounded-media bg-panel px-[22px] py-8 text-panel-on md:flex-row md:flex-wrap md:items-center md:justify-between md:rounded-panel md:px-[clamp(24px,4vw,64px)] md:py-12">
            <div className="flex flex-col gap-2 md:flex-[1_1_420px]">
              <h2 id="lev-cta" className="k-heading m-0 text-[30px] leading-none md:text-[40px]">
                {t('Klar for flere oppdrag?')}
              </h2>
              <p className="m-0 max-w-[48ch] leading-normal text-panel-on-muted md:text-[17px]">
                {t('Registreringen tar et par minutter. Du får {klipp} gratis klipp når bedriften er godkjent.', { klipp: PILOT_GRATIS_KLIPP })}
              </p>
            </div>
            <ButtonLink href={REGISTRER} variant="accent" size="lg" className="self-start whitespace-nowrap md:self-auto">
              {t('Registrer bedriften')}
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
