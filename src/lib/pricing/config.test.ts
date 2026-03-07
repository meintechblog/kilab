import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO_ID, MUNICIPALITY_KONZESSIONSABGABE_CT_KWH, PRICING_SOURCE_VERSION, scenarioPresets, tibberTariff } from "./config";

describe("pricing config", () => {
  it("exposes the Schwäbisch Hall and Tibber defaults", () => {
    expect(PRICING_SOURCE_VERSION).toBe("2026-03-07-sha-tibber-v1");
    expect(tibberTariff.monthlyBaseGrossEur).toBe(5.99);
    expect(tibberTariff.procurementAdderCtKwh).toBe(2.15);
    expect(MUNICIPALITY_KONZESSIONSABGABE_CT_KWH).toBe(1.59);
  });

  it("defines the expected comparison presets", () => {
    expect(DEFAULT_SCENARIO_ID).toBe("standard_mme");
    expect(scenarioPresets.map((scenario) => scenario.id)).toEqual([
      "standard_mme",
      "smart_meter_imsys",
      "module2_blended",
      "module3_blended",
    ]);
    expect(scenarioPresets.find((scenario) => scenario.id === "module3_blended")).toMatchObject({
      controllableSharePercent: 35,
      metering: {
        annualGrossEur: 80,
        steeringBoxAnnualGrossEur: 50,
      },
    });
  });
});
