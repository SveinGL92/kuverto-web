import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Supabase-klient for innlogging (leser og skriver sesjonen i informasjonskapsler). */
export async function authKlient() {
  const jar = await cookies();
  return createServerClient(URL, PUBLISHABLE, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (liste) => {
        try {
          liste.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Kalt fra en serverkomponent: proxy.ts fornyer sesjonen i stedet.
        }
      },
    },
  });
}

/** E-posten til innlogget bruker, med små bokstaver, eller null. */
export async function innloggetEpost(): Promise<string | null> {
  const s = await authKlient();
  const { data } = await s.auth.getUser();
  return data.user?.email?.toLowerCase() ?? null;
}

let _db: SupabaseClient | null = null;
/**
 * Databaseklient med secret key. Brukes bare på serveren, etter at koden selv har sjekket
 * hvem brukeren er og hva den har lov til. RLS stenger alt for klienter.
 */
export function db(): SupabaseClient {
  if (!_db) {
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!key) throw new Error('SUPABASE_SECRET_KEY mangler');
    _db = createClient(URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return _db;
}

export async function erAdmin(epost: string | null): Promise<boolean> {
  if (!epost) return false;
  const { data } = await db().from('admins').select('epost').eq('epost', epost).maybeSingle();
  return !!data;
}
