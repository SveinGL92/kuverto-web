'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { Symbol } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import type { Rolle } from '@/lib/types';

const epostOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function Innlogging() {
  const q = useSearchParams();
  const [rolle, setRolle] = useState<Rolle>(q.get('rolle') === 'leverandor' ? 'leverandor' : 'kunde');
  const [epost, setEpost] = useState('');
  const [feil, setFeil] = useState<string>();
  const [status, setStatus] = useState<'klar' | 'sender' | 'sendt'>('klar');
  const kvittering = useRef<HTMLHeadingElement>(null);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!epostOk(epost)) {
      setFeil(epost.includes('@') ? 'Mangler domene, f.eks. @firma.no' : 'Skriv e-postadressen din, f.eks. kari@firma.no');
      document.getElementById('felt-epost')?.focus();
      return;
    }
    setStatus('sender');
    // Fase 2: Supabase signInWithOtp({ email, options: { data: { rolle } } })
    await new Promise((r) => setTimeout(r, 600));
    setStatus('sendt');
    requestAnimationFrame(() => kvittering.current?.focus());
  };

  return (
    <main id="innhold" className="flex min-h-dvh flex-col md:grid md:grid-cols-2">
      <div className="relative h-[250px] shrink-0 md:sticky md:top-0 md:h-dvh md:p-4">
        <div className="absolute inset-0 overflow-hidden rounded-b-card bg-[var(--k-photo-placeholder)] md:inset-4 md:rounded-panel">
          <Image
            src="/bilder/kaffe-kake.webp"
            alt="Kaffe og bløtkake på et dekket bord"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
        </div>
        <Link href="/" className="absolute left-4 top-3.5 flex items-center gap-2 bg-bg px-3 py-2 text-primary no-underline hover:text-primary md:left-8 md:top-8">
          <Symbol size={22} />
          <span className="k-heading text-[22px] leading-none tracking-[-0.035em]">kuverto</span>
          <span className="sr-only">, til forsiden</span>
        </Link>
        <Link
          href="/"
          aria-label="Lukk og gå til forsiden"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-pill bg-bg text-text md:right-8 md:top-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-grow flex-col md:justify-center md:px-12">
        <div className="w-full md:mx-auto md:max-w-[440px]">
          {status === 'sendt' ? (
            <div className="flex flex-col gap-4 px-4 pt-7" role="status">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/illustrasjoner/bordkort.svg" alt="" className="k-ink w-[120px]" />
              <h1 ref={kvittering} tabIndex={-1} className="k-heading m-0 text-[36px] leading-[1.02] outline-none">
                Sjekk e-posten din
              </h1>
              <p className="m-0 text-[17px] text-text-muted">
                Vi har sendt en innloggingslenke til <strong className="text-text">{epost.trim()}</strong>. Lenken virker i 15 minutter.
              </p>
              <p className="m-0 text-[15px] text-text-muted">Finner du den ikke? Sjekk søppelpost, eller prøv igjen.</p>
              <Button variant="secondary" onClick={() => setStatus('klar')} className="self-start">
                Bruk en annen e-post
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 px-4 pt-7">
                <h1 className="k-heading m-0 text-[36px] leading-[1.02]">Velkommen tilbake</h1>
                <p className="m-0 text-[17px] text-text-muted">Vi sender en innloggingslenke til e-posten din. Ingen passord å huske.</p>
              </div>
              <Tabs
                label="Kontotype"
                aktiv={rolle}
                onVelg={(id) => setRolle(id as Rolle)}
                className="mx-4 mt-6"
                faner={[
                  { id: 'kunde', navn: 'Jeg bestiller mat' },
                  { id: 'leverandor', navn: 'Jeg er leverandør' },
                ]}
              />
              <form
                noValidate
                onSubmit={send}
                role="tabpanel"
                id={`${rolle}-panel`}
                aria-labelledby={`${rolle}-fane`}
                className="flex flex-col gap-3.5 px-4 pt-6"
              >
                <Input
                  id="felt-epost"
                  label={rolle === 'leverandor' ? 'E-post til bedriften' : 'E-post'}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={epost}
                  onChange={(e) => {
                    setEpost(e.target.value);
                    setFeil(undefined);
                  }}
                  feil={feil}
                  className="[&_input]:min-h-14"
                />
                <Button type="submit" size="lg" busy={status === 'sender'} disabled={status === 'sender'} className="min-h-14">
                  {status === 'sender' ? 'Sender' : 'Send innloggingslenke'}
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="mb-0 mt-auto border-t border-border px-4 pb-7 pt-[18px] text-[15px] text-text-muted md:mx-auto md:mt-12 md:w-full md:max-w-[440px] md:border-0">
          {rolle === 'leverandor' ? (
            <>
              Ny leverandør? <Link href="/logg-inn?rolle=leverandor" className="font-semibold">Registrer bedriften</Link>, så godkjenner vi den på org.nr.
            </>
          ) : (
            <>
              Ny her? <Link href="/foresporsel" className="font-semibold">Send en forespørsel</Link>, så lager vi kontoen for deg.
            </>
          )}
        </p>
      </div>
    </main>
  );
}
