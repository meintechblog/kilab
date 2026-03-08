export const dynamic = "force-dynamic";

import { formatInTimeZone } from "date-fns-tz";
import { PriceDashboard } from "@/src/components/price-dashboard";
import { getDashboardData } from "@/src/lib/prices/query";

export default async function Home() {
  const dashboard = await getDashboardData();

  return (
    <main className="graphite-shell min-h-screen px-4 py-4 text-slate-50 md:px-8 md:py-8 xl:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="graphite-panel overflow-hidden rounded-[2rem] p-6 md:p-8 xl:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="graphite-pill inline-flex items-center gap-3 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.36em] text-orange-200/88">
                <span className="inline-flex size-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.9)]" />
                kilab strommarkt cockpit
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl xl:text-7xl">
                Strompreise fuer Deutschland, uebersetzt in echte Monatskosten fuer {dashboard.locationLabel}.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                Day-Ahead, Intraday, lokale Preisbestandteile, Fixpreis-Vergleich und ein Blick darauf, was davon real auf deiner Rechnung landet.
              </p>
            </div>
            <div className="grid min-w-[18rem] gap-4 lg:grid-cols-2 xl:w-[28rem] xl:grid-cols-1">
              <div className="graphite-panel-soft rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">Generiert</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {formatInTimeZone(dashboard.generatedAt, "Europe/Berlin", "dd.MM.yyyy HH:mm")}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Datenreichweite bis {dashboard.availableUntil ? formatInTimeZone(dashboard.availableUntil, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(20,83,45,0.35),rgba(6,18,18,0.82))] p-5 shadow-[0_24px_80px_rgba(8,25,32,0.26)]">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200/80">Haushaltsprofil</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-50">{dashboard.householdProfileLabel}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-100/70">
                  Referenzverbrauch {dashboard.annualConsumptionKwh.toLocaleString("de-DE")} kWh/Jahr, Preisstand {dashboard.pricingSourceVersion}
                </p>
              </div>
            </div>
          </div>
        </section>

        <PriceDashboard dashboard={dashboard} />
      </div>
    </main>
  );
}
