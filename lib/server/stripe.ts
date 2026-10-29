import 'server-only';
import Stripe from 'stripe';

let _stripe: Stripe | null = null;
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY mangler');
  _stripe ??= new Stripe(key);
  return _stripe;
}

let _mva: string | null = null;
/** Finner eller lager en skattesats for 25 % norsk mva (eksklusiv). */
export async function mvaSats(): Promise<string> {
  if (_mva) return _mva;
  const s = stripe();
  const liste = await s.taxRates.list({ active: true, limit: 100 });
  const finnes = liste.data.find((t) => t.percentage === 25 && !t.inclusive && t.metadata?.kuverto === 'mva25');
  if (finnes) return (_mva = finnes.id);
  const ny = await s.taxRates.create({ display_name: 'MVA', percentage: 25, inclusive: false, country: 'NO', jurisdiction: 'NO', description: 'Norsk merverdiavgift 25 %', metadata: { kuverto: 'mva25' } });
  return (_mva = ny.id);
}
