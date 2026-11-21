import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { EmptyState } from '@/components/states/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { datoKort, stor } from '@/lib/format';
import { anledningNavn } from '@/lib/labels';
import { sprak } from '@/lib/server/marked';
import { db, innloggetEpost } from '@/lib/server/supabase';
import type { Anledning } from '@/lib/types';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await sprak();
  return { title: t('Mine forespørsler'), robots: { index: false } };
}
export const dynamic = 'force-dynamic';

const statusTekst: Record<string, string> = { aktiv: 'Venter på tilbud', tildelt: 'Tilbud valgt', trukket: 'Trukket', lukket: 'Lukket', avvist: 'Avvist' };

export default async function MineForesporsler() {
  const { info, t, sti } = await sprak();
  const epost = await innloggetEpost();
  if (!epost) redirect(sti('/logg-inn'));
  const s = db();
  const { data: fs } = await s.from('foresporsler').select('id, anledning, gjester, dato, poststed, status, opprettet').eq('kunde_epost', epost).order('opprettet', { ascending: false });
  const ider = (fs ?? []).map((f) => f.id);
  const { data: ts } = ider.length ? await s.from('tilbud').select('foresporsel_id').in('foresporsel_id', ider).neq('status', 'trukket') : { data: [] };
  const antall = new Map<string, number>();
  for (const t of ts ?? []) antall.set(t.foresporsel_id, (antall.get(t.foresporsel_id) ?? 0) + 1);

  return (
    <>
      <AppHeader tilbake={{ href: sti('/'), navn: t('Forsiden') }} aktiv="foresporsler">
        <h1 className="k-heading m-0 text-[34px] leading-[1.02] md:text-[52px]">{t('Mine forespørsler')}</h1>
        <p className="m-0 mt-2 text-[15px] text-panel-on-muted">{t('Logget inn som {epost}', { epost })}</p>
      </AppHeader>
      <main id="innhold" className="mx-auto flex max-w-[900px] flex-col gap-4 px-4 py-8 md:px-6">
        {(fs ?? []).length === 0 ? (
          <EmptyState illustrasjon="/illustrasjoner/tom-tallerken.svg" tittel={t('Ingen forespørsler ennå')} handling={<ButtonLink href={sti('/foresporsel')}>{t('Få tilbud')}</ButtonLink>}>
            {t('Forespørsler du sender med denne e-postadressen, vises her.')}
          </EmptyState>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {(fs ?? []).map((f) => (
                <li key={f.id}>
                  <Link href={sti(`/foresporsler/${f.id}`)} className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-surface p-5 text-text no-underline hover:text-text hover:shadow-float">
                    <span className="flex flex-col gap-1">
                      <strong className="text-[19px]">
                        {anledningNavn(f.anledning as Anledning, t)} · {t('{gjester} gjester', { gjester: f.gjester })}
                      </strong>
                      <span className="text-[15px] text-text-muted">
                        {f.dato ? stor(datoKort(f.dato, info.intl)) : t('Fleksibel dato')} · {f.poststed}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="k-num text-[15px] font-semibold">{t((antall.get(f.id) ?? 0) === 1 ? '1 tilbud' : '{antall} tilbud', { antall: antall.get(f.id) ?? 0 })}</span>
                      <Badge tone={f.status === 'aktiv' ? 'ny' : 'opplast'}>{statusTekst[f.status] ? t(statusTekst[f.status]) : f.status}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink href={sti('/foresporsel')} variant="secondary" className="self-start">
              {t('Send en ny forespørsel')}
            </ButtonLink>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
