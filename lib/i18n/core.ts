/** Kjerne uten ordbøker, trygg å importere i klientkomponenter. */
export type Ordbok = Record<string, string>;
export type Vars = Record<string, string | number>;

/** Setter inn {navn}-felt. */
export function fyll(tekst: string, vars?: Vars) {
  if (!vars) return tekst;
  return tekst.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Lager t(): slår opp den norske teksten i ordboken, ellers vises norsk. */
export function lagT(ord: Ordbok) {
  return (tekst: string, vars?: Vars) => fyll(ord[tekst] ?? tekst, vars);
}

export type T = ReturnType<typeof lagT>;
