const tall = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });

/** Øre til «kr 7 225». */
export const kr = (ore: number) => `kr ${tall.format(Math.round(ore / 100))}`.replace(/ | /g, ' ');

const parse = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
};

/** «torsdag 14. november» */
export const datoLang = (iso: string, intl = 'nb-NO') =>
  new Intl.DateTimeFormat(intl, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parse(iso));

/** «tor. 14. nov.» uten avsluttende punktum: «tor. 14. nov» */
export const datoKort = (iso: string, intl = 'nb-NO') =>
  new Intl.DateTimeFormat(intl, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
    .format(parse(iso))
    .replace(/\.$/, '');

/** «14. nov» */
export const dagMnd = (iso: string, intl = 'nb-NO') =>
  new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(parse(iso)).replace(/\.$/, '');

/** «8. november» */
export const dagMndLang = (iso: string, intl = 'nb-NO') =>
  new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(parse(iso));

export const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
