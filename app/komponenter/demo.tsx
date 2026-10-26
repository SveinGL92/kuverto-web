'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { Tabs } from '@/components/ui/Tabs';

export function KomponentDemo() {
  const [valgt, setValgt] = useState('Firmalunsj');
  const [fane, setFane] = useState('nye');
  return (
    <>
      <section className="flex flex-col gap-3.5">
        <h2 className="k-heading m-0 text-2xl">Valg</h2>
        <div className="flex flex-wrap gap-2">
          {['Firmalunsj', 'Julebord', 'Bryllup'].map((v) => (
            <Chip key={v} pressed={valgt === v} onClick={() => setValgt(v)}>
              {v}
            </Chip>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3.5">
        <h2 className="k-heading m-0 text-2xl">Faner</h2>
        <Tabs
          label="Forespørsler"
          aktiv={fane}
          onVelg={setFane}
          faner={[
            { id: 'nye', navn: 'Nye', antall: 8 },
            { id: 'opplaste', navn: 'Opplåste', antall: 3 },
            { id: 'sendte', navn: 'Sendte tilbud' },
          ]}
        />
        <div role="tabpanel" id={`${fane}-panel`} aria-labelledby={`${fane}-fane`} className="text-small text-text-muted">
          Valgt fane: {fane}
        </div>
      </section>
    </>
  );
}
