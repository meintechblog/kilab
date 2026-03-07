import { describe, expect, it } from "vitest";
import { getMonthProfileShares, scaleMonthProfileToConsumption } from "./load-profile";

describe("load profile helpers", () => {
  it("returns March 2026 H0 shares that sum to the expected monthly energy", () => {
    const shares = getMonthProfileShares(2026, 3);
    const energy = scaleMonthProfileToConsumption(shares, 3500);

    expect(shares.length).toBe(2976);
    expect(energy.reduce((sum, value) => sum + value, 0)).toBeCloseTo(289.63, 2);
  });

  it("scales the month linearly with annual consumption", () => {
    const shares = getMonthProfileShares(2026, 3);
    const base = scaleMonthProfileToConsumption(shares, 3500);
    const larger = scaleMonthProfileToConsumption(shares, 4200);

    expect(larger[0]).toBeCloseTo(base[0] * 1.2, 8);
  });
});
