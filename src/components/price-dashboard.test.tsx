import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PriceDashboard } from "./price-dashboard";

vi.mock("./price-chart", () => ({
  PriceChart: () => <div data-testid="price-chart" />,
}));

const dashboard = {
  generatedAt: "2026-03-08T12:00:00.000Z",
  chartRows: [],
  currentDayAhead: { startAt: "2026-03-08T12:00:00.000Z", endAt: "2026-03-08T12:15:00.000Z", priceCtKwh: 12.5 },
  currentIntraday: { startAt: "2026-03-08T12:00:00.000Z", endAt: "2026-03-08T12:15:00.000Z", priceCtKwh: 13.1 },
  lastSync: { finished_at: "2026-03-08T11:58:00.000Z", rows_inserted: 10, rows_updated: 4 },
  availableUntil: "2026-03-09T22:45:00.000Z",
  locationLabel: "Schwaebisch Hall",
  householdProfileLabel: "BDEW H0, 3-Personen-Haus",
  annualConsumptionKwh: 3500,
  defaultScenarioId: "standard_mme",
  pricingSourceVersion: "test-version",
  scenarioOptions: [
    { id: "standard_mme", label: "Standardzaehler", description: "Test" },
    { id: "smart_meter_imsys", label: "Smart Meter", description: "Test" },
    { id: "module2_blended", label: "§14a Modul 2", description: "Test" },
    { id: "module3_blended", label: "§14a Modul 3", description: "Test" },
  ],
  scenarioSummaries: [
    {
      id: "standard_mme",
      label: "Standardzaehler",
      description: "Test",
      currentRealPriceCtKwh: 29.4,
      currentBreakdown: {
        spotCtKwh: 12.5,
        procurementCtKwh: 2.15,
        variableNetFeeCtKwh: 5.53,
        section19CtKwh: 1.559,
        kwkgCtKwh: 0.446,
        offshoreCtKwh: 0.941,
        electricityTaxCtKwh: 2.05,
        concessionCtKwh: 1.59,
        subtotalNetCtKwh: 26.766,
        vatCtKwh: 5.0855,
        taxMultiplier: 1.19,
      },
      fixedMonthlyCostEur: 13.16,
      variableMonthlyCostEur: 70,
      projectedMonthlyCostEur: 83.16,
      coverageRatio: 0.4,
      controllableSharePercent: 0,
      meteringLabel: "mME",
      networkMode: "standard",
      monthlyBreakdown: { estimatedEnergyKwh: 280, variableCostEur: 70, fixedCostEur: 13.16 },
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
    note: "Vergleich mit 25 ct/kWh Arbeitspreis plus angenommenem Grundpreis von 12 EUR/Monat.",
  },
} as const;

describe("PriceDashboard", () => {
  it("renders the pricing breakdown and fixed-price comparison panels", () => {
    const html = renderToStaticMarkup(<PriceDashboard dashboard={dashboard} />);

    expect(html).toContain("Preiszusammensetzung jetzt");
    expect(html).toContain("Monatsrechnung erklaert");
    expect(html).toContain("Fixpreis 25 ct/kWh");
  });

  it("uses the new stronger visual framing copy", () => {
    const html = renderToStaticMarkup(<PriceDashboard dashboard={dashboard} />);

    expect(html).toContain("Flexpreis gegen Fixpreis");
    expect(html).toContain("Karten unten steuern jetzt direkt das aktive Szenario");
    expect(html).toContain("Dein aktueller Vertrag");
    expect(html).toContain("graphite-shell");
  });
});
