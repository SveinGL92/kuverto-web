// Kjører axe-core (WCAG 2.2 AA) mot sidene i lys og mørk modus, i 390 og 1440 px.
// Bruk: npm run build && npm start, deretter: node scripts/tilgjengelighet.mjs
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axe = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const ruter = ['/', '/foresporsel', '/logg-inn', '/foresporsler/f-firmalunsj', '/leverandor', '/tilstander'];
const browser = await chromium.launch();
let feil = 0;
for (const colorScheme of ['light', 'dark']) {
  for (const width of [390, 1440]) {
    const side = await browser.newPage({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' });
    for (const rute of ruter) {
      await side.goto(base + rute, { waitUntil: 'load' });
      await side.waitForTimeout(400);
      await side.addScriptTag({ content: axe });
      const res = await side.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }),
      );
      for (const v of res.violations) {
        feil++;
        console.log(`${colorScheme} ${width} ${rute}  [${v.impact}] ${v.id}: ${v.help}`);
        for (const n of v.nodes.slice(0, 3)) console.log('    ', n.target.join(' '), '|', n.failureSummary?.split('\n')[1]?.trim());
      }
    }
    await side.close();
  }
}
await browser.close();
console.log(feil === 0 ? 'Ingen brudd funnet.' : `${feil} brudd.`);
process.exit(feil ? 1 : 0);
