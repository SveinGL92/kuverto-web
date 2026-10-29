import { NextResponse, type NextRequest } from 'next/server';
import { authKlient } from '@/lib/server/supabase';

export async function POST(request: NextRequest) {
  const supabase = await authKlient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
