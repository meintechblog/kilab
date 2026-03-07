import type { PersistedPricePoint, SeriesKey, SourcePoint } from "./types";

type NormalizeInput = {
  seriesKey: SeriesKey;
  source: string;
  values: SourcePoint[];
};

export function toPricePoints({ seriesKey, source, values }: NormalizeInput): PersistedPricePoint[] {
  return values
    .filter((value): value is SourcePoint & { priceEurMwh: number } => Number.isFinite(value.priceEurMwh))
    .map((value) => {
      const startAt = new Date(value.timestampMs);
      const endAt = new Date(value.timestampMs + 15 * 60 * 1000);
      const priceEurMwh = Number(value.priceEurMwh.toFixed(3));
      const priceCtKwh = Number((priceEurMwh / 10).toFixed(4));

      return {
        seriesKey,
        source,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        priceEurMwh,
        priceCtKwh,
      };
    });
}
