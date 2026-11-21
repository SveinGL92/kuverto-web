import type { Ordbok } from '../core';
import felles from './felles';
import forside from './forside';
import kunde from './kunde';
import kundeEtter from './kunde-etter';
import leverandor from './leverandor';
import epost from './epost';

type Del = { sv: Ordbok; da: Ordbok; fi: Ordbok };
const deler: Del[] = [felles, forside, kunde, kundeEtter, leverandor, epost];

/** Alle oversettelser slått sammen per språk. Nøkkel = norsk tekst. */
export const ORD = {
  sv: Object.assign({}, ...deler.map((d) => d.sv)) as Ordbok,
  da: Object.assign({}, ...deler.map((d) => d.da)) as Ordbok,
  fi: Object.assign({}, ...deler.map((d) => d.fi)) as Ordbok,
};
