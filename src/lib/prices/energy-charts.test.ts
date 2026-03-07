import { describe, expect, it } from "vitest";
import {
  buildWeekDataUrls,
  extractQuarterHourSeries,
  parseDayAheadPriceResponse,
} from "./energy-charts";

const dayAheadResponse = {
  license_info: "CC BY 4.0",
  unit: "EUR/MWh",
  deprecated: false,
  unix_seconds: [1772838000, 1772838900],
  price: [128.2, 120.5],
};

const weekDataset = [
  {
    name: [{ en: "Day Ahead Auction (DE-LU)" }],
    unit: "EUR/MWh",
    data: [128.2, 120.5],
    xAxisValues: [1772838000000, 1772838900000],
  },
  {
    name: [{ en: "Intraday Continuous 15 minutes Average Price (DE-LU)" }],
    unit: "EUR/MWh",
    data: [130.4, 118.8],
    xAxisValues: [1772838000000, 1772838900000],
  },
  {
    name: [{ en: "Pan-European Intraday auction, 15 minutes IDA1 price (DE-LU)" }],
    unit: "EUR/MWh",
    data: [131.4, 117.1],
    xAxisValues: [1772838000000, 1772838900000],
  },
];

describe("energy charts helpers", () => {
  it("parses the public day-ahead response into quarter-hour points", () => {
    expect(parseDayAheadPriceResponse(dayAheadResponse)).toEqual([
      { timestampMs: 1772838000000, priceEurMwh: 128.2 },
      { timestampMs: 1772838900000, priceEurMwh: 120.5 },
    ]);
  });

  it("extracts the supported quarter-hour series from the weekly spot-market dataset", () => {
    const extracted = extractQuarterHourSeries(weekDataset);

    expect(extracted.dayAheadAuction).toEqual([
      { timestampMs: 1772838000000, priceEurMwh: 128.2 },
      { timestampMs: 1772838900000, priceEurMwh: 120.5 },
    ]);
    expect(extracted.intradayContinuousAverage).toEqual([
      { timestampMs: 1772838000000, priceEurMwh: 130.4 },
      { timestampMs: 1772838900000, priceEurMwh: 118.8 },
    ]);
    expect(extracted.intradayAuction1).toEqual([
      { timestampMs: 1772838000000, priceEurMwh: 131.4 },
      { timestampMs: 1772838900000, priceEurMwh: 117.1 },
    ]);
  });

  it("uses the shared xAxisValues from the dataset header when a series omits them", () => {
    const extracted = extractQuarterHourSeries([
      {
        name: { en: "Header" },
        data: [],
        xAxisValues: [1772838000000, 1772838900000],
      },
      {
        name: [{ en: "Intraday Continuous 15 minutes Average Price (DE-LU)" }],
        data: [130.4, 118.8],
      },
    ]);

    expect(extracted.intradayContinuousAverage).toEqual([
      { timestampMs: 1772838000000, priceEurMwh: 130.4 },
      { timestampMs: 1772838900000, priceEurMwh: 118.8 },
    ]);
  });

  it("merges matching series across multiple weekly datasets", () => {
    const extracted = extractQuarterHourSeries([
      {
        name: [{ en: "Intraday Continuous 15 minutes Average Price (DE-LU)" }],
        unit: "EUR/MWh",
        data: [101.1],
        xAxisValues: [1772751600000],
      },
      {
        name: [{ en: "Intraday Continuous 15 minutes Average Price (DE-LU)" }],
        unit: "EUR/MWh",
        data: [102.2],
        xAxisValues: [1772752500000],
      },
    ]);

    expect(extracted.intradayContinuousAverage).toEqual([
      { timestampMs: 1772751600000, priceEurMwh: 101.1 },
      { timestampMs: 1772752500000, priceEurMwh: 102.2 },
    ]);
  });

  it("builds all required weekly data URLs for a date window", () => {
    expect(
      buildWeekDataUrls({
        startAt: new Date("2026-03-01T00:00:00+01:00"),
        endAt: new Date("2026-03-10T00:00:00+01:00"),
        timezone: "Europe/Berlin",
      }),
    ).toEqual([
      "https://energy-charts.info/charts/price_spot_market/data/de/week_15min_2026_9.json",
      "https://energy-charts.info/charts/price_spot_market/data/de/week_15min_2026_10.json",
      "https://energy-charts.info/charts/price_spot_market/data/de/week_15min_2026_11.json",
    ]);
  });
});
