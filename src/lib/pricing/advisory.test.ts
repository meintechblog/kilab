import { describe, expect, it } from "vitest";
import { deriveDecisionAdvisory } from "./advisory";

const chartRows = [
  {
    timestamp: "2026-03-08T12:00:00.000Z",
    dayAheadCtKwh: 11,
    intradayCtKwh: 12,
    realPriceByScenario: {
      standard_mme: 21,
      smart_meter_imsys: 21.5,
      module2_blended: 20.4,
      module3_blended: 19.8,
    },
  },
  {
    timestamp: "2026-03-08T12:15:00.000Z",
    dayAheadCtKwh: 9,
    intradayCtKwh: 10,
    realPriceByScenario: {
      standard_mme: 19,
      smart_meter_imsys: 19.5,
      module2_blended: 18.7,
      module3_blended: 18.1,
    },
  },
  {
    timestamp: "2026-03-08T12:30:00.000Z",
    dayAheadCtKwh: 14,
    intradayCtKwh: 15,
    realPriceByScenario: {
      standard_mme: 24,
      smart_meter_imsys: 24.5,
      module2_blended: 23.6,
      module3_blended: 22.9,
    },
  },
  {
    timestamp: "2026-03-08T12:45:00.000Z",
    dayAheadCtKwh: 16,
    intradayCtKwh: 16.4,
    realPriceByScenario: {
      standard_mme: 26,
      smart_meter_imsys: 26.3,
      module2_blended: 25.5,
      module3_blended: 24.9,
    },
  },
  {
    timestamp: "2026-03-08T13:00:00.000Z",
    dayAheadCtKwh: 8,
    intradayCtKwh: 8.5,
    realPriceByScenario: {
      standard_mme: 18,
      smart_meter_imsys: 18.4,
      module2_blended: 17.7,
      module3_blended: 17.2,
    },
  },
  {
    timestamp: "2026-03-08T13:15:00.000Z",
    dayAheadCtKwh: 10,
    intradayCtKwh: 10.2,
    realPriceByScenario: {
      standard_mme: 20,
      smart_meter_imsys: 20.5,
      module2_blended: 19.8,
      module3_blended: 19.1,
    },
  },
] as const;

describe("deriveDecisionAdvisory", () => {
  it("derives current spread, monthly delta, cheapest upcoming slots, and best hour block", () => {
    const advisory = deriveDecisionAdvisory({
      nowIso: "2026-03-08T12:07:00.000Z",
      chartRows,
      selectedScenarioId: "standard_mme",
      scenarioSummaries: [
        {
          id: "standard_mme",
          label: "Standardzaehler",
          description: "Test",
          currentRealPriceCtKwh: 21,
          currentBreakdown: null,
          fixedMonthlyCostEur: 13.16,
          variableMonthlyCostEur: 65,
          projectedMonthlyCostEur: 78.16,
          coverageRatio: 0.4,
          controllableSharePercent: 0,
          meteringLabel: "mME",
          networkMode: "standard",
          monthlyBreakdown: { estimatedEnergyKwh: 280, variableCostEur: 65, fixedCostEur: 13.16 },
        },
      ],
      fixedPriceReference: {
        label: "Fixpreis 25 ct/kWh",
        fixedPriceCtKwh: 25,
        currentPriceCtKwh: 25,
        energyOnlyMonthlyCostEur: 70,
        monthlyBaseEur: 12,
        projectedMonthlyCostEur: 82,
        estimatedEnergyKwh: 280,
        note: "Test",
      },
    });

    expect(advisory.current.status).toBe("cheaper");
    expect(advisory.current.deltaCtKwh).toBe(-4);
    expect(advisory.monthly.deltaEur).toBeCloseTo(-3.84, 2);
    expect(advisory.upcoming.cheapestSlots).toHaveLength(3);
    expect(advisory.upcoming.cheapestSlots[0]?.startAt).toBe("2026-03-08T13:00:00.000Z");
    expect(advisory.upcoming.cheapestSlots[0]?.deltaToFixedCtKwh).toBe(-7);
    expect(advisory.upcoming.bestHourBlock?.startAt).toBe("2026-03-08T12:15:00.000Z");
    expect(advisory.upcoming.bestHourBlock?.averagePriceCtKwh).toBe(21.75);
  });

  it("returns unavailable upcoming guidance when no future prices exist", () => {
    const advisory = deriveDecisionAdvisory({
      nowIso: "2026-03-08T14:00:00.000Z",
      chartRows: chartRows.slice(0, 1),
      selectedScenarioId: "standard_mme",
      scenarioSummaries: [
        {
          id: "standard_mme",
          label: "Standardzaehler",
          description: "Test",
          currentRealPriceCtKwh: 21,
          currentBreakdown: null,
          fixedMonthlyCostEur: 13.16,
          variableMonthlyCostEur: 65,
          projectedMonthlyCostEur: 78.16,
          coverageRatio: 0.4,
          controllableSharePercent: 0,
          meteringLabel: "mME",
          networkMode: "standard",
          monthlyBreakdown: { estimatedEnergyKwh: 280, variableCostEur: 65, fixedCostEur: 13.16 },
        },
      ],
      fixedPriceReference: {
        label: "Fixpreis 25 ct/kWh",
        fixedPriceCtKwh: 25,
        currentPriceCtKwh: 25,
        energyOnlyMonthlyCostEur: 70,
        monthlyBaseEur: 12,
        projectedMonthlyCostEur: 82,
        estimatedEnergyKwh: 280,
        note: "Test",
      },
    });

    expect(advisory.upcoming.cheapestSlots).toEqual([]);
    expect(advisory.upcoming.bestHourBlock).toBeNull();
    expect(advisory.monthly.status).toBe("cheaper");
  });
});
