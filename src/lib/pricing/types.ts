export type ScenarioId =
  | "standard_mme"
  | "smart_meter_imsys"
  | "module2_blended"
  | "module3_blended";

export type Module3Band = "standard" | "high" | "low";

export type MeteringConfig = {
  annualGrossEur: number;
  steeringBoxAnnualGrossEur?: number;
  additionalAnnualGrossEur?: number;
};

export type PricingScenario = {
  id: ScenarioId;
  label: string;
  description: string;
  annualConsumptionKwh: number;
  controllableSharePercent: number;
  networkMode: "standard" | "module2" | "module3";
  metering: MeteringConfig;
  applyModule1Reduction?: boolean;
};

export type QuarterHourBreakdown = {
  spotCtKwh: number;
  procurementCtKwh: number;
  variableNetFeeCtKwh: number;
  section19CtKwh: number;
  kwkgCtKwh: number;
  offshoreCtKwh: number;
  electricityTaxCtKwh: number;
  concessionCtKwh: number;
  subtotalNetCtKwh: number;
  vatCtKwh: number;
  taxMultiplier: number;
};
