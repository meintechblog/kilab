"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { PriceChart } from "./price-chart";
import type { DashboardChartRow, DashboardPoint } from "@/src/lib/prices/query";
import type { ScenarioId } from "@/src/lib/pricing/types";

type LastSync = {
  finished_at: string | null;
  rows_inserted: number;
  rows_updated: number;
} | null;

type ScenarioOption = {
  id: ScenarioId;
  label: string;
  description: string;
};

type ScenarioSummary = {
  id: ScenarioId;
  label: string;
  description: string;
  currentRealPriceCtKwh: number | null;
  fixedMonthlyCostEur: number;
  variableMonthlyCostEur: number;
  projectedMonthlyCostEur: number;
  coverageRatio: number;
  controllableSharePercent: number;
  meteringLabel: string;
  networkMode: "standard" | "module2" | "module3";
};

type DashboardData = {
  chartRows: DashboardChartRow[];
  currentDayAhead: DashboardPoint | null;
  currentIntraday: DashboardPoint | null;
  lastSync: LastSync;
  availableUntil: string | null;
  locationLabel: string;
  householdProfileLabel: string;
  annualConsumptionKwh: number;
  defaultScenarioId: ScenarioId;
  pricingSourceVersion: string;
  scenarioOptions: ScenarioOption[];
  scenarioSummaries: ScenarioSummary[];
};

export function PriceDashboard({ dashboard }: { dashboard: DashboardData }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>(dashboard.defaultScenarioId);
  const [compareScenarioIds, setCompareScenarioIds] = useState<ScenarioId[]>(() =>
    dashboard.scenarioOptions
      .filter((scenario) => scenario.id !== dashboard.defaultScenarioId)
      .slice(0, 2)
      .map((scenario) => scenario.id),
  );

  const selectedScenario =
    dashboard.scenarioSummaries.find((scenario) => scenario.id === selectedScenarioId) ?? dashboard.scenarioSummaries[0];
  const compareScenarios = dashboard.scenarioSummaries.filter((scenario) => compareScenarioIds.includes(scenario.id));

  return (
    <section className="grid gap-6">
      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Realpreis</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Spotpreis plus reale Endkundenbestandteile fuer {dashboard.locationLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Basis: {dashboard.householdProfileLabel}, {dashboard.annualConsumptionKwh.toLocaleString("de-DE")} kWh/Jahr, Tibber-artige Beschaffungskosten und lokale Netzentgelte.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.5rem] border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm text-emerald-950 lg:min-w-[20rem]">
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-emerald-900/70">Basisszenario</span>
              <select
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0"
                value={selectedScenarioId}
                onChange={(event) => {
                  const next = event.target.value as ScenarioId;
                  setSelectedScenarioId(next);
                  setCompareScenarioIds((current) => current.filter((scenarioId) => scenarioId !== next));
                }}
              >
                {dashboard.scenarioOptions.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-900/70">Vergleich einblenden</p>
              <div className="grid gap-2">
                {dashboard.scenarioOptions
                  .filter((scenario) => scenario.id !== selectedScenarioId)
                  .map((scenario) => {
                    const checked = compareScenarioIds.includes(scenario.id);
                    return (
                      <label key={scenario.id} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
                        <input
                          type="checkbox"
                          className="mt-1 size-4 accent-emerald-700"
                          checked={checked}
                          onChange={() => {
                            setCompareScenarioIds((current) =>
                              checked ? current.filter((scenarioId) => scenarioId !== scenario.id) : [...current, scenario.id],
                            );
                          }}
                        />
                        <span>
                          <span className="block text-sm font-medium text-zinc-900">{scenario.label}</span>
                          <span className="block text-xs leading-5 text-zinc-500">{scenario.description}</span>
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </article>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Day-Ahead jetzt" value={formatCt(dashboard.currentDayAhead?.priceCtKwh ?? null)} detail={formatPeriod(dashboard.currentDayAhead)} tone="text-emerald-950" />
        <MetricCard label={`Realpreis ${selectedScenario.label}`} value={formatCt(selectedScenario?.currentRealPriceCtKwh ?? null)} detail={selectedScenario?.description ?? "-"} tone="text-amber-950" />
        <MetricCard label="Monatskosten hochgerechnet" value={formatEur(selectedScenario?.projectedMonthlyCostEur ?? null)} detail={`${Math.round((selectedScenario?.coverageRatio ?? 0) * 100)} % des Monatsprofils mit Day-Ahead-Daten belegt`} tone="text-zinc-950" />
        <MetricCard label="Fixkosten pro Monat" value={formatEur(selectedScenario?.fixedMonthlyCostEur ?? null)} detail={`${selectedScenario?.meteringLabel ?? "-"}, ${selectedScenario?.controllableSharePercent ?? 0} % steuerbarer Anteil`} tone="text-zinc-950" />
        <article className="rounded-[1.5rem] bg-[linear-gradient(145deg,#0f3b2d,#124c49)] p-5 text-white shadow-[0_24px_80px_rgba(8,25,32,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">Sync</p>
          <p className="mt-3 text-2xl font-semibold">{dashboard.lastSync ? "bereit" : "noch leer"}</p>
          <p className="mt-2 text-sm text-emerald-50/80">
            {dashboard.lastSync?.finished_at
              ? `Letzter erfolgreicher Import: ${formatInTimeZone(dashboard.lastSync.finished_at, "Europe/Berlin", "dd.MM.yyyy HH:mm")}`
              : "Noch kein erfolgreicher Import vorhanden."}
          </p>
          <p className="mt-4 text-sm text-emerald-50/80">
            {dashboard.lastSync
              ? `${dashboard.lastSync.rows_inserted} neue Punkte, ${dashboard.lastSync.rows_updated} Updates`
              : "Nach dem ersten Backfill erscheinen hier die Importdetails."}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {dashboard.scenarioSummaries.map((scenario) => {
          const active = scenario.id === selectedScenarioId;
          return (
            <article
              key={scenario.id}
              className={`rounded-[1.5rem] border p-5 shadow-[0_24px_80px_rgba(14,35,21,0.08)] ${
                active ? "border-emerald-300 bg-emerald-50/80" : "border-white/70 bg-white/85"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-950">{scenario.label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{scenario.description}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700"
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  aktivieren
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-zinc-600">
                <p>Aktuell: <span className="font-semibold text-zinc-950">{formatCt(scenario.currentRealPriceCtKwh)}</span></p>
                <p>Monat: <span className="font-semibold text-zinc-950">{formatEur(scenario.projectedMonthlyCostEur)}</span></p>
                <p>Fix: <span className="font-semibold text-zinc-950">{formatEur(scenario.fixedMonthlyCostEur)}</span></p>
              </div>
            </article>
          );
        })}
      </section>

      <PriceChart
        rows={dashboard.chartRows}
        scenarioOptions={dashboard.scenarioOptions}
        selectedScenarioId={selectedScenarioId}
        compareScenarioIds={compareScenarios.map((scenario) => scenario.id)}
        availableUntil={dashboard.availableUntil}
      />

      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 text-sm leading-6 text-zinc-600 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Annahmen</p>
        <p className="mt-3">
          Der Realpreis basiert auf dem Day-Ahead-Viertelstundenpreis plus lokalen Preisbestandteilen fuer Schwäbisch Hall. Die Monatskosten sind eine Hochrechnung ueber das BDEW-H0-Profil eines 3-Personen-Hauses und werden mit jeder neuen Day-Ahead-Verfuegbarkeit nachgezogen.
        </p>
        <p className="mt-3">
          Interner Pricing-Stand: <span className="font-medium text-zinc-900">{dashboard.pricingSourceVersion}</span>. Intraday bleibt im Chart als Referenz sichtbar, die Endkundenhochrechnung laeuft aber bewusst auf dem Day-Ahead-Fokus.
        </p>
      </article>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-zinc-200/80 bg-zinc-50/90 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{detail}</p>
    </article>
  );
}

function formatCt(value: number | null) {
  return value === null ? "-" : `${value.toFixed(2)} ct/kWh`;
}

function formatEur(value: number | null) {
  return value === null ? "-" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function formatPeriod(point: DashboardPoint | null) {
  if (!point) {
    return "Kein Wert verfuegbar";
  }

  return `${formatInTimeZone(point.startAt, "Europe/Berlin", "dd.MM. HH:mm")} - ${formatInTimeZone(point.endAt, "Europe/Berlin", "HH:mm")}`;
}
