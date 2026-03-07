"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { PriceChart } from "./price-chart";
import type { DashboardData, DashboardPoint } from "@/src/lib/prices/query";
import type { ScenarioId } from "@/src/lib/pricing/types";

export function PriceDashboard({ dashboard }: { dashboard: DashboardData }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>(dashboard.defaultScenarioId);
  const [compareScenarioIds, setCompareScenarioIds] = useState<ScenarioId[]>([]);

  const selectedScenario =
    dashboard.scenarioSummaries.find((scenario) => scenario.id === selectedScenarioId) ?? dashboard.scenarioSummaries[0];

  return (
    <section className="grid gap-6">
      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Realpreis</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">Flexpreis gegen Fixpreis fuer {dashboard.locationLabel}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Die Karten unten steuern jetzt direkt das aktive Szenario und den Chart-Vergleich. Zusaetzlich siehst du die Preiszusammensetzung des aktiven Flex-Szenarios und deinen heutigen Fixpreis von {formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)}.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-rose-200/70 bg-rose-50/80 p-4 text-sm text-rose-950 lg:max-w-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-900/70">Dein aktueller Vertrag</p>
            <p className="mt-2 text-3xl font-semibold">{formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)}</p>
            <p className="mt-2 leading-6">{dashboard.fixedPriceReference.note}</p>
            <p className="mt-2 text-xs text-rose-900/70">Arbeitspreis + Grundpreisannahme sind separat unten aufgeschluesselt.</p>
          </div>
        </div>
      </article>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Day-Ahead jetzt" value={formatCt(dashboard.currentDayAhead?.priceCtKwh ?? null)} detail={formatPeriod(dashboard.currentDayAhead)} tone="text-emerald-950" />
        <MetricCard label={`Realpreis ${selectedScenario.label}`} value={formatCt(selectedScenario?.currentRealPriceCtKwh ?? null)} detail={selectedScenario?.description ?? "-"} tone="text-amber-950" />
        <MetricCard label="Fixpreis jetzt" value={formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)} detail="Feste Referenz fuer deinen aktuellen Tarif" tone="text-rose-950" />
        <MetricCard label="Monat Flex hochgerechnet" value={formatEur(selectedScenario?.projectedMonthlyCostEur ?? null)} detail={`${Math.round((selectedScenario?.coverageRatio ?? 0) * 100)} % des Monatsprofils mit Day-Ahead-Daten belegt`} tone="text-zinc-950" />
        <MetricCard label="Monat Fixpreis" value={formatEur(dashboard.fixedPriceReference.projectedMonthlyCostEur)} detail={`${dashboard.fixedPriceReference.energyOnlyMonthlyCostEur.toFixed(2)} EUR Arbeitspreis + ${dashboard.fixedPriceReference.monthlyBaseEur.toFixed(2)} EUR Grundpreis`} tone="text-rose-950" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {dashboard.scenarioSummaries.map((scenario) => {
          const active = scenario.id === selectedScenarioId;
          const comparing = compareScenarioIds.includes(scenario.id);
          return (
            <article
              key={scenario.id}
              className={`rounded-[1.5rem] border p-5 shadow-[0_24px_80px_rgba(14,35,21,0.08)] transition ${
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
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? "border-emerald-300 bg-emerald-100 text-emerald-900" : "border-zinc-200 bg-white text-zinc-700"}`}
                  onClick={() => {
                    setSelectedScenarioId(scenario.id);
                    setCompareScenarioIds((current) => current.filter((scenarioId) => scenarioId !== scenario.id));
                  }}
                >
                  {active ? "aktiv" : "aktivieren"}
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-zinc-600">
                <p>Aktuell: <span className="font-semibold text-zinc-950">{formatCt(scenario.currentRealPriceCtKwh)}</span></p>
                <p>Monat: <span className="font-semibold text-zinc-950">{formatEur(scenario.projectedMonthlyCostEur)}</span></p>
                <p>Fix: <span className="font-semibold text-zinc-950">{formatEur(scenario.fixedMonthlyCostEur)}</span></p>
              </div>
              <label className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-emerald-700"
                  checked={comparing}
                  disabled={active}
                  onChange={() => {
                    setCompareScenarioIds((current) =>
                      comparing ? current.filter((scenarioId) => scenarioId !== scenario.id) : [...current, scenario.id],
                    );
                  }}
                />
                <span>{active ? "Aktives Szenario ist bereits im Chart" : "Im Chart mit dem aktiven Szenario vergleichen"}</span>
              </label>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <BreakdownCard
          title="Preiszusammensetzung jetzt"
          subtitle={`Aktiv: ${selectedScenario.label}`}
          rows={selectedScenario.currentBreakdown ? [
            ["Spotpreis", selectedScenario.currentBreakdown.spotCtKwh, "ct/kWh"],
            ["Beschaffung Tibber-artig", selectedScenario.currentBreakdown.procurementCtKwh, "ct/kWh"],
            ["Netzentgelt variabel", selectedScenario.currentBreakdown.variableNetFeeCtKwh, "ct/kWh"],
            ["§19 StromNEV", selectedScenario.currentBreakdown.section19CtKwh, "ct/kWh"],
            ["KWKG", selectedScenario.currentBreakdown.kwkgCtKwh, "ct/kWh"],
            ["Offshore", selectedScenario.currentBreakdown.offshoreCtKwh, "ct/kWh"],
            ["Stromsteuer", selectedScenario.currentBreakdown.electricityTaxCtKwh, "ct/kWh"],
            ["Konzessionsabgabe", selectedScenario.currentBreakdown.concessionCtKwh, "ct/kWh"],
            ["Zwischensumme netto", selectedScenario.currentBreakdown.subtotalNetCtKwh, "ct/kWh"],
            ["MwSt", selectedScenario.currentBreakdown.vatCtKwh, "ct/kWh"],
            ["Realpreis gesamt", selectedScenario.currentRealPriceCtKwh ?? 0, "ct/kWh", true],
          ] : []}
          emptyLabel="Kein aktueller Wert verfuegbar"
        />
        <BreakdownCard
          title="Monatsrechnung erklaert"
          subtitle={`Vergleich gegen ${dashboard.fixedPriceReference.label}`}
          rows={[
            ["Geschaetzter Monatsverbrauch", selectedScenario.monthlyBreakdown.estimatedEnergyKwh, "kWh"],
            ["Flex variabel", selectedScenario.monthlyBreakdown.variableCostEur, "EUR"],
            ["Flex fix", selectedScenario.monthlyBreakdown.fixedCostEur, "EUR"],
            ["Flex gesamt", selectedScenario.projectedMonthlyCostEur, "EUR", true],
            ["Fix Arbeitspreis", dashboard.fixedPriceReference.energyOnlyMonthlyCostEur, "EUR"],
            ["Fix Grundpreis (angenommen)", dashboard.fixedPriceReference.monthlyBaseEur, "EUR"],
            [dashboard.fixedPriceReference.label, dashboard.fixedPriceReference.projectedMonthlyCostEur, "EUR", true],
            ["Differenz Flex vs. Fix", selectedScenario.projectedMonthlyCostEur - dashboard.fixedPriceReference.projectedMonthlyCostEur, "EUR"],
          ]}
          footer={`Monatsabdeckung aktuell ${Math.round(selectedScenario.coverageRatio * 100)} %. Der Fixpreisvergleich nutzt 25 ct/kWh Arbeitspreis plus angenommene 12 EUR Grundpreis pro Monat.`}
        />
      </section>

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

      <PriceChart
        rows={dashboard.chartRows}
        scenarioOptions={dashboard.scenarioOptions}
        selectedScenarioId={selectedScenarioId}
        compareScenarioIds={compareScenarioIds}
        availableUntil={dashboard.availableUntil}
        fixedPriceCtKwh={dashboard.fixedPriceReference.currentPriceCtKwh}
        fixedPriceLabel={dashboard.fixedPriceReference.label}
      />

      <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 text-sm leading-6 text-zinc-600 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Annahmen</p>
        <p className="mt-3">
          Der Flex-Realpreis basiert auf dem Day-Ahead-Viertelstundenpreis plus lokalen Preisbestandteilen fuer Schwäbisch Hall. Die Monatskosten sind eine Hochrechnung ueber das BDEW-H0-Profil eines 3-Personen-Hauses und werden mit jeder neuen Day-Ahead-Verfuegbarkeit nachgezogen.
        </p>
        <p className="mt-3">
          Interner Pricing-Stand: <span className="font-medium text-zinc-900">{dashboard.pricingSourceVersion}</span>. Der Fixpreisvergleich nutzt aktuell deinen bekannten Arbeitspreis von {formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)} plus einen angenommenen Grundpreis von {formatEur(dashboard.fixedPriceReference.monthlyBaseEur)} pro Monat.
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

function BreakdownCard({
  title,
  subtitle,
  rows,
  emptyLabel,
  footer,
}: {
  title: string;
  subtitle: string;
  rows: Array<[string, number, "ct/kWh" | "EUR" | "kWh", boolean?]>;
  emptyLabel?: string;
  footer?: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Berechnung</p>
      <h3 className="mt-2 text-xl font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">{emptyLabel ?? "Keine Daten verfuegbar"}</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {rows.map(([label, value, unit, emphasize]) => (
            <div key={label} className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${emphasize ? "border-emerald-200 bg-emerald-50/70" : "border-zinc-200/80 bg-zinc-50/70"}`}>
              <span className="text-sm text-zinc-600">{label}</span>
              <span className={`text-sm font-semibold ${emphasize ? "text-emerald-950" : "text-zinc-950"}`}>{formatUnit(value, unit)}</span>
            </div>
          ))}
        </div>
      )}
      {footer ? <p className="mt-4 text-sm leading-6 text-zinc-500">{footer}</p> : null}
    </article>
  );
}

function formatUnit(value: number, unit: "ct/kWh" | "EUR" | "kWh") {
  if (unit === "EUR") {
    return formatEur(value);
  }
  if (unit === "kWh") {
    return `${value.toFixed(1)} kWh`;
  }
  return `${value.toFixed(2)} ct/kWh`;
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
