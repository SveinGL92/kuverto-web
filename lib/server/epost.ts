import 'server-only';
import { Resend } from 'resend';
import { tFor } from '@/lib/i18n';
import { MARKED_INFO, medPrefiks, type Marked } from '@/lib/markets';
import { siteUrl } from './site';

const FRA = 'Kuverto <varsel@kuverto.no>';
const SVAR_TIL = 'hei@kuverto.no';
/** Varsler om nye forespørsler og leverandører går hit. */
export const ADMIN_VARSEL = ['hei@kuverto.no', 's.lierstuen@gmail.com'];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Enkel e-postmal i Kuverto-stil. Avsnitt er ren tekst og escapes.
 * marked: mottakerens marked. Gir riktig språk på faste tekster og landprefiks på lenken (sti uten prefiks).
 * Tittel, avsnitt og knappetekst oversettes av den som kaller (tFor(marked)).
 */
export function mal({ tittel, avsnitt, knapp, fot, marked = 'no' }: { tittel: string; avsnitt: string[]; knapp?: { tekst: string; sti: string }; fot?: string; marked?: Marked }) {
  const t = tFor(marked);
  const lenke = knapp ? (knapp.sti.startsWith('http') ? knapp.sti : siteUrl() + medPrefiks(marked, knapp.sti)) : '';
  return `<!doctype html><html lang="${MARKED_INFO[marked].htmlLang}"><body style="margin:0;background:#F6F4EA;font-family:Arial,Helvetica,sans-serif;color:#1C2210">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="margin:0 0 24px;font-size:22px;font-weight:800;color:#2E3A12;letter-spacing:-0.5px">kuverto</p>
<div style="background:#ffffff;border-radius:24px;padding:28px">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2">${esc(tittel)}</h1>
${avsnitt.map((a) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55">${esc(a).replace(/\n/g, '<br>')}</p>`).join('')}
${knapp ? `<p style="margin:22px 0 4px"><a href="${esc(lenke)}" style="display:inline-block;padding:13px 24px;background:#2E3A12;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:bold">${esc(knapp.tekst)}</a></p>` : ''}
</div>
<p style="margin:20px 4px 0;font-size:13px;line-height:1.5;color:#5F6152">${esc(fot ?? t('Du får denne e-posten fordi du bruker Kuverto. Svar på e-posten hvis du har spørsmål.'))}<br>Kuverto · Puncheur AS · ${marked === 'no' ? 'Org.nr. 999 552 536' : 'Org.nr. 999 552 536 · Konows Gate 26, 0196 Oslo, Norway'}</p>
</div></body></html>`;
}

let _resend: Resend | null = null;

/** Sender e-post. Feiler aldri hele handlingen: feil logges. */
export async function sendEpost({ til, emne, html, svarTil }: { til: string | string[]; emne: string; html: string; svarTil?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[epost] RESEND_API_KEY mangler, sender ikke:', emne, til);
    return;
  }
  _resend ??= new Resend(key);
  try {
    const { error } = await _resend.emails.send({ from: FRA, to: til, subject: emne, html, replyTo: svarTil ?? SVAR_TIL });
    if (error) console.error('[epost] feil', error);
  } catch (e) {
    console.error('[epost] unntak', e);
  }
}
