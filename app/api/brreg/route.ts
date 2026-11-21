import { NextResponse, type NextRequest } from 'next/server';

/** Søk i Enhetsregisteret (Brønnøysundregistrene) på navn eller org.nr. Åpne data, ingen nøkkel. */
export interface BrregTreff {
  orgnr: string;
  navn: string;
  form: string;
  sted: string;
  bransje: string;
  nettside: string;
}

interface Enhet {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform?: { kode?: string };
  forretningsadresse?: { poststed?: string; kommune?: string };
  postadresse?: { poststed?: string };
  naeringskode1?: { beskrivelse?: string };
  hjemmeside?: string;
  konkurs?: boolean;
  underAvvikling?: boolean;
  underTvangsavviklingEllerTvangsopplosning?: boolean;
  slettedato?: string;
}

const tilTreff = (e: Enhet): BrregTreff => ({
  orgnr: e.organisasjonsnummer,
  navn: e.navn,
  form: e.organisasjonsform?.kode ?? '',
  sted: (e.forretningsadresse?.poststed ?? e.postadresse?.poststed ?? '').replace(/(^|[\s-])(\p{L})(\p{L}*)/gu, (_, a, b, c) => a + b + c.toLowerCase()),
  bransje: e.naeringskode1?.beskrivelse ?? '',
  nettside: e.hjemmeside ?? '',
});
const aktiv = (e: Enhet) => !['KBO', 'BO', 'ESEK'].includes(e.organisasjonsform?.kode ?? '') && !e.konkurs && !e.underAvvikling && !e.underTvangsavviklingEllerTvangsopplosning && !e.slettedato;

// Finland: YTJ/PRH, åpne data (avoindata.prh.fi, v3). Sverige og Danmark har ikke et åpent navnesøk.
type PrhNavn = { name?: string; type?: string | number; endDate?: string | null };
type PrhAdresse = { type?: number | string; postOffices?: { city?: string; languageCode?: string }[] };
type PrhFirma = { businessId?: { value?: string }; names?: PrhNavn[]; addresses?: PrhAdresse[]; endDate?: string | null; website?: { url?: string } | null; mainBusinessLine?: { descriptions?: { description?: string; languageCode?: string }[] } };

function fraPrh(c: PrhFirma): BrregTreff | null {
  const id = c.businessId?.value ?? '';
  if (!/^\d{7}-\d$/.test(id) || c.endDate) return null;
  const navn = (c.names ?? []).filter((n) => n.name && !n.endDate);
  const hoved = navn.find((n) => String(n.type) === '1') ?? navn[0];
  if (!hoved?.name) return null;
  const a = (c.addresses ?? []).find((x) => String(x.type) === '1') ?? c.addresses?.[0];
  const by = (a?.postOffices ?? []).find((p) => p.languageCode === '1')?.city ?? a?.postOffices?.[0]?.city ?? '';
  const bransje = c.mainBusinessLine?.descriptions?.find((d) => d.languageCode === '1')?.description ?? '';
  return { orgnr: id.replace('-', ''), navn: hoved.name.trim(), form: '', sted: by.charAt(0) + by.slice(1).toLowerCase(), bransje, nettside: c.website?.url ?? '' };
}

async function sokFinland(q: string) {
  const nr = q.replace(/[\s-]/g, '');
  const base = 'https://avoindata.prh.fi/opendata-ytj-api/v3/companies';
  const url = /^\d{8}$/.test(nr) ? `${base}?businessId=${nr.slice(0, 7)}-${nr.slice(7)}` : `${base}?name=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } });
  if (r.status === 404) return NextResponse.json({ treff: [] });
  if (!r.ok) throw new Error(String(r.status));
  const data = (await r.json()) as { companies?: PrhFirma[] };
  return NextResponse.json({ treff: (data.companies ?? []).map(fraPrh).filter((x): x is BrregTreff => !!x).slice(0, 8) });
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  const nr = q.replace(/\s/g, '');
  if (q.length < 2) return NextResponse.json({ treff: [] });
  if (req.nextUrl.searchParams.get('m') === 'fi') {
    try {
      return await sokFinland(q);
    } catch {
      return NextResponse.json({ feil: true, treff: [] }, { status: 502 });
    }
  }
  const base = 'https://data.brreg.no/enhetsregisteret/api/enheter';
  const opts = { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } };
  try {
    if (/^\d{9}$/.test(nr)) {
      const r = await fetch(`${base}/${nr}`, opts);
      if (r.status === 404 || r.status === 410) return NextResponse.json({ treff: [] });
      if (!r.ok) throw new Error(String(r.status));
      const e = (await r.json()) as Enhet;
      return NextResponse.json({ treff: aktiv(e) ? [tilTreff(e)] : [] });
    }
    const r = await fetch(`${base}?navn=${encodeURIComponent(q)}&size=15`, opts);
    if (!r.ok) throw new Error(String(r.status));
    const data = (await r.json()) as { _embedded?: { enheter?: Enhet[] } };
    const treff = (data._embedded?.enheter ?? []).filter(aktiv).slice(0, 8).map(tilTreff);
    return NextResponse.json({ treff });
  } catch {
    return NextResponse.json({ feil: true, treff: [] }, { status: 502 });
  }
}
