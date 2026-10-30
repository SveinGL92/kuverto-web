import { anledninger } from '@/lib/labels';

/** <option>-er for kategoriene, gruppert i anledninger og mattyper. */
export function KategoriValg() {
  const gruppe = (g: 'anledning' | 'mattype') =>
    anledninger
      .filter((a) => a.gruppe === g)
      .map((a) => (
        <option key={a.id} value={a.id}>
          {a.navn}
        </option>
      ));
  return (
    <>
      <optgroup label="Anledning">{gruppe('anledning')}</optgroup>
      <optgroup label="Type mat">{gruppe('mattype')}</optgroup>
      <option value="annet">Noe annet</option>
    </>
  );
}
