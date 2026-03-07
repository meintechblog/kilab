export const dynamic = "force-dynamic";

import { formatInTimeZone } from "date-fns-tz";
import { PriceDashboard } from "@/src/components/price-dashboard";
import { getDashboardData } from "@/src/lib/prices/query";

export default async function Home() {
  const dashboard = await getDashboardData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,#f5fbf7_0%,#eef5ff_55%,#f4f5f6_100%)] px-5 py-6 text-zinc-950 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,255,247,0.8))] p-8 shadow-[0_24px_80px_rgba(14,35,21,0.08)] ring-1 ring-white/70 backdrop-blur md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-800/70">kilab webapp</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.6fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
                Deutscher Viertelstunden-Strompreis mit Endkundenblick fuer {dashboard.locationLabel}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
                Eine Woche Rueckblick, verfuegbare Zukunft, lokale Schwäbisch-Hall-Aufschlaege und mehrere Realpreis-Szenarien fuer einen flexiblen Tarif.
              </p>
            </div>
            <div className="rounded-[2rem] border border-emerald-200/70 bg-emerald-50/80 p-5">
              <p className="text-sm text-emerald-900/70">Generiert</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-950">
                {formatInTimeZone(dashboard.generatedAt, "Europe/Berlin", "dd.MM.yyyy HH:mm")}
              </p>
              <p className="mt-3 text-sm text-emerald-900/70">
                Verfuegbar bis {dashboard.availableUntil ? formatInTimeZone(dashboard.availableUntil, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}
              </p>
            </div>
          </div>
        </section>

        <PriceDashboard dashboard={dashboard} />
      </div>
    </main>
  );
}
