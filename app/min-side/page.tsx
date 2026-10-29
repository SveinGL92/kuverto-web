import { redirect } from 'next/navigation';
import { db, erAdmin, innloggetEpost } from '@/lib/server/supabase';

// Sender innlogget bruker til riktig side ut fra rolle.
export default async function MinSide() {
  const epost = await innloggetEpost();
  if (!epost) redirect('/logg-inn');
  if (await erAdmin(epost)) redirect('/admin');
  const { data: lev } = await db().from('leverandorer').select('id').eq('epost', epost).maybeSingle();
  if (lev) redirect('/leverandor');
  redirect('/mine-foresporsler');
}
