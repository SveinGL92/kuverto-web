import { UTLAND_LANSERT } from '@/lib/markets';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SprakProvider } from '@/components/Sprak';
import { ordbok } from '@/lib/i18n';
import { sprak } from '@/lib/server/marked';
import './globals.css';

// Fontene ligger lokalt (variable fonter fra Fontsource, SIL OFL), slik at besøkende
// ikke sendes videre til Google. Manrope brukes i 800, Albert Sans i 400–700.
const manrope = localFont({
  src: './fonts/manrope.woff2',
  weight: '200 800',
  variable: '--font-manrope',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});
const albert = localFont({
  src: './fonts/albert-sans.woff2',
  weight: '100 900',
  variable: '--font-albert',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t, info, marked } = await sprak();
  return {
    metadataBase: new URL('https://kuverto.no'),
    title: { default: t('Kuverto – catering til hvert kuvert'), template: '%s · Kuverto' },
    description: t('Send én forespørsel og få tilbud på catering fra godkjente leverandører nær deg, med meny og pris per kuvert. Gratis og uforpliktende.'),
    applicationName: 'Kuverto',
    openGraph: { siteName: 'Kuverto', locale: info.ogLocale, type: 'website' },
    // Sverige, Danmark og Finland indekseres først når oversettelsene er ferdige.
    ...(marked !== 'no' && !UTLAND_LANSERT ? { robots: { index: false, follow: false } } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F4EA' },
    { media: '(prefers-color-scheme: dark)', color: '#12160A' },
  ],
};

// Setter lagret tema før første opptegning, så siden ikke blinker.
const temaSkript = `try{var t=localStorage.getItem('kuverto-tema');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { marked, info, t } = await sprak();
  return (
    <html lang={info.htmlLang} className={`${manrope.variable} ${albert.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaSkript }} />
      </head>
      <body>
        <a
          href="#innhold"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-surface focus:px-5 focus:py-3 focus:font-bold"
        >
          {t('Hopp til innholdet')}
        </a>
        <SprakProvider marked={marked} ord={ordbok(info.sprak)}>
          {children}
        </SprakProvider>
        <Analytics />
      </body>
    </html>
  );
}
