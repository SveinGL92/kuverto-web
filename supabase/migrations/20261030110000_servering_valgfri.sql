-- Servering er tatt ut av skjemaet (avtales med leverandøren). Eldre forespørsler beholder verdien.
alter table public.foresporsler alter column servering drop not null;
