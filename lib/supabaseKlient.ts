'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Nettleserklient, bare til opplasting med signerte URL-er fra serveren. Ingen tabeller er åpne for klienten. */
let klient: SupabaseClient | undefined;
export function supabaseKlient() {
  klient ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return klient;
}
