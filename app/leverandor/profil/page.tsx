import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hentKommuner } from '@/lib/server/kommuner';
import { db, innloggetEpost } from '@/lib/server/supabase';
import { Profil } from './Profil';

export const metadata: Metadata = { title: 'Profil og område', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ProfilSide() {
  const epost = await innloggetEpost();
  if (!epost) redirect('/logg-inn?rolle=leverandor');
  const s = db();
  const { data: l } = await s.from('leverandorer').select('*').eq('epost', epost).maybeSingle();
  if (!l || l.status !== 'godkjent') redirect('/leverandor');
  const [kommuner, { data: dekning }] = await Promise.all([hentKommuner(), s.from('dekning').select('kommunenr').eq('leverandor_id', l.id)]);
  return (
    <main id="innhold" className="k-wrap">
      <div className="mx-auto flex max-w-[680px] flex-col gap-3 py-8">
        <Link href="/leverandor" className="text-[15px] font-semibold">
          ← Til oversikten
        </Link>
        <h1 className="k-heading m-0 text-h1">Profil og område</h1>
        <p className="m-0 text-base text-text-muted">
          {l.navn} · org.nr. {l.orgnr} · {l.epost}. Skal navn, org.nr. eller e-post endres, skriver du til <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>.
        </p>
        <Profil
          kommuner={kommuner}
          start={{
            kontaktperson: l.kontaktperson,
            telefon: l.telefon ?? '',
            nettside: l.nettside ?? '',
            beskrivelse: l.beskrivelse ?? '',
            kommuner: (dekning ?? []).map((d) => d.kommunenr),
          }}
        />
      </div>
    </main>
  );
}
