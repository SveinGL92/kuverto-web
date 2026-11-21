import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hentKommuner } from '@/lib/server/kommuner';
import { db, innloggetEpost } from '@/lib/server/supabase';
import { Profil } from './Profil';
import { MARKED_INFO, type Marked } from '@/lib/markets';
import { formaterOrgnr } from '@/lib/orgnr';
import { sprak } from '@/lib/server/marked';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await sprak();
  return { title: t('Profil og område'), robots: { index: false } };
}
export const dynamic = 'force-dynamic';

export default async function ProfilSide() {
  const { t, sti } = await sprak();
  const epost = await innloggetEpost();
  if (!epost) redirect(sti('/logg-inn?rolle=leverandor'));
  const s = db();
  const { data: l } = await s.from('leverandorer').select('*').eq('epost', epost).maybeSingle();
  if (!l || l.status !== 'godkjent') redirect(sti('/leverandor'));
  const [kommuner, { data: dekning }] = await Promise.all([hentKommuner(l.marked), s.from('dekning').select('kommunenr').eq('leverandor_id', l.id)]);
  return (
    <main id="innhold" className="k-wrap">
      <div className="mx-auto flex max-w-[680px] flex-col gap-3 py-8">
        <Link href={sti('/leverandor')} className="text-[15px] font-semibold">
          {t('← Til oversikten')}
        </Link>
        <h1 className="k-heading m-0 text-h1">{t('Profil og område')}</h1>
        <p className="m-0 text-base text-text-muted">
          {l.navn} · {MARKED_INFO[l.marked as Marked]?.orgnr.navn ?? t('org.nr.')} {formaterOrgnr(l.marked, l.orgnr)} · {l.epost}. {t('Skal navn, org.nr. eller e-post endres, skriver du til')} <a href="mailto:hei@kuverto.no">hei@kuverto.no</a>.
        </p>
        <Profil
          kommuner={kommuner}
          start={{
            kontaktperson: l.kontaktperson,
            telefon: l.telefon ?? '',
            nettside: l.nettside ?? '',
            beskrivelse: l.beskrivelse ?? '',
            mvaNummer: l.mva_nummer ?? '',
            kommuner: (dekning ?? []).map((d) => d.kommunenr),
          }}
        />
      </div>
    </main>
  );
}
