import type { Metadata } from 'next';
import { Dashbord } from './Dashbord';

export const metadata: Metadata = {
  title: 'Leverandør – oversikt',
  description: 'Se nye cateringforespørsler i området ditt, lås opp dem du vil svare på og følg opp kunder.',
  robots: { index: false },
};

export default function LeverandorSide() {
  return <Dashbord />;
}
