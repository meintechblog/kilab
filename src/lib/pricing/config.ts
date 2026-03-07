import type { PricingScenario, ScenarioId } from "./types";

export const PRICING_SOURCE_VERSION = "2026-03-07-sha-tibber-v1";
export const DEFAULT_SCENARIO_ID: ScenarioId = "standard_mme";
export const DEFAULT_ANNUAL_CONSUMPTION_KWH = 3500;
export const MUNICIPALITY_KONZESSIONSABGABE_CT_KWH = 1.59;
export const VAT_MULTIPLIER = 1.19;

export const tibberTariff = {
  monthlyBaseGrossEur: 5.99,
  procurementAdderCtKwh: 2.15,
};

export const schwabischHallNetwork = {
  annualBaseGrossEur: 61,
  standardNetFeeCtKwh: 5.53,
  module1AnnualReductionGrossEur: 108.7,
  module2NetFeeCtKwh: 2.21,
  module3NetFeeBandsCtKwh: {
    standard: 5.53,
    high: 8.14,
    low: 1.11,
  },
};

export const statutoryAddersCtKwh = {
  section19: 1.559,
  kwkg: 0.446,
  offshore: 0.941,
  electricityTax: 2.05,
  concession: MUNICIPALITY_KONZESSIONSABGABE_CT_KWH,
};

export const scenarioPresets: PricingScenario[] = [
  {
    id: "standard_mme",
    label: "Standardzaehler",
    description: "Haushalt mit mME, ohne §14a-Vorteile.",
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    controllableSharePercent: 0,
    networkMode: "standard",
    metering: {
      annualGrossEur: 25,
    },
  },
  {
    id: "smart_meter_imsys",
    label: "Smart Meter",
    description: "Haushalt mit iMSys, aber ohne §14a-Modul.",
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    controllableSharePercent: 0,
    networkMode: "standard",
    metering: {
      annualGrossEur: 30,
    },
  },
  {
    id: "module2_blended",
    label: "§14a Modul 2",
    description: "Blend aus Standardhaushalt und 35 % separat gemessenem steuerbarem Anteil.",
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    controllableSharePercent: 35,
    networkMode: "module2",
    metering: {
      annualGrossEur: 25,
      additionalAnnualGrossEur: 25,
    },
  },
  {
    id: "module3_blended",
    label: "§14a Modul 3",
    description: "Blend aus Standardhaushalt und 35 % steuerbarem Anteil mit zeitvariablem Netzentgelt.",
    annualConsumptionKwh: DEFAULT_ANNUAL_CONSUMPTION_KWH,
    controllableSharePercent: 35,
    networkMode: "module3",
    applyModule1Reduction: true,
    metering: {
      annualGrossEur: 80,
      steeringBoxAnnualGrossEur: 50,
    },
  },
];
