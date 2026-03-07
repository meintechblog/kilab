import { addDays, endOfDay, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { fetchDayAheadPriceSeries, fetchIntradaySeries } from "./energy-charts";
import { toPricePoints } from "./normalize";
import { ensureSeriesKeys, upsertPricePoints } from "./upsert";
import type { SeriesKey, SyncMode } from "./types";

const CRON_LOG = "/var/log/kilab-webapp-sync.log";

export function buildRollingSyncWindow({
  now,
  historyDays,
  futureDays,
  timezone,
}: {
  now: Date;
  historyDays: number;
  futureDays: number;
  timezone: string;
}) {
  const zonedNow = toZonedTime(now, timezone);
  const start = startOfDay(addDays(zonedNow, -historyDays));
  const end = endOfDay(addDays(zonedNow, futureDays));

  return {
    startAt: fromZonedTime(start, timezone).toISOString(),
    endAt: fromZonedTime(end, timezone).toISOString(),
  };
}

export function buildCronEntries(projectDir: string): string[] {
  return [
    `47 10 * * * cd ${projectDir} && pnpm sync:prices -- --mode=intraday-id3 >> ${CRON_LOG} 2>&1`,
    `58 12 * * * cd ${projectDir} && pnpm sync:prices -- --mode=day-ahead >> ${CRON_LOG} 2>&1`,
    `3 13 * * * cd ${projectDir} && pnpm sync:prices -- --mode=day-ahead >> ${CRON_LOG} 2>&1`,
    `10 13 * * * cd ${projectDir} && pnpm sync:prices -- --mode=day-ahead >> ${CRON_LOG} 2>&1`,
    `47 15 * * * cd ${projectDir} && pnpm sync:prices -- --mode=intraday-id1 >> ${CRON_LOG} 2>&1`,
    `47 22 * * * cd ${projectDir} && pnpm sync:prices -- --mode=intraday-id2 >> ${CRON_LOG} 2>&1`,
  ];
}

export function selectSeriesForMode(mode: SyncMode): SeriesKey[] {
  switch (mode) {
    case "day-ahead":
      return ["day_ahead_quarter_hour"];
    case "intraday-id1":
      return ["intraday_auction_id1_quarter_hour"];
    case "intraday-id2":
      return ["intraday_auction_id2_quarter_hour"];
    case "intraday-id3":
      return ["intraday_auction_id3_quarter_hour"];
    case "intraday":
      return [
        "intraday_quarter_hour",
        "intraday_auction_id1_quarter_hour",
        "intraday_auction_id2_quarter_hour",
        "intraday_auction_id3_quarter_hour",
      ];
    case "all":
    default:
      return ["day_ahead_quarter_hour", ...selectSeriesForMode("intraday")];
  }
}

async function getQuery() {
  const { query } = await import("../db");
  return query;
}

export async function syncMarketPrices({
  mode = "all",
  historyDays = 7,
  futureDays = 7,
  timezone = "Europe/Berlin",
  now = new Date(),
}: {
  mode?: SyncMode;
  historyDays?: number;
  futureDays?: number;
  timezone?: string;
  now?: Date;
}) {
  const query = await getQuery();
  const selectedSeries = selectSeriesForMode(mode);
  const window = buildRollingSyncWindow({ now, historyDays, futureDays, timezone });
  const syncRun = await query<{ id: string }>(
    `
      INSERT INTO sync_runs (job_name, status, details_json)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [`price-sync:${mode}`, "running", JSON.stringify({ mode, window })],
  );

  const syncRunId = syncRun.rows[0].id;

  try {
    await ensureSeriesKeys(selectedSeries);

    let inserted = 0;
    let updated = 0;
    const startAt = new Date(window.startAt);
    const endAt = new Date(window.endAt);

    if (selectedSeries.includes("day_ahead_quarter_hour")) {
      const dayAheadValues = await fetchDayAheadPriceSeries(startAt, endAt);
      const result = await upsertPricePoints(
        toPricePoints({
          seriesKey: "day_ahead_quarter_hour",
          source: "energy-charts-api",
          values: dayAheadValues,
        }),
      );
      inserted += result.inserted;
      updated += result.updated;
    }

    const needsIntraday = selectedSeries.some((seriesKey) => seriesKey !== "day_ahead_quarter_hour");
    if (needsIntraday) {
      const intraday = await fetchIntradaySeries(startAt, endAt, timezone);
      const mappings: Array<[SeriesKey, typeof intraday.intradayContinuousAverage]> = [
        ["intraday_quarter_hour", intraday.intradayContinuousAverage],
        ["intraday_auction_id1_quarter_hour", intraday.intradayAuction1],
        ["intraday_auction_id2_quarter_hour", intraday.intradayAuction2],
        ["intraday_auction_id3_quarter_hour", intraday.intradayAuction3],
      ];

      for (const [seriesKey, values] of mappings) {
        if (!selectedSeries.includes(seriesKey)) {
          continue;
        }

        const result = await upsertPricePoints(
          toPricePoints({
            seriesKey,
            source: "energy-charts-chart",
            values,
          }),
        );
        inserted += result.inserted;
        updated += result.updated;
      }
    }

    await query(
      `
        UPDATE sync_runs
        SET status = $2,
            finished_at = NOW(),
            rows_inserted = $3,
            rows_updated = $4
        WHERE id = $1
      `,
      [syncRunId, "success", inserted, updated],
    );

    return { inserted, updated, window };
  } catch (error) {
    await query(
      `
        UPDATE sync_runs
        SET status = $2,
            finished_at = NOW(),
            error_message = $3
        WHERE id = $1
      `,
      [syncRunId, "failed", error instanceof Error ? error.message : String(error)],
    );
    throw error;
  }
}
