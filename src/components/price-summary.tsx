import { formatInTimeZone } from "date-fns-tz";

type PricePoint = {
  startAt: string;
  endAt: string;
  priceCtKwh: number;
} | null;

type LastSync = {
  finished_at: string | null;
  rows_inserted: number;
  rows_updated: number;
} | null;

export function PriceSummary({
  dayAhead,
  intraday,
  lastSync,
}: {
  dayAhead: PricePoint;
  intraday: PricePoint;
  lastSync: LastSync;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Aktuell</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Day-Ahead 15 min"
            price={dayAhead?.priceCtKwh ?? null}
            period={formatPeriod(dayAhead)}
            tone="text-emerald-950"
          />
          <MetricCard
            label="Intraday 15 min"
            price={intraday?.priceCtKwh ?? null}
            period={formatPeriod(intraday)}
            tone="text-sky-950"
          />
        </div>
      </article>
      <article className="rounded-[2rem] bg-[linear-gradient(145deg,#0f3b2d,#124c49)] p-6 text-white shadow-[0_24px_80px_rgba(8,25,32,0.18)]">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">Sync</p>
        <p className="mt-4 text-3xl font-semibold">{lastSync ? "bereit" : "noch leer"}</p>
        <p className="mt-2 text-sm text-emerald-50/80">
          {lastSync?.finished_at
            ? `Letzter erfolgreicher Import: ${formatInTimeZone(lastSync.finished_at, "Europe/Berlin", "dd.MM.yyyy HH:mm")}`
            : "Noch kein erfolgreicher Import vorhanden."}
        </p>
        <p className="mt-6 text-sm text-emerald-50/80">
          {lastSync
            ? `${lastSync.rows_inserted} neue Punkte, ${lastSync.rows_updated} aktualisierte Punkte`
            : "Nach dem Backfill erscheinen hier die Sync-Details."}
        </p>
      </article>
    </section>
  );
}

function MetricCard({
  label,
  price,
  period,
  tone,
}: {
  label: string;
  price: number | null;
  period: string;
  tone: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200/80 bg-zinc-50/90 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-3 text-4xl font-semibold ${tone}`}>{price === null ? "-" : `${price.toFixed(2)} ct/kWh`}</p>
      <p className="mt-2 text-sm text-zinc-500">{period}</p>
    </div>
  );
}

function formatPeriod(point: PricePoint) {
  if (!point) {
    return "Kein Wert verfuegbar";
  }

  return `${formatInTimeZone(point.startAt, "Europe/Berlin", "dd.MM. HH:mm")} - ${formatInTimeZone(point.endAt, "Europe/Berlin", "HH:mm")}`;
}
