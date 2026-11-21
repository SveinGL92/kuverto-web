"use client";

import Link from "next/link";
import { useSprak } from "@/components/Sprak";
import {
  MARKEDER,
  MARKED_INFO,
  medPrefiks,
  UTLAND_LANSERT,
} from "@/lib/markets";
import { Symbol } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function SiteFooter() {
  const { marked, t, sti } = useSprak();
  const kolonner = [
    {
      tittel: t("For deg som bestiller"),
      lenker: [
        { href: sti("/foresporsel"), navn: t("Få tilbud") },
        { href: `${sti("/")}#slik-fungerer-det`, navn: t("Slik fungerer det") },
        { href: `${sti("/")}#anledninger`, navn: t("Anledninger") },
      ],
    },
    {
      tittel: t("For leverandører"),
      lenker: [
        { href: sti("/bli-leverandor"), navn: t("Bli leverandør") },
        { href: `${sti("/for-leverandorer")}#priser`, navn: t("Priser") },
        { href: sti("/logg-inn?rolle=leverandor"), navn: t("Logg inn") },
      ],
    },
    {
      tittel: "Kuverto",
      lenker: [
        { href: "mailto:hei@kuverto.no", navn: "hei@kuverto.no" },
        { href: sti("/personvern"), navn: t("Personvern") },
      ],
    },
  ];
  return (
    <footer className="k-wrap mt-16 pb-10 text-[15px] text-text-muted md:mt-24">
      <div className="flex flex-col gap-8 border-t border-border pt-10 md:flex-row md:flex-wrap md:justify-between md:gap-12 md:pt-14">
        <div className="flex max-w-[30ch] flex-col gap-3">
          <span className="flex items-center gap-2 text-primary">
            <Symbol size={22} />
            <span className="k-heading text-xl leading-none">kuverto</span>
          </span>
          <p className="m-0 leading-normal">
            {t(
              "Én forespørsel, flere tilbud, i hele Norge. Du får tilbud fra leverandørene som leverer i området ditt.",
            )}
          </p>
        </div>
        <nav
          aria-label={t("Bunnmeny")}
          className="grid grid-cols-1 gap-6 min-[420px]:grid-cols-2 md:flex md:gap-14"
        >
          {kolonner.map((k) => (
            <div key={k.tittel} className="flex flex-col gap-1">
              <h2 className="m-0 mb-1 text-[15px] font-bold text-text">
                {k.tittel}
              </h2>
              <ul className="m-0 flex list-none flex-col p-0">
                {k.lenker.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-touch items-center text-text-muted no-underline hover:text-text hover:underline"
                    >
                      {l.navn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      {/* Landvelgeren vises på norske sider først når utlandet er lansert, så norsk side er uendret til da. */}
      {(UTLAND_LANSERT || marked !== "no") && (
        <nav
          aria-label={t("Land og språk")}
          className="mt-8 border-t border-border pt-6"
        >
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-1 p-0">
            {MARKEDER.map((m, i) => (
              <li key={m} className="flex items-center gap-x-1">
                {i > 0 && <span aria-hidden="true">·</span>}
                {/* Vanlig lenke (ikke Link), så hele siden lastes på nytt med riktig språk. */}
                <a
                  href={medPrefiks(m, "/")}
                  lang={MARKED_INFO[m].htmlLang}
                  hrefLang={MARKED_INFO[m].htmlLang}
                  aria-current={m === marked ? "true" : undefined}
                  className={
                    m === marked
                      ? "inline-flex min-h-touch items-center px-1 font-bold text-text no-underline"
                      : "inline-flex min-h-touch items-center px-1 text-text-muted no-underline hover:text-text hover:underline"
                  }
                >
                  {MARKED_INFO[m].land}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <span>{t("© 2026 Puncheur AS · Org.nr. 999 552 536")}</span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
