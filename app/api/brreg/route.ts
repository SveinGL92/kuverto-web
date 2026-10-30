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

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim().slice(0, 100);
  const nr = q.replace(/\s/g, '');
  if (q.length < 2) return NextResponse.json({ treff: [] });
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
