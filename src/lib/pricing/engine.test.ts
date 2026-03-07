import { describe, expect, it } from "vitest";
import { calculateMonthlyEstimate, calculateScenarioQuarterHourPrice, getModule3Band } from "./engine";
import { scenarioPresets } from "./config";

const standard = scenarioPresets.find((scenario) => scenario.id === "standard_mme")!;
const module2 = scenarioPresets.find((scenario) => scenario.id === "module2_blended")!;
const module3 = scenarioPresets.find((scenario) => scenario.id === "module3_blended")!;

describe("pricing engine", () => {
  it("calculates a realistic household real price for the standard scenario", () => {
    const result = calculateScenarioQuarterHourPrice({
      scenario: standard,
      spotCtKwh: 10,
      timestamp: "2026-03-07T08:00:00.000Z",
    });

    expect(result.realPriceCtKwh).toBeCloseTo(28.88, 2);
    expect(result.breakdown.variableNetFeeCtKwh).toBeCloseTo(5.53, 2);
    expect(result.breakdown.taxMultiplier).toBe(1.19);
    expect(result.breakdown.subtotalNetCtKwh).toBeCloseTo(24.266, 3);
    expect(result.breakdown.vatCtKwh).toBeCloseTo(4.6105, 4);
  });

  it("reduces the blended real price for module 2 when part of the load is controllable", () => {
    const result = calculateScenarioQuarterHourPrice({
      scenario: module2,
      spotCtKwh: 10,
      timestamp: "2026-03-07T08:00:00.000Z",
    });

    expect(result.realPriceCtKwh).toBeCloseTo(27.49, 2);
    expect(result.breakdown.variableNetFeeCtKwh).toBeCloseTo(4.37, 2);
  });

  it("switches the module 3 net band by time of day", () => {
    expect(getModule3Band("2026-03-07T09:30:00.000Z")).toBe("high");
    expect(getModule3Band("2026-03-07T07:30:00.000Z")).toBe("standard");
    expect(getModule3Band("2026-03-07T23:15:00.000Z")).toBe("low");

    const high = calculateScenarioQuarterHourPrice({
      scenario: module3,
      spotCtKwh: 10,
      timestamp: "2026-03-07T09:30:00.000Z",
    });
    const low = calculateScenarioQuarterHourPrice({
      scenario: module3,
      spotCtKwh: 10,
      timestamp: "2026-03-07T23:15:00.000Z",
    });

    expect(high.realPriceCtKwh).toBeGreaterThan(low.realPriceCtKwh);
    expect(low.breakdown.variableNetFeeCtKwh).toBeCloseTo(3.98, 2);
  });

  it("estimates a month from variable and fixed components", () => {
    const estimate = calculateMonthlyEstimate({
      annualConsumptionKwh: 3500,
      scenario: standard,
      rows: [
        { timestamp: "2026-03-01T00:00:00.000Z", spotPriceCtKwh: 10 },
        { timestamp: "2026-03-01T00:15:00.000Z", spotPriceCtKwh: 20 },
      ],
      profileShares: [0.25, 0.75],
    });

    expect(estimate.variableCostEur).toBeCloseTo(0.38, 2);
    expect(estimate.fixedCostEur).toBeCloseTo(13.16, 2);
    expect(estimate.totalCostEur).toBeCloseTo(13.53, 2);
  });
});
