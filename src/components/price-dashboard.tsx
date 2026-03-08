"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { deriveDecisionAdvisory } from "../lib/pricing/advisory";
import { PriceChart } from "./price-chart";
import type { DashboardData, DashboardPoint } from "@/src/lib/prices/query";
import type { ScenarioId } from "@/src/lib/pricing/types";

export function PriceDashboard({ dashboard }: { dashboard: DashboardData }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>(dashboard.defaultScenarioId);
  const [compareScenarioIds, setCompareScenarioIds] = useState<ScenarioId[]>([]);
  const [visibleSeries, setVisibleSeries] = useState({
    dayAhead: true,
    intraday: true,
    fixedPrice: true,
    compare: true,
  });

  const selectedScenario =
    dashboard.scenarioSummaries.find((scenario) => scenario.id === selectedScenarioId) ?? dashboard.scenarioSummaries[0];

  const advisory = deriveDecisionAdvisory({
    nowIso: dashboard.generatedAt,
    chartRows: dashboard.chartRows,
    selectedScenarioId,
    scenarioSummaries: dashboard.scenarioSummaries,
    fixedPriceReference: dashboard.fixedPriceReference,
  });

  return (
    <section className="graphite-shell grid gap-6">
      <article className="graphite-panel overflow-hidden rounded-[2rem] p-6 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-orange-200/78">Flexpreis / Fixpreis</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">Flexpreis gegen Fixpreis</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              Die Seite priorisiert jetzt konkrete Entscheidungen: aktueller Abstand zu deinem Fixpreis, Monatswirkung, guenstige Zeitfenster und was davon im aktiven Szenario wirklich auf der Rechnung landet.
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-rose-500/18 bg-[linear-gradient(160deg,rgba(127,29,29,0.32),rgba(24,10,18,0.92))] p-5 shadow-[0_24px_80px_rgba(46,11,18,0.28)] lg:max-w-sm">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-200/76">Dein aktueller Vertrag</p>
            <p className="mt-3 text-4xl font-semibold text-rose-50">{formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)}</p>
            <p className="mt-3 text-sm leading-7 text-rose-100/82">{dashboard.fixedPriceReference.note}</p>
            <div className="signal-divider mt-4" />
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.24em] text-rose-200/68">Monat aktuell</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatEur(dashboard.fixedPriceReference.projectedMonthlyCostEur)}</p>
          </div>
        </div>
      </article>

      <section className="grid gap-4 xl:grid-cols-4">
        <DecisionCard
          eyebrow="Jetzt entscheiden"
          title={
            advisory.current.status === "cheaper"
              ? "Flex liegt unter Fix"
              : advisory.current.status === "pricier"
                ? "Flex liegt ueber Fix"
                : advisory.current.status === "equal"
                  ? "Flex liegt auf Fixniveau"
                  : "Kein aktueller Wert"
          }
          value={formatSignedCt(advisory.current.deltaCtKwh)}
          detail={
            advisory.current.realPriceCtKwh === null
              ? "Aktuell ist kein abrechnungsnaher Flexwert verfuegbar."
              : `Realpreis ${formatCt(advisory.current.realPriceCtKwh)} gegen Fix ${formatCt(advisory.current.fixedPriceCtKwh)}`
          }
          accent={advisory.current.status === "pricier" ? "rose" : "emerald"}
        />
        <DecisionCard
          eyebrow="Monat vs. Fix"
          title={advisory.monthly.status === "cheaper" ? "Flex im Monatslauf guenstiger" : advisory.monthly.status === "pricier" ? "Fix im Monatslauf guenstiger" : "Monatsvergleich offen"}
          value={formatSignedEur(advisory.monthly.deltaEur)}
          detail={
            advisory.monthly.flexCostEur === null
              ? "Noch keine Monatsprojektion vorhanden."
              : `${formatEur(advisory.monthly.flexCostEur)} Flex gegen ${formatEur(advisory.monthly.fixedCostEur)} Fixpreis`
          }
          accent={advisory.monthly.status === "pricier" ? "rose" : "orange"}
        />
        <DecisionCard
          eyebrow="Beste Viertelstunde"
          title={advisory.upcoming.cheapestSlots[0] ? formatRange(advisory.upcoming.cheapestSlots[0].startAt, advisory.upcoming.cheapestSlots[0].endAt) : "Keine Zukunftsdaten"}
          value={advisory.upcoming.cheapestSlots[0] ? formatCt(advisory.upcoming.cheapestSlots[0].priceCtKwh) : "-"}
          detail={
            advisory.upcoming.cheapestSlots[0]
              ? `${formatSignedCt(advisory.upcoming.cheapestSlots[0].deltaToFixedCtKwh)} gegen deinen Fixpreis`
              : "Sobald neue Viertelstundenpreise vorliegen, erscheint hier das naechste guenstige Fenster."
          }
          accent="emerald"
        />
        <DecisionCard
          eyebrow="Beste Stunde"
          title={advisory.upcoming.bestHourBlock ? formatRange(advisory.upcoming.bestHourBlock.startAt, advisory.upcoming.bestHourBlock.endAt) : "Noch keine 1h-Route"}
          value={advisory.upcoming.bestHourBlock ? formatCt(advisory.upcoming.bestHourBlock.averagePriceCtKwh) : "-"}
          detail={
            advisory.upcoming.bestHourBlock
              ? `${formatSignedCt(advisory.upcoming.bestHourBlock.averageDeltaToFixedCtKwh)} im Stundenmittel gegen Fix`
              : "Fuer eine praktische Verbrauchsverschiebung fehlen noch vier zusammenhaengende Zukunftswerte."
          }
          accent="slate"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <MetricCard label="Day-Ahead jetzt" value={formatCt(dashboard.currentDayAhead?.priceCtKwh ?? null)} detail={formatPeriod(dashboard.currentDayAhead)} tone="text-emerald-200" accent="emerald" />
        <MetricCard label={`Realpreis ${selectedScenario.label}`} value={formatCt(selectedScenario?.currentRealPriceCtKwh ?? null)} detail={selectedScenario?.description ?? "-"} tone="text-orange-100" accent="orange" />
        <MetricCard label="Fixpreis jetzt" value={formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)} detail="Feste Referenz fuer deinen aktuellen Tarif" tone="text-rose-100" accent="rose" />
        <MetricCard label="Monat Flex hochgerechnet" value={formatEur(selectedScenario?.projectedMonthlyCostEur ?? null)} detail={`${Math.round((selectedScenario?.coverageRatio ?? 0) * 100)} % des Monatsprofils mit Day-Ahead-Daten belegt`} tone="text-white" accent="slate" />
        <MetricCard label="Monat Fixpreis" value={formatEur(dashboard.fixedPriceReference.projectedMonthlyCostEur)} detail={`${dashboard.fixedPriceReference.energyOnlyMonthlyCostEur.toFixed(2)} EUR Arbeitspreis + ${dashboard.fixedPriceReference.monthlyBaseEur.toFixed(2)} EUR Grundpreis`} tone="text-rose-100" accent="rose" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {dashboard.scenarioSummaries.map((scenario) => {
          const active = scenario.id === selectedScenarioId;
          const comparing = compareScenarioIds.includes(scenario.id);
          const monthlyDeltaToFix = Number((scenario.projectedMonthlyCostEur - dashboard.fixedPriceReference.projectedMonthlyCostEur).toFixed(2));
          return (
            <article
              key={scenario.id}
              className={`graphite-panel-soft rounded-[1.6rem] p-5 transition duration-200 ${active ? "border-orange-400/40 shadow-[0_22px_80px_rgba(249,115,22,0.18)]" : "hover:border-slate-400/30 hover:bg-[linear-gradient(180deg,rgba(17,29,49,0.92),rgba(10,18,31,0.84))]"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{scenario.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{scenario.description}</p>
                </div>
                <button
                  type="button"
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-orange-400/50 bg-orange-400/16 text-orange-100" : "border-slate-600/60 bg-slate-900/40 text-slate-200 hover:border-orange-300/40 hover:text-white"}`}
                  onClick={() => {
                    setSelectedScenarioId(scenario.id);
                    setCompareScenarioIds((current) => current.filter((scenarioId) => scenarioId !== scenario.id));
                  }}
                >
                  {active ? "aktiv" : "aktivieren"}
                </button>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <p>Aktuell: <span className="font-semibold text-white">{formatCt(scenario.currentRealPriceCtKwh)}</span></p>
                <p>Monat: <span className="font-semibold text-white">{formatEur(scenario.projectedMonthlyCostEur)}</span></p>
                <p>Monat vs. Fix: <span className={monthlyDeltaToFix <= 0 ? "font-semibold text-emerald-200" : "font-semibold text-rose-200"}>{formatSignedEur(monthlyDeltaToFix)}</span></p>
              </div>
              <div className="mt-4 inline-flex rounded-full border border-slate-700/70 bg-slate-950/35 px-3 py-1 text-xs font-medium tracking-[0.18em] text-slate-300 uppercase">
                {monthlyDeltaToFix <= 0 ? "aktuell guenstiger als fix" : "aktuell teurer als fix"}
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-950/30 px-3 py-3 text-sm text-slate-300 transition hover:border-slate-500/70">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-orange-500"
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

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="graphite-panel-soft rounded-[1.8rem] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-200/76">Sichtbar im Chart</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Linien so filtern, wie du sie gerade brauchst</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Der aktive Realpreis bleibt immer sichtbar. Day-Ahead, Intraday, Fixpreis und Vergleichslinien kannst du je nach Fragestellung ein- oder ausblenden.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <SeriesToggle label="Day-Ahead" active={visibleSeries.dayAhead} onClick={() => setVisibleSeries((current) => ({ ...current, dayAhead: !current.dayAhead }))} />
            <SeriesToggle label="Intraday" active={visibleSeries.intraday} onClick={() => setVisibleSeries((current) => ({ ...current, intraday: !current.intraday }))} />
            <SeriesToggle label="Fixpreis" active={visibleSeries.fixedPrice} onClick={() => setVisibleSeries((current) => ({ ...current, fixedPrice: !current.fixedPrice }))} />
            <SeriesToggle label="Vergleichsszenarien" active={visibleSeries.compare} onClick={() => setVisibleSeries((current) => ({ ...current, compare: !current.compare }))} />
          </div>
        </article>

        <article className="graphite-panel rounded-[1.8rem] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-200/76">Beste Zeitfenster</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Verbrauch moeglichst in guenstige Fenster schieben</h3>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {advisory.upcoming.cheapestSlots.length > 0 ? (
              advisory.upcoming.cheapestSlots.map((slot, index) => (
                <div key={slot.startAt} className="rounded-xl border border-slate-700/70 bg-slate-950/30 px-4 py-4">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-400">Slot {index + 1}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{formatRange(slot.startAt, slot.endAt)}</p>
                  <p className="mt-2 text-sm text-slate-300">{formatCt(slot.priceCtKwh)}</p>
                  <p className={`mt-2 text-sm ${slot.deltaToFixedCtKwh <= 0 ? "text-emerald-200" : "text-rose-200"}`}>{formatSignedCt(slot.deltaToFixedCtKwh)} gegen Fix</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-700/70 bg-slate-950/30 px-4 py-4 text-sm text-slate-400 md:col-span-3">
                Keine Zukunftsdaten verfuegbar. Nach dem naechsten erfolgreichen Import erscheinen hier wieder die besten Viertelstunden.
              </div>
            )}
          </div>
          <div className="mt-4 rounded-[1.4rem] border border-emerald-400/18 bg-[linear-gradient(145deg,rgba(4,38,34,0.78),rgba(7,18,24,0.94))] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-200/74">Beste Stunde</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {advisory.upcoming.bestHourBlock ? formatRange(advisory.upcoming.bestHourBlock.startAt, advisory.upcoming.bestHourBlock.endAt) : "Noch keine zusammenhaengende 1h-Strecke"}
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/78">
              {advisory.upcoming.bestHourBlock
                ? `${formatCt(advisory.upcoming.bestHourBlock.averagePriceCtKwh)} im Mittel, ${formatSignedCt(advisory.upcoming.bestHourBlock.averageDeltaToFixedCtKwh)} gegen Fix.`
                : "Sobald vier zusammenhaengende Viertelstunden verfuegbar sind, wird hier die beste zusammenhaengende Nutzungsstunde gezeigt."}
            </p>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
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

      <article className="rounded-[1.6rem] border border-emerald-400/18 bg-[linear-gradient(145deg,rgba(4,38,34,0.92),rgba(7,18,24,0.92))] p-5 text-white shadow-[0_24px_80px_rgba(8,25,32,0.26)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200/76">Sync</p>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-3xl font-semibold text-emerald-50">{dashboard.lastSync ? "bereit" : "noch leer"}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-100/74">
              {dashboard.lastSync?.finished_at
                ? `Letzter erfolgreicher Import: ${formatInTimeZone(dashboard.lastSync.finished_at, "Europe/Berlin", "dd.MM.yyyy HH:mm")}`
                : "Noch kein erfolgreicher Import vorhanden."}
            </p>
          </div>
          <div className="graphite-pill rounded-2xl px-4 py-3 text-sm text-emerald-100/78">
            {dashboard.lastSync
              ? `${dashboard.lastSync.rows_inserted} neue Punkte, ${dashboard.lastSync.rows_updated} Updates`
              : "Nach dem ersten Backfill erscheinen hier die Importdetails."}
          </div>
        </div>
      </article>

      <PriceChart
        rows={dashboard.chartRows}
        scenarioOptions={dashboard.scenarioOptions}
        selectedScenarioId={selectedScenarioId}
        compareScenarioIds={compareScenarioIds}
        availableUntil={dashboard.availableUntil}
        fixedPriceCtKwh={dashboard.fixedPriceReference.currentPriceCtKwh}
        fixedPriceLabel={dashboard.fixedPriceReference.label}
        visibleSeries={visibleSeries}
      />

      <article className="graphite-panel-soft rounded-[1.8rem] p-6 text-sm leading-7 text-slate-300">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-orange-200/76">Annahmen</p>
        <p className="mt-4">
          Der Flex-Realpreis basiert auf dem Day-Ahead-Viertelstundenpreis plus lokalen Preisbestandteilen fuer Schwäbisch Hall. Die Monatskosten sind eine Hochrechnung ueber das BDEW-H0-Profil eines 3-Personen-Hauses und werden mit jeder neuen Day-Ahead-Verfuegbarkeit nachgezogen.
        </p>
        <p className="mt-3">
          Interner Pricing-Stand: <span className="font-mono text-orange-100">{dashboard.pricingSourceVersion}</span>. Der Fixpreisvergleich nutzt aktuell deinen bekannten Arbeitspreis von {formatCt(dashboard.fixedPriceReference.currentPriceCtKwh)} plus einen angenommenen Grundpreis von {formatEur(dashboard.fixedPriceReference.monthlyBaseEur)} pro Monat.
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
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  accent: "emerald" | "orange" | "rose" | "slate";
}) {
  const accentClass = {
    emerald: "from-emerald-400/18 to-emerald-400/0 text-emerald-200/76",
    orange: "from-orange-400/18 to-orange-400/0 text-orange-200/78",
    rose: "from-rose-400/18 to-rose-400/0 text-rose-200/78",
    slate: "from-slate-400/18 to-slate-400/0 text-slate-300/80",
  }[accent];

  return (
    <article className="graphite-panel-soft rounded-[1.4rem] p-5">
      <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${accentClass}`} />
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className={`mt-4 text-3xl font-semibold ${tone}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </article>
  );
}

function DecisionCard({
  eyebrow,
  title,
  value,
  detail,
  accent,
}: {
  eyebrow: string;
  title: string;
  value: string;
  detail: string;
  accent: "emerald" | "orange" | "rose" | "slate";
}) {
  const styles = {
    emerald: "border-emerald-400/18 bg-[linear-gradient(180deg,rgba(6,38,31,0.92),rgba(7,18,24,0.88))] text-emerald-50",
    orange: "border-orange-400/18 bg-[linear-gradient(180deg,rgba(45,24,10,0.9),rgba(10,18,31,0.88))] text-orange-50",
    rose: "border-rose-400/18 bg-[linear-gradient(180deg,rgba(59,20,26,0.9),rgba(14,16,28,0.9))] text-rose-50",
    slate: "border-slate-500/18 bg-[linear-gradient(180deg,rgba(17,29,49,0.82),rgba(10,18,31,0.84))] text-slate-50",
  }[accent];

  return (
    <article className={`rounded-[1.6rem] border p-5 shadow-[0_20px_70px_rgba(2,8,20,0.28)] ${styles}`}>
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-white/60">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/72">{detail}</p>
    </article>
  );
}

function SeriesToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${active ? "border-orange-400/50 bg-orange-400/16 text-orange-100" : "border-slate-600/70 bg-slate-950/35 text-slate-300 hover:border-slate-400/60 hover:text-white"}`}
      onClick={onClick}
    >
      {label}
    </button>
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
    <article className="graphite-panel rounded-[1.8rem] p-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-200/76">Berechnung</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">{emptyLabel ?? "Keine Daten verfuegbar"}</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {rows.map(([label, value, unit, emphasize]) => (
            <div key={label} className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${emphasize ? "border-orange-400/22 bg-orange-400/8" : "border-slate-700/70 bg-slate-950/30"}`}>
              <span className="text-sm text-slate-300">{label}</span>
              <span className={`font-mono text-sm ${emphasize ? "text-orange-100" : "text-white"}`}>{formatUnit(value, unit)}</span>
            </div>
          ))}
        </div>
      )}
      {footer ? <p className="mt-5 text-sm leading-6 text-slate-400">{footer}</p> : null}
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

function formatSignedCt(value: number | null) {
  if (value === null) {
    return "-";
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(2)} ct/kWh`;
}

function formatEur(value: number | null) {
  return value === null ? "-" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function formatSignedEur(value: number | null) {
  if (value === null) {
    return "-";
  }
  const formatted = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(value));
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatted}`;
}

function formatPeriod(point: DashboardPoint | null) {
  if (!point) {
    return "Kein Wert verfuegbar";
  }

  return `${formatInTimeZone(point.startAt, "Europe/Berlin", "dd.MM. HH:mm")} - ${formatInTimeZone(point.endAt, "Europe/Berlin", "HH:mm")}`;
}

function formatRange(startAt: string, endAt: string) {
  return `${formatInTimeZone(startAt, "Europe/Berlin", "dd.MM. HH:mm")} - ${formatInTimeZone(endAt, "Europe/Berlin", "HH:mm")}`;
}
