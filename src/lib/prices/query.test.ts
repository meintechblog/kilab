import { describe, expect, it } from "vitest";
import { buildChartRows, buildMonthlySpotSeries, selectCurrentPoint } from "./query";

const dayAhead = [
  {
    startAt: "2026-03-06T23:00:00.000Z",
    endAt: "2026-03-06T23:15:00.000Z",
    priceCtKwh: 12.82,
  },
  {
    startAt: "2026-03-07T23:00:00.000Z",
    endAt: "2026-03-07T23:15:00.000Z",
    priceCtKwh: 8.5,
  },
];

const intraday = [
  {
    startAt: "2026-03-06T23:00:00.000Z",
    endAt: "2026-03-06T23:15:00.000Z",
    priceCtKwh: 13.1,
  },
];

describe("dashboard query helpers", () => {
  it("selects the point active at the requested time", () => {
    expect(selectCurrentPoint(dayAhead, new Date("2026-03-06T23:07:00.000Z"))).toEqual(dayAhead[0]);
  });

  it("falls back to the latest known point when no active interval exists", () => {
    expect(selectCurrentPoint(dayAhead, new Date("2026-03-08T12:00:00.000Z"))).toEqual(dayAhead[1]);
  });


  it("maps monthly day-ahead points into quarter-hour slots", () => {
    expect(
      buildMonthlySpotSeries({
        points: [
          {
            startAt: "2026-03-01T00:00:00.000Z",
            endAt: "2026-03-01T00:15:00.000Z",
            priceCtKwh: 10,
          },
          {
            startAt: "2026-03-01T00:30:00.000Z",
            endAt: "2026-03-01T00:45:00.000Z",
            priceCtKwh: 20,
          },
        ],
        monthStartIso: "2026-03-01T00:00:00.000Z",
        slotCount: 4,
      }),
    ).toEqual([10, null, 20, null]);
  });

  it("builds chart rows merged by timestamp", () => {
    expect(buildChartRows({ dayAhead, intraday })).toEqual([
      {
        timestamp: "2026-03-06T23:00:00.000Z",
        dayAheadCtKwh: 12.82,
        intradayCtKwh: 13.1,
      },
      {
        timestamp: "2026-03-07T23:00:00.000Z",
        dayAheadCtKwh: 8.5,
        intradayCtKwh: null,
      },
    ]);
  });
});
