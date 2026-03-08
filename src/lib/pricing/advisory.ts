import type { DashboardChartRow, DashboardData } from "../prices/query";
import type { ScenarioSummary } from "./dashboard";
import type { ScenarioId } from "./types";

type FixedPriceReference = DashboardData["fixedPriceReference"];

type Status = "cheaper" | "pricier" | "equal" | "unavailable";

export type AdvisorySlot = {
  startAt: string;
  endAt: string;
  priceCtKwh: number;
  deltaToFixedCtKwh: number;
};

export type AdvisoryHourBlock = {
  startAt: string;
  endAt: string;
  averagePriceCtKwh: number;
  averageDeltaToFixedCtKwh: number;
};

export type DecisionAdvisory = {
  current: {
    realPriceCtKwh: number | null;
    fixedPriceCtKwh: number;
    deltaCtKwh: number | null;
    status: Status;
  };
  monthly: {
    flexCostEur: number | null;
    fixedCostEur: number;
    deltaEur: number | null;
    status: Status;
  };
  upcoming: {
    cheapestSlots: AdvisorySlot[];
    bestHourBlock: AdvisoryHourBlock | null;
  };
};

export function deriveDecisionAdvisory({
  nowIso,
  chartRows,
  selectedScenarioId,
  scenarioSummaries,
  fixedPriceReference,
}: {
  nowIso: string;
  chartRows: DashboardChartRow[];
  selectedScenarioId: ScenarioId;
  scenarioSummaries: ScenarioSummary[];
  fixedPriceReference: FixedPriceReference;
}): DecisionAdvisory {
  const selectedScenario = scenarioSummaries.find((scenario) => scenario.id === selectedScenarioId) ?? null;
  const fixedPriceCtKwh = fixedPriceReference.currentPriceCtKwh;
  const nowMs = new Date(nowIso).getTime();

  const currentRow =
    chartRows.find((row) => nowMs >= new Date(row.timestamp).getTime() && nowMs < new Date(row.timestamp).getTime() + 15 * 60 * 1000) ??
    [...chartRows]
      .filter((row) => new Date(row.timestamp).getTime() <= nowMs)
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))[0] ??
    null;

  const currentRealPriceCtKwh = currentRow?.realPriceByScenario[selectedScenarioId] ?? selectedScenario?.currentRealPriceCtKwh ?? null;
  const currentDeltaCtKwh = currentRealPriceCtKwh === null ? null : Number((currentRealPriceCtKwh - fixedPriceCtKwh).toFixed(2));

  const futureRows = chartRows
    .filter((row) => new Date(row.timestamp).getTime() >= nowMs)
    .map((row) => ({
      startAt: row.timestamp,
      endAt: new Date(new Date(row.timestamp).getTime() + 15 * 60 * 1000).toISOString(),
      priceCtKwh: row.realPriceByScenario[selectedScenarioId],
    }))
    .filter((row): row is { startAt: string; endAt: string; priceCtKwh: number } => typeof row.priceCtKwh === "number");

  const cheapestSlots = [...futureRows]
    .sort((left, right) => left.priceCtKwh - right.priceCtKwh || left.startAt.localeCompare(right.startAt))
    .slice(0, 3)
    .map((row) => ({
      ...row,
      deltaToFixedCtKwh: Number((row.priceCtKwh - fixedPriceCtKwh).toFixed(2)),
    }));

  let bestHourBlock: AdvisoryHourBlock | null = null;

  for (let index = 0; index <= futureRows.length - 4; index += 1) {
    const windowRows = futureRows.slice(index, index + 4);
    const contiguous = windowRows.every((row, rowIndex) => {
      if (rowIndex === 0) {
        return true;
      }
      return new Date(row.startAt).getTime() - new Date(windowRows[rowIndex - 1]!.startAt).getTime() === 15 * 60 * 1000;
    });

    if (!contiguous) {
      continue;
    }

    const averagePriceCtKwh = Number((windowRows.reduce((sum, row) => sum + row.priceCtKwh, 0) / windowRows.length).toFixed(2));
    const candidate: AdvisoryHourBlock = {
      startAt: windowRows[0]!.startAt,
      endAt: windowRows[windowRows.length - 1]!.endAt,
      averagePriceCtKwh,
      averageDeltaToFixedCtKwh: Number((averagePriceCtKwh - fixedPriceCtKwh).toFixed(2)),
    };

    if (!bestHourBlock || candidate.averagePriceCtKwh < bestHourBlock.averagePriceCtKwh) {
      bestHourBlock = candidate;
    }
  }

  const monthlyDeltaEur = selectedScenario
    ? Number((selectedScenario.projectedMonthlyCostEur - fixedPriceReference.projectedMonthlyCostEur).toFixed(2))
    : null;

  return {
    current: {
      realPriceCtKwh: currentRealPriceCtKwh,
      fixedPriceCtKwh,
      deltaCtKwh: currentDeltaCtKwh,
      status: toStatus(currentDeltaCtKwh),
    },
    monthly: {
      flexCostEur: selectedScenario?.projectedMonthlyCostEur ?? null,
      fixedCostEur: fixedPriceReference.projectedMonthlyCostEur,
      deltaEur: monthlyDeltaEur,
      status: toStatus(monthlyDeltaEur),
    },
    upcoming: {
      cheapestSlots,
      bestHourBlock,
    },
  };
}

function toStatus(delta: number | null): Status {
  if (delta === null) {
    return "unavailable";
  }
  if (delta < 0) {
    return "cheaper";
  }
  if (delta > 0) {
    return "pricier";
  }
  return "equal";
}
