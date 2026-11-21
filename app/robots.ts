import type { MetadataRoute } from 'next';

// Sider som ikke skal i søk har noindex i metadata. De blokkeres ikke her,
// fordi Google må kunne lese siden for å se noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/auth/', ...['', '/se', '/dk', '/fi'].flatMap((p) => [`${p}/leverandor`, `${p}/mine-foresporsler`, `${p}/min-side`])] },
    sitemap: 'https://kuverto.no/sitemap.xml',
    host: 'https://kuverto.no',
  };
}
