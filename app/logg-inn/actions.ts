'use server';

import { authKlient } from '@/lib/server/supabase';

const epostOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export async function sendInnloggingslenke(epost: string): Promise<{ ok: true } | { ok: false; feil: string }> {
  const e = epost.trim().toLowerCase();
  if (!epostOk(e)) return { ok: false, feil: 'Skriv en gyldig e-postadresse, for eksempel kari@firma.no.' };
  const supabase = await authKlient();
  const { error } = await supabase.auth.signInWithOtp({ email: e, options: { shouldCreateUser: true } });
  if (error) {
    console.error('[innlogging]', error.message);
    if (error.status === 429) return { ok: false, feil: 'Du har bedt om mange lenker på kort tid. Vent et par minutter og prøv igjen.' };
    return { ok: false, feil: 'Vi fikk ikke sendt lenken. Prøv igjen om litt.' };
  }
  return { ok: true };
}
