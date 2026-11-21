import type { MetadataRoute } from 'next';
import { anledningerInnhold } from '@/lib/anledninger-innhold';
import { MARKED_INFO, MARKEDER, medPrefiks, UTLAND_LANSERT, type Marked } from '@/lib/markets';

const BASE = 'https://kuverto.no';

// Bare offentlige sider. Demosider, innlogging og personvern (utkast) har noindex og står ikke her.
// Hver side finnes i alle markeder (/, /se, /dk, /fi) med hreflang-alternativer.
export default function sitemap(): MetadataRoute.Sitemap {
  const sist = new Date('2026-11-21');
  const markeder: readonly Marked[] = UTLAND_LANSERT ? MARKEDER : ['no'];
  const sider: { sti: string; changeFrequency: 'weekly' | 'monthly'; priority: number }[] = [
    { sti: '/', changeFrequency: 'weekly', priority: 1 },
    { sti: '/foresporsel', changeFrequency: 'monthly', priority: 0.8 },
    { sti: '/for-leverandorer', changeFrequency: 'monthly', priority: 0.7 },
    { sti: '/bli-leverandor', changeFrequency: 'monthly', priority: 0.6 },
    ...anledningerInnhold.map((a) => ({ sti: `/catering/${a.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
  const url = (m: Marked, sti: string) => `${BASE}${medPrefiks(m, sti)}`;
  return sider.flatMap((s) =>
    markeder.map((m) => ({
      url: url(m, s.sti),
      lastModified: sist,
      changeFrequency: s.changeFrequency,
      priority: s.priority,
      ...(markeder.length > 1
        ? { alternates: { languages: { ...Object.fromEntries(markeder.map((x) => [MARKED_INFO[x].intl, url(x, s.sti)])), 'x-default': url('no', s.sti) } } }
        : {}),
    })),
  );
}
