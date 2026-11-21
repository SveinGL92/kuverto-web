/**
 * Oversettelser. Nøkkel = den norske teksten nøyaktig slik den står i koden (med {felt} for variabler).
 * Verdien er teksten på svensk (sv), dansk (da) og finsk (fi). Mangler en nøkkel, vises norsk.
 */
const ord: { sv: Record<string, string>; da: Record<string, string>; fi: Record<string, string> } = {
  sv: {},
  da: {},
  fi: {},
};
export default ord;
