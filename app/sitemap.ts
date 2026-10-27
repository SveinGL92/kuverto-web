import type { MetadataRoute } from 'next';

const BASE = 'https://kuverto.no';

// Bare offentlige sider. Demosider og innloggede sider har noindex og står ikke her.
export default function sitemap(): MetadataRoute.Sitemap {
  const sist = new Date('2026-10-27');
  return [
    { url: `${BASE}/`, lastModified: sist, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/foresporsel`, lastModified: sist, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
