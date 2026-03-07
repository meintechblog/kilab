import { describe, expect, it } from "vitest";
import { DEFAULT_ANNUAL_CONSUMPTION_KWH, scenarioPresets } from "./config";
import { buildScenarioChartRows, buildScenarioSummaries, calculateFixedPriceReference, calculateProjectedMonthlyEstimate } from "./dashboard";

const standard = scenarioPresets.find((scenario) => scenario.id === "standard_mme")!;

describe("pricing dashboard helpers", () => {
  it("builds real-price lines for every scenario from day-ahead chart rows", () => {
    const rows = buildScenarioChartRows([
      {
        timestamp: "2026-03-07T08:00:00.000Z",
        dayAheadCtKwh: 10,
        intradayCtKwh: 11,
      },
      {
        timestamp: "2026-03-07T08:15:00.000Z",
        dayAheadCtKwh: null,
        intradayCtKwh: 12,
      },
    ]);

    expect(rows[0].realPriceByScenario.standard_mme).toBeCloseTo(28.88, 2);
    expect(rows[0].realPriceByScenario.module2_blended).toBeLessThan(rows[0].realPriceByScenario.standard_mme!);
    expect(rows[1].realPriceByScenario.standard_mme).toBeNull();
  });

  it("builds scenario summaries with current real price and monthly projection", () => {
    const summaries = buildScenarioSummaries({
      annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
      currentSpotCtKwh: 10,
      currentTimestamp: "2026-03-07T08:00:00.000Z",
      profileShares: [0.25, 0.25, 0.5],
      spotSeriesCtKwh: [10, 20, null],
    });

    expect(summaries[0]).toMatchObject({
      id: "standard_mme",
      currentRealPriceCtKwh: expect.closeTo(28.88, 2),
      fixedMonthlyCostEur: expect.closeTo(13.16, 2),
      projectedMonthlyCostEur: expect.closeTo(1232.08, 2),
      currentBreakdown: {
        subtotalNetCtKwh: expect.closeTo(24.266, 3),
        vatCtKwh: expect.closeTo(4.6105, 4),
      },
      monthlyBreakdown: {
        estimatedEnergyKwh: expect.closeTo(3500, 8),
        variableCostEur: expect.closeTo(1218.92, 2),
      },
    });
    expect(summaries.find((scenario) => scenario.id === "module2_blended")!.currentRealPriceCtKwh).toBeLessThan(
      summaries[0].currentRealPriceCtKwh!,
    );
  });


  it("builds a fixed-price reference for chart and monthly comparison", () => {
    const fixed = calculateFixedPriceReference({
      annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
      fixedPriceCtKwh: 25,
      profileShares: [0.25, 0.25, 0.5],
      chartRows: [
        { timestamp: "2026-03-07T08:00:00.000Z", dayAheadCtKwh: 10, intradayCtKwh: 11, realPriceByScenario: { standard_mme: 28.88, smart_meter_imsys: 28.88, module2_blended: 27.49, module3_blended: 28.88 } },
        { timestamp: "2026-03-07T08:15:00.000Z", dayAheadCtKwh: null, intradayCtKwh: 12, realPriceByScenario: { standard_mme: null, smart_meter_imsys: null, module2_blended: null, module3_blended: null } },
      ],
    });

    expect(fixed.currentPriceCtKwh).toBe(25);
    expect(fixed.energyOnlyMonthlyCostEur).toBeCloseTo(875, 8);
    expect(fixed.monthlyBaseEur).toBe(12);
    expect(fixed.projectedMonthlyCostEur).toBeCloseTo(887, 8);
    expect(fixed.chartSeries).toEqual([25, 25]);
  });

  it("normalizes monthly coverage against the month share, not the full year", () => {
    const estimate = calculateProjectedMonthlyEstimate({
      annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
      scenario: standard,
      spotSeriesCtKwh: [10, 20, null],
      profileShares: [0.1, 0.1, 0.2],
    });

    expect(estimate.coverageRatio).toBeCloseTo(0.5, 8);
    expect(estimate.variableCostEur).toBeCloseTo(487.58, 2);
    expect(estimate.totalCostEur).toBeCloseTo(500.74, 2);
  });

  it("projects monthly costs from partial day-ahead coverage", () => {
    const estimate = calculateProjectedMonthlyEstimate({
      annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
      scenario: standard,
      spotSeriesCtKwh: [10, 20, null],
      profileShares: [0.25, 0.25, 0.5],
    });

    expect(estimate.coverageRatio).toBeCloseTo(0.5, 8);
    expect(estimate.variableCostEur).toBeCloseTo(1218.92, 2);
    expect(estimate.fixedCostEur).toBeCloseTo(13.16, 2);
    expect(estimate.totalCostEur).toBeCloseTo(1232.08, 2);
  });
});
