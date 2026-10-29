import type Stripe from 'stripe';
import { stripe } from '@/lib/server/stripe';
import { db } from '@/lib/server/supabase';

// Stripe kaller denne når en betaling er fullført. Klippene krediteres én gang per sesjon.
export async function POST(request: Request) {
  const signatur = request.headers.get('stripe-signature');
  const hemmelig = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signatur || !hemmelig) return new Response('Mangler signatur', { status: 400 });
  let hendelse: Stripe.Event;
  try {
    hendelse = stripe().webhooks.constructEvent(await request.text(), signatur, hemmelig);
  } catch (e) {
    console.error('[webhook] ugyldig signatur', e);
    return new Response('Ugyldig signatur', { status: 400 });
  }
  if (hendelse.type === 'checkout.session.completed' || hendelse.type === 'checkout.session.async_payment_succeeded') {
    const s = hendelse.data.object as Stripe.Checkout.Session;
    const levId = s.metadata?.leverandor_id;
    const klipp = Number(s.metadata?.klipp);
    if (s.payment_status === 'paid' && levId && klipp > 0) {
      const { error } = await db()
        .from('klipp_transaksjoner')
        .upsert({ leverandor_id: levId, endring: klipp, grunn: 'kjop', referanse: `stripe:${s.id}` }, { onConflict: 'referanse', ignoreDuplicates: true });
      if (error) {
        console.error('[webhook] kreditering feilet', error);
        return new Response('Feil', { status: 500 });
      }
    }
  }
  return new Response('ok');
}
