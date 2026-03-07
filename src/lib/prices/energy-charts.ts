import { addWeeks, getISOWeek, getISOWeekYear, startOfISOWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { SourcePoint, WeekDataUrlInput } from "./types";

type DayAheadPriceResponse = {
  unix_seconds?: number[] | null;
  price?: Array<number | null> | null;
};

type WeekSeries = {
  name?: Array<Record<string, string>> | Record<string, string> | string;
  xAxisValues?: number[];
  data?: Array<number | null>;
};

type FetchImpl = typeof fetch;

export async function fetchDayAheadPriceSeries(
  startAt: Date,
  endAt: Date,
  fetchImpl: FetchImpl = fetch,
): Promise<SourcePoint[]> {
  const url = new URL("https://api.energy-charts.info/price");
  url.searchParams.set("bzn", "DE-LU");
  url.searchParams.set("start", startAt.toISOString());
  url.searchParams.set("end", endAt.toISOString());

  const response = await fetchImpl(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch day-ahead price data: ${response.status}`);
  }

  return parseDayAheadPriceResponse((await response.json()) as DayAheadPriceResponse);
}

export async function fetchIntradaySeries(
  startAt: Date,
  endAt: Date,
  timezone: string,
  fetchImpl: FetchImpl = fetch,
) {
  const urls = buildWeekDataUrls({ startAt, endAt, timezone });
  const responses = await Promise.all(
    urls.map(async (url) => {
      const response = await fetchImpl(url, { headers: { accept: "application/json" } });
      if (!response.ok) {
        return [] as WeekSeries[];
      }
      return (await response.json()) as WeekSeries[];
    }),
  );

  const combined = responses.flat();
  return extractQuarterHourSeries(combined);
}

export function parseDayAheadPriceResponse(payload: DayAheadPriceResponse): SourcePoint[] {
  const timestamps = payload.unix_seconds ?? [];
  const prices = payload.price ?? [];

  return timestamps.map((unixSeconds, index) => ({
    timestampMs: unixSeconds * 1000,
    priceEurMwh: prices[index] ?? null,
  }));
}

export function buildWeekDataUrls({ startAt, endAt, timezone }: WeekDataUrlInput): string[] {
  const urls: string[] = [];
  let cursor = startOfISOWeek(toZonedTime(startAt, timezone));
  const endWeek = startOfISOWeek(toZonedTime(endAt, timezone));

  while (cursor <= endWeek) {
    const isoYear = getISOWeekYear(cursor);
    const isoWeek = getISOWeek(cursor);
    urls.push(
      `https://energy-charts.info/charts/price_spot_market/data/de/week_15min_${isoYear}_${isoWeek}.json`,
    );
    cursor = addWeeks(cursor, 1);
  }

  return urls;
}

export function extractQuarterHourSeries(dataset: WeekSeries[]) {
  return {
    dayAheadAuction: extractNamedSeries(dataset, "Day Ahead Auction (DE-LU)"),
    intradayContinuousAverage: extractNamedSeries(
      dataset,
      "Intraday Continuous 15 minutes Average Price (DE-LU)",
    ),
    intradayAuction1: extractNamedSeries(
      dataset,
      "Pan-European Intraday auction, 15 minutes IDA1 price (DE-LU)",
    ),
    intradayAuction2: extractNamedSeries(
      dataset,
      "Pan-European Intraday auction, 15 minutes IDA2 price (DE-LU)",
    ),
    intradayAuction3: extractNamedSeries(
      dataset,
      "Pan-European Intraday auction, 15 minutes IDA3 price (DE-LU)",
    ),
  };
}

function extractNamedSeries(dataset: WeekSeries[], expectedName: string): SourcePoint[] {
  const sharedXAxisValues = dataset.find((entry) => (entry.xAxisValues?.length ?? 0) > 0)?.xAxisValues ?? [];

  return dataset
    .filter((entry) => resolveSeriesName(entry.name) === expectedName)
    .flatMap((series) => {
      const timestamps = series.xAxisValues ?? sharedXAxisValues;
      const prices = series.data ?? [];

      return timestamps.map((timestampMs, index) => ({
        timestampMs,
        priceEurMwh: prices[index] ?? null,
      }));
    })
    .filter((point) => point.priceEurMwh !== null)
    .sort((left, right) => left.timestampMs - right.timestampMs);
}

function resolveSeriesName(input: WeekSeries["name"]): string {
  if (Array.isArray(input)) {
    return resolveSeriesName(input[0]);
  }

  if (!input) {
    return "";
  }

  if (typeof input === "string") {
    return input;
  }

  return input.en ?? Object.values(input)[0] ?? "";
}
