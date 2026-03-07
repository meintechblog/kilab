import { FIXED_PRICE_REFERENCE_MONTHLY_BASE_EUR, scenarioPresets } from "./config";
import { calculateMonthlyEstimate, calculateScenarioQuarterHourPrice, getScenarioFixedMonthlyCostEur } from "./engine";
import type { PricingScenario, QuarterHourBreakdown, ScenarioId } from "./types";

export type ScenarioChartRow = {
  timestamp: string;
  dayAheadCtKwh: number | null;
  intradayCtKwh: number | null;
  realPriceByScenario: Record<ScenarioId, number | null>;
};

export type ProjectedMonthlyEstimate = {
  variableCostEur: number;
  fixedCostEur: number;
  totalCostEur: number;
  coverageRatio: number;
  annualConsumptionKwh: number;
};

export type ScenarioSummary = {
  id: ScenarioId;
  label: string;
  description: string;
  currentRealPriceCtKwh: number | null;
  currentBreakdown: QuarterHourBreakdown | null;
  fixedMonthlyCostEur: number;
  variableMonthlyCostEur: number;
  projectedMonthlyCostEur: number;
  coverageRatio: number;
  controllableSharePercent: number;
  meteringLabel: string;
  networkMode: PricingScenario["networkMode"];
  monthlyBreakdown: {
    estimatedEnergyKwh: number;
    variableCostEur: number;
    fixedCostEur: number;
  };
};

export type FixedPriceReference = {
  label: string;
  fixedPriceCtKwh: number;
  currentPriceCtKwh: number;
  energyOnlyMonthlyCostEur: number;
  monthlyBaseEur: number;
  projectedMonthlyCostEur: number;
  estimatedEnergyKwh: number;
  note: string;
  chartSeries: Array<number | null>;
};

export function buildScenarioChartRows(
  rows: Array<{ timestamp: string; dayAheadCtKwh: number | null; intradayCtKwh: number | null }>,
): ScenarioChartRow[] {
  return rows.map((row) => ({
    ...row,
    realPriceByScenario: Object.fromEntries(
      scenarioPresets.map((scenario) => [
        scenario.id,
        row.dayAheadCtKwh === null
          ? null
          : calculateScenarioQuarterHourPrice({
              scenario,
              spotCtKwh: row.dayAheadCtKwh,
              timestamp: row.timestamp,
            }).realPriceCtKwh,
      ]),
    ) as Record<ScenarioId, number | null>,
  }));
}

export function calculateProjectedMonthlyEstimate({
  annualConsumptionKwh,
  scenario,
  spotSeriesCtKwh,
  profileShares,
}: {
  annualConsumptionKwh: number;
  scenario: PricingScenario;
  spotSeriesCtKwh: Array<number | null>;
  profileShares: number[];
}): ProjectedMonthlyEstimate {
  const coveredRows = spotSeriesCtKwh
    .map((spotPriceCtKwh, index) => ({ spotPriceCtKwh, share: profileShares[index] ?? 0, index }))
    .filter((row): row is { spotPriceCtKwh: number; share: number; index: number } => row.spotPriceCtKwh !== null);

  const coveredShare = coveredRows.reduce((sum, row) => sum + row.share, 0);
  const totalMonthShare = profileShares.reduce((sum, share) => sum + share, 0);

  if (coveredShare <= 0 || totalMonthShare <= 0) {
    const fixedCostEur = getScenarioFixedMonthlyCostEur(scenario);
    return {
      variableCostEur: 0,
      fixedCostEur: Number(fixedCostEur.toFixed(2)),
      totalCostEur: Number(fixedCostEur.toFixed(2)),
      coverageRatio: 0,
      annualConsumptionKwh,
    };
  }

  const observed = calculateMonthlyEstimate({
    annualConsumptionKwh,
    scenario,
    rows: coveredRows.map((row) => ({
      timestamp: new Date(Date.UTC(2026, 0, 1, 0, row.index * 15)).toISOString(),
      spotPriceCtKwh: row.spotPriceCtKwh,
    })),
    profileShares: coveredRows.map((row) => row.share * annualConsumptionKwh),
  });

  const coverageRatio = coveredShare / totalMonthShare;
  const variableCostEur = observed.variableCostEur * (totalMonthShare / coveredShare);
  const fixedCostEur = observed.fixedCostEur;

  return {
    variableCostEur: Number(variableCostEur.toFixed(2)),
    fixedCostEur: Number(fixedCostEur.toFixed(2)),
    totalCostEur: Number((variableCostEur + fixedCostEur).toFixed(2)),
    coverageRatio: Number(coverageRatio.toFixed(6)),
    annualConsumptionKwh,
  };
}

export function buildScenarioSummaries({
  annualConsumptionKwh,
  currentSpotCtKwh,
  currentTimestamp,
  profileShares,
  spotSeriesCtKwh,
}: {
  annualConsumptionKwh: number;
  currentSpotCtKwh: number | null;
  currentTimestamp: string;
  profileShares: number[];
  spotSeriesCtKwh: Array<number | null>;
}): ScenarioSummary[] {
  const estimatedEnergyKwh = Number((profileShares.reduce((sum, share) => sum + share, 0) * annualConsumptionKwh).toFixed(2));

  return scenarioPresets.map((scenario) => {
    const currentQuarter =
      currentSpotCtKwh === null
        ? null
        : calculateScenarioQuarterHourPrice({
            scenario,
            spotCtKwh: currentSpotCtKwh,
            timestamp: currentTimestamp,
          });

    const monthlyEstimate = calculateProjectedMonthlyEstimate({
      annualConsumptionKwh,
      scenario,
      spotSeriesCtKwh,
      profileShares,
    });

    return {
      id: scenario.id,
      label: scenario.label,
      description: scenario.description,
      currentRealPriceCtKwh: currentQuarter?.realPriceCtKwh ?? null,
      currentBreakdown: currentQuarter?.breakdown ?? null,
      fixedMonthlyCostEur: monthlyEstimate.fixedCostEur,
      variableMonthlyCostEur: monthlyEstimate.variableCostEur,
      projectedMonthlyCostEur: monthlyEstimate.totalCostEur,
      coverageRatio: monthlyEstimate.coverageRatio,
      controllableSharePercent: scenario.controllableSharePercent,
      meteringLabel: getMeteringLabel(scenario),
      networkMode: scenario.networkMode,
      monthlyBreakdown: {
        estimatedEnergyKwh,
        variableCostEur: monthlyEstimate.variableCostEur,
        fixedCostEur: monthlyEstimate.fixedCostEur,
      },
    };
  });
}

export function calculateFixedPriceReference({
  annualConsumptionKwh,
  fixedPriceCtKwh,
  profileShares,
  chartRows,
}: {
  annualConsumptionKwh: number;
  fixedPriceCtKwh: number;
  profileShares: number[];
  chartRows: ScenarioChartRow[];
}): FixedPriceReference {
  const estimatedEnergyKwh = Number((profileShares.reduce((sum, share) => sum + share, 0) * annualConsumptionKwh).toFixed(2));
  const energyOnlyMonthlyCostEur = Number(((estimatedEnergyKwh * fixedPriceCtKwh) / 100).toFixed(2));
  const monthlyBaseEur = FIXED_PRICE_REFERENCE_MONTHLY_BASE_EUR;
  const projectedMonthlyCostEur = Number((energyOnlyMonthlyCostEur + monthlyBaseEur).toFixed(2));

  return {
    label: `Fixpreis ${fixedPriceCtKwh.toFixed(0)} ct/kWh`,
    fixedPriceCtKwh,
    currentPriceCtKwh: fixedPriceCtKwh,
    energyOnlyMonthlyCostEur,
    monthlyBaseEur,
    projectedMonthlyCostEur,
    estimatedEnergyKwh,
    note: "Vergleich mit 25 ct/kWh Arbeitspreis plus angenommenem Grundpreis von 12 EUR/Monat.",
    chartSeries: chartRows.map(() => fixedPriceCtKwh),
  };
}

function getMeteringLabel(scenario: PricingScenario) {
  if (scenario.id === "smart_meter_imsys" || scenario.id === "module3_blended") {
    return "iMSys";
  }

  if (scenario.id === "module2_blended") {
    return "mME + Zusatzzaehler";
  }

  return "mME";
}
