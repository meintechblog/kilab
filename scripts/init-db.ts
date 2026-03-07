import { query } from "../src/lib/db";

async function main() {
  await query(`
    CREATE TABLE IF NOT EXISTS market_price_series (
      id TEXT PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
      key TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      source TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS market_price_points (
      id TEXT PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
      series_id TEXT NOT NULL REFERENCES market_price_series(id) ON DELETE CASCADE,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ NOT NULL,
      price_eur_mwh NUMERIC(10,3) NOT NULL,
      price_ct_kwh NUMERIC(10,4) NOT NULL,
      source_timestamp TIMESTAMPTZ,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (series_id, start_at)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY DEFAULT md5(random()::text || clock_timestamp()::text),
      job_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ,
      rows_inserted INTEGER NOT NULL DEFAULT 0,
      rows_updated INTEGER NOT NULL DEFAULT 0,
      details_json TEXT,
      error_message TEXT
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS market_price_points_start_at_idx ON market_price_points (start_at)`);
  await query(`CREATE INDEX IF NOT EXISTS sync_runs_job_name_started_at_idx ON sync_runs (job_name, started_at DESC)`);
  console.log("database initialized");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
