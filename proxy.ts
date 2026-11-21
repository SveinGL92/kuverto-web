import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { erMarked, MARKED_COOKIE, MARKED_HEADER, type Marked } from '@/lib/markets';

/**
 * Landprefiks (som Samtura): /se, /dk og /fi skrives om til samme sider med markedet i en header.
 * Norge har ikke prefiks. Valgt land huskes i en cookie, så lenker uten prefiks sender deg til riktig land.
 * Fornyer også Supabase-sesjonen på sider som trenger innlogging.
 */
const PREFIKS = /^\/(no|se|dk|fi)(?=\/|$)/;
// Disse har ikke landprefiks: API, innlogging, admin, filer.
const UTEN_MARKED = /^\/(api|auth|admin|logg-ut|epost|_next|komponenter|tilstander)(\/|$)|\.[a-z0-9]+$/i;
const MED_SESJON = /^\/(leverandor|admin|mine-foresporsler|foresporsler|min-side|logg-inn)(\/|$)/;
const ETT_AR = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const treff = pathname.match(PREFIKS);
  let marked: Marked = 'no';
  let indre = pathname;

  if (treff) {
    const kode = treff[1] as Marked;
    const rest = pathname.slice(treff[0].length) || '/';
    if (kode === 'no') {
      // /no/... er bare en vei tilbake til Norge.
      const r = NextResponse.redirect(new URL(`${rest}${search}`, request.url));
      r.cookies.set(MARKED_COOKIE, 'no', { path: '/', maxAge: ETT_AR, sameSite: 'lax' });
      return r;
    }
    marked = kode;
    indre = rest;
  } else if (!UTEN_MARKED.test(pathname)) {
    const lagret = request.cookies.get(MARKED_COOKIE)?.value;
    if (erMarked(lagret) && lagret !== 'no' && request.method === 'GET') {
      return NextResponse.redirect(new URL(`/${lagret}${pathname === '/' ? '' : pathname}${search}`, request.url));
    }
  }

  const reqHeaders = new Headers(request.headers);
  reqHeaders.set(MARKED_HEADER, marked);
  const lag = () => {
    if (treff) {
      const url = request.nextUrl.clone();
      url.pathname = indre;
      return NextResponse.rewrite(url, { request: { headers: reqHeaders } });
    }
    return NextResponse.next({ request: { headers: reqHeaders } });
  };
  let response = lag();

  if (MED_SESJON.test(indre)) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (liste) => {
          liste.forEach(({ name, value }) => request.cookies.set(name, value));
          response = lag();
          liste.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }
  if (treff && request.cookies.get(MARKED_COOKIE)?.value !== marked) {
    response.cookies.set(MARKED_COOKIE, marked, { path: '/', maxAge: ETT_AR, sameSite: 'lax' });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml|pdf|woff2|json)$).*)'],
};
