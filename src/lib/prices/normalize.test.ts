import { describe, expect, it } from "vitest";
import { toPricePoints } from "./normalize";

describe("toPricePoints", () => {
  it("converts quarter-hour source values into persisted price points", () => {
    const points = toPricePoints({
      seriesKey: "day_ahead_quarter_hour",
      source: "energy-charts",
      values: [{ timestampMs: 1772838000000, priceEurMwh: 128.2 }],
    });

    expect(points).toEqual([
      {
        seriesKey: "day_ahead_quarter_hour",
        source: "energy-charts",
        startAt: "2026-03-06T23:00:00.000Z",
        endAt: "2026-03-06T23:15:00.000Z",
        priceEurMwh: 128.2,
        priceCtKwh: 12.82,
      },
    ]);
  });

  it("drops null and non-finite values", () => {
    const points = toPricePoints({
      seriesKey: "intraday_quarter_hour",
      source: "energy-charts",
      values: [
        { timestampMs: 1772838000000, priceEurMwh: Number.NaN },
        { timestampMs: 1772838900000, priceEurMwh: null },
        { timestampMs: 1772839800000, priceEurMwh: 80 },
      ],
    });

    expect(points).toHaveLength(1);
    expect(points[0]?.priceCtKwh).toBe(8);
  });
});
