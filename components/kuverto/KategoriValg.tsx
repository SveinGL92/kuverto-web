'use client';

import { useSprak } from '@/components/Sprak';
import { anledninger, anledningNavn } from '@/lib/labels';

/** <option>-er for kategoriene, gruppert i anledninger og mattyper. */
export function KategoriValg() {
  const { t } = useSprak();
  const gruppe = (g: 'anledning' | 'mattype') =>
    anledninger
      .filter((a) => a.gruppe === g)
      .map((a) => (
        <option key={a.id} value={a.id}>
          {anledningNavn(a.id, t)}
        </option>
      ));
  return (
    <>
      <optgroup label={t('Anledning')}>{gruppe('anledning')}</optgroup>
      <optgroup label={t('Type mat')}>{gruppe('mattype')}</optgroup>
      <option value="annet">{t('Noe annet')}</option>
    </>
  );
}
