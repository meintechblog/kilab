import type { PersistedPricePoint, SeriesKey } from "./types";

const SERIES_CATALOG: Record<SeriesKey, { label: string; source: string; unit: string }> = {
  day_ahead_quarter_hour: {
    label: "Day Ahead Auktion (DE-LU)",
    source: "energy-charts-api",
    unit: "EUR/MWh",
  },
  intraday_quarter_hour: {
    label: "Intraday Continuous 15 Minuten Durchschnitt (DE-LU)",
    source: "energy-charts-chart",
    unit: "EUR/MWh",
  },
  intraday_auction_id1_quarter_hour: {
    label: "Intraday Auktion IDA1 15 Minuten (DE-LU)",
    source: "energy-charts-chart",
    unit: "EUR/MWh",
  },
  intraday_auction_id2_quarter_hour: {
    label: "Intraday Auktion IDA2 15 Minuten (DE-LU)",
    source: "energy-charts-chart",
    unit: "EUR/MWh",
  },
  intraday_auction_id3_quarter_hour: {
    label: "Intraday Auktion IDA3 15 Minuten (DE-LU)",
    source: "energy-charts-chart",
    unit: "EUR/MWh",
  },
};

async function getQuery() {
  const { query } = await import("../db");
  return query;
}

export async function ensureSeriesKeys(seriesKeys: SeriesKey[]) {
  const query = await getQuery();
  for (const seriesKey of seriesKeys) {
    const definition = SERIES_CATALOG[seriesKey];
    await query(
      `
        INSERT INTO market_price_series (key, label, source, unit)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (key) DO UPDATE
        SET label = EXCLUDED.label,
            source = EXCLUDED.source,
            unit = EXCLUDED.unit,
            updated_at = NOW()
      `,
      [seriesKey, definition.label, definition.source, definition.unit],
    );
  }
}

export async function upsertPricePoints(points: PersistedPricePoint[]) {
  const query = await getQuery();
  if (points.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  let inserted = 0;
  let updated = 0;

  for (const point of points) {
    const result = await query<{ inserted: boolean }>(
      `
        WITH selected_series AS (
          SELECT id FROM market_price_series WHERE key = $1
        ),
        upserted AS (
          INSERT INTO market_price_points (
            series_id,
            start_at,
            end_at,
            price_eur_mwh,
            price_ct_kwh,
            source_timestamp,
            fetched_at
          )
          SELECT
            selected_series.id,
            $2::timestamptz,
            $3::timestamptz,
            $4::numeric,
            $5::numeric,
            $2::timestamptz,
            NOW()
          FROM selected_series
          ON CONFLICT (series_id, start_at) DO UPDATE SET
            end_at = EXCLUDED.end_at,
            price_eur_mwh = EXCLUDED.price_eur_mwh,
            price_ct_kwh = EXCLUDED.price_ct_kwh,
            source_timestamp = EXCLUDED.source_timestamp,
            fetched_at = NOW()
          RETURNING (xmax = 0) AS inserted
        )
        SELECT inserted FROM upserted
      `,
      [point.seriesKey, point.startAt, point.endAt, point.priceEurMwh, point.priceCtKwh],
    );

    if (result.rows[0]?.inserted) {
      inserted += 1;
    } else {
      updated += 1;
    }
  }

  return { inserted, updated };
}
