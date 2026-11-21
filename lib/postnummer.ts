// Fase 1: enkel validering og noen få poststeder som mock.
// Fase 2: oppslag mot Postens postnummerregister (postnummer → kommune → fylke).

/** Bare sifre, høyst så mange som markedet bruker (4 i Norge og Danmark, 5 i Sverige og Finland). */
export const rensPostnummer = (v: string, lengde: 4 | 5 = 4) => v.replace(/\D/g, '').slice(0, lengde);

export const gyldigPostnummer = (v: string, lengde: 4 | 5 = 4) => new RegExp(`^\\d{${lengde}}$`).test(v) && !/^0+$/.test(v);

const kjente: Record<string, string> = {
  '0150': 'Oslo sentrum',
  '0151': 'Oslo sentrum',
  '0154': 'Oslo sentrum',
  '0250': 'Oslo',
  '0450': 'Oslo',
  '1337': 'Sandvika',
  '1430': 'Ås',
  '2000': 'Lillestrøm',
  '3015': 'Drammen',
  '4006': 'Stavanger',
  '5003': 'Bergen',
  '7010': 'Trondheim',
  '9008': 'Tromsø',
};

export const poststed = (v: string): string | undefined => kjente[v];
