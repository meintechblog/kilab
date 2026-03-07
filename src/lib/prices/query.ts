import { startOfMonth, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  DEFAULT_ANNUAL_CONSUMPTION_KWH,
  DEFAULT_SCENARIO_ID,
  FIXED_PRICE_REFERENCE_CT_KWH,
  PRICING_SOURCE_VERSION,
  scenarioPresets,
} from "../pricing/config";
import { buildScenarioChartRows, buildScenarioSummaries, calculateFixedPriceReference, type FixedPriceReference, type ScenarioSummary } from "../pricing/dashboard";
import { getMonthProfileShares } from "../pricing/load-profile";
import type { ScenarioId } from "../pricing/types";

export type DashboardPoint = {
  startAt: string;
  endAt: string;
  priceCtKwh: number;
};

export type DashboardChartRow = {
  timestamp: string;
  dayAheadCtKwh: number | null;
  intradayCtKwh: number | null;
  realPriceByScenario: Record<ScenarioId, number | null>;
};

export type DashboardData = {
  generatedAt: string;
  chartRows: DashboardChartRow[];
  currentDayAhead: DashboardPoint | null;
  currentIntraday: DashboardPoint | null;
  lastSync: SyncRow | null;
  availableUntil: string | null;
  locationLabel: string;
  householdProfileLabel: string;
  annualConsumptionKwh: number;
  defaultScenarioId: ScenarioId;
  pricingSourceVersion: string;
  scenarioOptions: Array<{ id: ScenarioId; label: string; description: string }>;
  scenarioSummaries: ScenarioSummary[];
  fixedPriceReference: Omit<FixedPriceReference, "chartSeries">;
};

type RawRow = {
  series_key: string;
  start_at: string;
  end_at: string;
  price_ct_kwh: string;
};

type SyncRow = {
  status: string;
  finished_at: string | null;
  rows_inserted: number;
  rows_updated: number;
};

export function selectCurrentPoint<T extends { startAt: string; endAt: string }>(points: T[], now: Date) {
  const active = points.find((point) => {
    const start = new Date(point.startAt).getTime();
    const end = new Date(point.endAt).getTime();
    const current = now.getTime();
    return current >= start && current < end;
  });

  if (active) {
    return active;
  }

  const latestPast = [...points]
    .filter((point) => new Date(point.startAt).getTime() <= now.getTime())
    .sort((left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime())[0];

  return latestPast ?? points[0] ?? null;
}

export function buildChartRows({
  dayAhead,
  intraday,
}: {
  dayAhead: DashboardPoint[];
  intraday: DashboardPoint[];
}) {
  const rows = new Map<
    string,
    { timestamp: string; dayAheadCtKwh: number | null; intradayCtKwh: number | null }
  >();

  for (const point of dayAhead) {
    rows.set(point.startAt, {
      timestamp: point.startAt,
      dayAheadCtKwh: point.priceCtKwh,
      intradayCtKwh: rows.get(point.startAt)?.intradayCtKwh ?? null,
    });
  }

  for (const point of intraday) {
    const existing = rows.get(point.startAt);
    rows.set(point.startAt, {
      timestamp: point.startAt,
      dayAheadCtKwh: existing?.dayAheadCtKwh ?? null,
      intradayCtKwh: point.priceCtKwh,
    });
  }

  return [...rows.values()].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

export function buildMonthlySpotSeries({
  points,
  monthStartIso,
  slotCount,
}: {
  points: DashboardPoint[];
  monthStartIso: string;
  slotCount: number;
}) {
  const series = Array.from({ length: slotCount }, () => null as number | null);
  const monthStartMs = new Date(monthStartIso).getTime();

  for (const point of points) {
    const offsetMs = new Date(point.startAt).getTime() - monthStartMs;
    const slotIndex = Math.round(offsetMs / (15 * 60 * 1000));
    if (slotIndex >= 0 && slotIndex < slotCount) {
      series[slotIndex] = point.priceCtKwh;
    }
  }

  return series;
}

export async function getDashboardData(now = new Date(), timezone = "Europe/Berlin"): Promise<DashboardData> {
  const { query } = await import("../db");
  const zonedNow = toZonedTime(now, timezone);
  const chartWindowStart = fromZonedTime(subDays(zonedNow, 7), timezone).toISOString();
  const monthStartLocal = startOfMonth(zonedNow);
  const monthStart = fromZonedTime(monthStartLocal, timezone).toISOString();
  const dataWindowStart = chartWindowStart < monthStart ? chartWindowStart : monthStart;

  const pointsResult = await query<RawRow>(
    `
      SELECT
        s.key AS series_key,
        p.start_at,
        p.end_at,
        p.price_ct_kwh::text AS price_ct_kwh
      FROM market_price_points p
      INNER JOIN market_price_series s ON s.id = p.series_id
      WHERE s.key IN ('day_ahead_quarter_hour', 'intraday_quarter_hour')
        AND p.start_at >= $1::timestamptz
      ORDER BY p.start_at ASC
    `,
    [dataWindowStart],
  );

  const dayAheadAll = pointsResult.rows
    .filter((row) => row.series_key === "day_ahead_quarter_hour")
    .map(toDashboardPoint);
  const intradayAll = pointsResult.rows
    .filter((row) => row.series_key === "intraday_quarter_hour")
    .map(toDashboardPoint);

  const dayAhead = dayAheadAll.filter((point) => point.startAt >= chartWindowStart);
  const intraday = intradayAll.filter((point) => point.startAt >= chartWindowStart);

  const lastSyncResult = await query<SyncRow>(
    `
      SELECT status, finished_at, rows_inserted, rows_updated
      FROM sync_runs
      WHERE status = 'success'
      ORDER BY finished_at DESC NULLS LAST
      LIMIT 1
    `,
  );

  const lastSync = lastSyncResult.rows[0] ?? null;
  const currentDayAhead: DashboardPoint | null = selectCurrentPoint(dayAheadAll, now);
  const currentIntraday: DashboardPoint | null = selectCurrentPoint(intradayAll, now);
  const baseChartRows = buildChartRows({ dayAhead, intraday });
  const chartRows = buildScenarioChartRows(baseChartRows);

  const profileShares = getMonthProfileShares(monthStartLocal.getFullYear(), monthStartLocal.getMonth() + 1);
  const monthDayAhead = dayAheadAll.filter((point) => point.startAt >= monthStart);
  const monthSpotSeries = buildMonthlySpotSeries({
    points: monthDayAhead,
    monthStartIso: monthStart,
    slotCount: profileShares.length,
  });
  const scenarioSummaries = buildScenarioSummaries({
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    currentSpotCtKwh: currentDayAhead?.priceCtKwh ?? null,
    currentTimestamp: currentDayAhead?.startAt ?? now.toISOString(),
    profileShares,
    spotSeriesCtKwh: monthSpotSeries,
  });
  const fixedPriceReferenceRaw = calculateFixedPriceReference({
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    fixedPriceCtKwh: FIXED_PRICE_REFERENCE_CT_KWH,
    profileShares,
    chartRows,
  });

  return {
    generatedAt: now.toISOString(),
    chartRows,
    currentDayAhead,
    currentIntraday,
    lastSync,
    availableUntil: chartRows.at(-1)?.timestamp ?? null,
    locationLabel: "Schwaebisch Hall",
    householdProfileLabel: "BDEW H0, 3-Personen-Haus",
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    defaultScenarioId: DEFAULT_SCENARIO_ID,
    pricingSourceVersion: PRICING_SOURCE_VERSION,
    scenarioOptions: scenarioPresets.map(({ id, label, description }) => ({ id, label, description })),
    scenarioSummaries,
    fixedPriceReference: {
      label: fixedPriceReferenceRaw.label,
      fixedPriceCtKwh: fixedPriceReferenceRaw.fixedPriceCtKwh,
      currentPriceCtKwh: fixedPriceReferenceRaw.currentPriceCtKwh,
      energyOnlyMonthlyCostEur: fixedPriceReferenceRaw.energyOnlyMonthlyCostEur,
      monthlyBaseEur: fixedPriceReferenceRaw.monthlyBaseEur,
      projectedMonthlyCostEur: fixedPriceReferenceRaw.projectedMonthlyCostEur,
      estimatedEnergyKwh: fixedPriceReferenceRaw.estimatedEnergyKwh,
      note: fixedPriceReferenceRaw.note,
    },
  };
}

function toDashboardPoint(row: RawRow): DashboardPoint {
  return {
    startAt: new Date(row.start_at).toISOString(),
    endAt: new Date(row.end_at).toISOString(),
    priceCtKwh: Number(row.price_ct_kwh),
  };
}
