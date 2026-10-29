import type { MetadataRoute } from 'next';
import { anledningerInnhold } from '@/lib/anledninger-innhold';

const BASE = 'https://kuverto.no';

// Bare offentlige sider. Demosider, innlogging og personvern (utkast) har noindex og står ikke her.
export default function sitemap(): MetadataRoute.Sitemap {
  const sist = new Date('2026-10-29');
  return [
    { url: `${BASE}/`, lastModified: sist, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/foresporsel`, lastModified: sist, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/for-leverandorer`, lastModified: sist, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/bli-leverandor`, lastModified: sist, changeFrequency: 'monthly', priority: 0.6 },
    ...anledningerInnhold.map((a) => ({
      url: `${BASE}/catering/${a.slug}`,
      lastModified: sist,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
