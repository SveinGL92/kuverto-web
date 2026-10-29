import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { authKlient } from '@/lib/server/supabase';

// Lenken i innloggingseposten: verifiserer token_hash og sender videre til riktig side.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = (url.searchParams.get('type') ?? 'email') as EmailOtpType;
  if (tokenHash) {
    const supabase = await authKlient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL('/min-side', url.origin));
  }
  return NextResponse.redirect(new URL('/logg-inn?feil=lenke', url.origin));
}
