// Tar skjermbilder av sidene i 390 og 1440 px for sammenligning med artboardene i design/artboards.
// Bruk: npm run build && npm start, deretter i et annet vindu: npm run skjermbilder [-- /sti /sti2 --dark]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const dark = args.includes('--dark');
const stier = args.filter((a) => a.startsWith('/'));
const ruter = stier.length ? stier : ['/', '/foresporsel', '/logg-inn', '/foresporsler/f-firmalunsj', '/leverandor', '/komponenter'];
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const bredder = [390, 1440];

await mkdir('skjermbilder', { recursive: true });
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
);
for (const bredde of bredder) {
  const side = await browser.newPage({ viewport: { width: bredde, height: bredde < 600 ? 844 : 900 }, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce', locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  for (const rute of ruter) {
    await side.goto(base + rute, { waitUntil: 'load' });
    await side.waitForTimeout(1800);
    const navn = (rute === '/' ? 'forside' : rute.slice(1).replaceAll('/', '_')) + `-${bredde}${dark ? '-mork' : ''}.png`;
    await side.screenshot({ path: `skjermbilder/${navn}`, fullPage: true });
    console.log('skjermbilder/' + navn);
  }
  await side.close();
}
await browser.close();
