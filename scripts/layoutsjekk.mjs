// Sjekker horisontal scrolling, små trykkflater og konsollfeil i flere bredder.
// Bruk: npm run build && npm start, deretter node scripts/layoutsjekk.mjs [/sti ...]
import { chromium } from 'playwright';

const stier = process.argv.slice(2).filter((a) => a.startsWith('/'));
const ruter = stier.length ? stier : ['/', '/foresporsel', '/logg-inn', '/foresporsler/f-firmalunsj', '/leverandor'];
const base = process.env.BASE_URL ?? 'http://localhost:3000';
const bredder = [320, 375, 390, 768, 1024, 1440];
const browser = await chromium.launch();
let feil = 0;
for (const bredde of bredder) {
  const side = await browser.newPage({ viewport: { width: bredde, height: 900 }, reducedMotion: 'reduce', locale: 'nb-NO' });
  const konsoll = [];
  side.on('console', (m) => m.type() === 'error' && konsoll.push(m.text()));
  side.on('pageerror', (e) => konsoll.push(e.message));
  for (const rute of ruter) {
    konsoll.length = 0;
    await side.goto(base + rute, { waitUntil: 'load' });
    await side.waitForTimeout(400);
    const r = await side.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const brede = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          if (b.width === 0 || getComputedStyle(el).visibility === 'hidden') return false;
          // Innhold inne i en scrollbar beholder er med vilje.
          for (let p = el.parentElement; p; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden') return false;
          }
          return b.right > vw + 1 || b.left < -1;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
      const sma = [...document.querySelectorAll('a, button, input, select, [role=button]')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          if (!b.width || el.closest('p, li > p, dd')) return false;
          return (b.width < 24 || b.height < 24) && getComputedStyle(el).position !== 'absolute';
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}»`);
      return { scroll: document.documentElement.scrollWidth > vw, brede, sma };
    });
    const problemer = [];
    if (r.scroll) problemer.push('horisontal scroll');
    if (r.brede.length) problemer.push('for brede: ' + r.brede.join(', '));
    if (r.sma.length) problemer.push('små trykkflater: ' + r.sma.join(', '));
    if (konsoll.length) problemer.push('konsoll: ' + konsoll.slice(0, 3).join(' | '));
    if (problemer.length) {
      feil++;
      console.log(`${bredde} ${rute}: ${problemer.join(' ; ')}`);
    }
  }
  await side.close();
}
await browser.close();
console.log(feil ? `${feil} sider med funn` : 'Ingen funn');
