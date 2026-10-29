/** «12 min», «1 t», «i går», «3 dager». */
const naMs = () => Date.now();

export function tidSiden(iso: string, na = naMs()) {
  const min = Math.max(1, Math.round((na - Date.parse(iso)) / 60_000));
  if (min < 60) return `${min} min`;
  const t = Math.round(min / 60);
  if (t < 24) return `${t} t`;
  const d = Math.round(t / 24);
  return d === 1 ? 'i går' : `${d} dager`;
}

/** Dager fra i dag til en dato (YYYY-MM-DD). */
export function dagerTil(iso: string, na = new Date(naMs())) {
  // Dagens dato i norsk tid.
  const [ny, nm, nd] = na.toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' }).split('-').map(Number);
  const idag = Date.UTC(ny, nm - 1, nd);
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - idag) / 86_400_000);
}
