import 'server-only';
import { redirect } from 'next/navigation';
import { erAdmin, innloggetEpost } from './supabase';

/** Stopper alle som ikke er admin. Brukes øverst i hver adminside. */
export async function kravAdminSide() {
  const epost = await innloggetEpost();
  if (!epost) redirect('/logg-inn');
  if (!(await erAdmin(epost))) redirect('/min-side');
  return epost;
}

export const dt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Oslo' }) : '–';

export const kr = (ore: number | null | undefined) => (ore == null ? '–' : `kr ${Math.round(ore / 100).toLocaleString('nb-NO')}`);

export const foresporselStatus: Record<string, string> = {
  venter_bekreftelse: 'Venter på kundens bekreftelse',
  aktiv: 'Aktiv',
  tildelt: 'Tildelt',
  trukket: 'Trukket av kunden',
  avvist: 'Avvist av admin',
  lukket: 'Lukket',
  utkast: 'Utkast',
  til_godkjenning: 'Til godkjenning',
};
export const leverandorStatus: Record<string, string> = { venter: 'Venter', godkjent: 'Godkjent', avvist: 'Avvist', suspendert: 'Suspendert' };
export const tilbudStatus: Record<string, string> = { sendt: 'Sendt', endret: 'Endret', godtatt: 'Valgt', avslatt: 'Avslått', trukket: 'Trukket', utlopt: 'Utløpt' };
export const klippGrunn: Record<string, string> = { kjop: 'Kjøp', opplasing: 'Opplåsing', refusjon: 'Refusjon', gratis: 'Gratis ved godkjenning', admin: 'Justert av admin' };
