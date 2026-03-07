import { getHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  schwabischHallNetwork,
  statutoryAddersCtKwh,
  tibberTariff,
  VAT_MULTIPLIER,
} from "./config";
import type { Module3Band, PricingScenario, QuarterHourBreakdown } from "./types";

export function getModule3Band(timestamp: string, timezone = "Europe/Berlin"): Module3Band {
  const hour = getHours(toZonedTime(timestamp, timezone));

  if (hour >= 22 || hour < 7) {
    return "low";
  }

  if ((hour >= 10 && hour < 14) || (hour >= 18 && hour < 20)) {
    return "high";
  }

  return "standard";
}

export function calculateScenarioQuarterHourPrice({
  scenario,
  spotCtKwh,
  timestamp,
}: {
  scenario: PricingScenario;
  spotCtKwh: number;
  timestamp: string;
}) {
  const variableNetFeeCtKwh = getVariableNetFeeCtKwh(scenario, timestamp);
  const subtotalNetCtKwh =
    spotCtKwh +
    tibberTariff.procurementAdderCtKwh +
    variableNetFeeCtKwh +
    statutoryAddersCtKwh.section19 +
    statutoryAddersCtKwh.kwkg +
    statutoryAddersCtKwh.offshore +
    statutoryAddersCtKwh.electricityTax +
    statutoryAddersCtKwh.concession;
  const vatCtKwh = Number((subtotalNetCtKwh * (VAT_MULTIPLIER - 1)).toFixed(4));
  const realPriceCtKwh = Number((subtotalNetCtKwh + vatCtKwh).toFixed(4));

  return {
    realPriceCtKwh,
    breakdown: {
      spotCtKwh,
      procurementCtKwh: tibberTariff.procurementAdderCtKwh,
      variableNetFeeCtKwh,
      section19CtKwh: statutoryAddersCtKwh.section19,
      kwkgCtKwh: statutoryAddersCtKwh.kwkg,
      offshoreCtKwh: statutoryAddersCtKwh.offshore,
      electricityTaxCtKwh: statutoryAddersCtKwh.electricityTax,
      concessionCtKwh: statutoryAddersCtKwh.concession,
      subtotalNetCtKwh: Number(subtotalNetCtKwh.toFixed(4)),
      vatCtKwh,
      taxMultiplier: VAT_MULTIPLIER,
    } satisfies QuarterHourBreakdown,
  };
}

export function calculateMonthlyEstimate({
  annualConsumptionKwh,
  scenario,
  rows,
  profileShares,
}: {
  annualConsumptionKwh: number;
  scenario: PricingScenario;
  rows: Array<{ timestamp: string; spotPriceCtKwh: number }>;
  profileShares: number[];
}) {
  const variableCostEur = rows.reduce((sum, row, index) => {
    const energyKwh = profileShares[index] ?? 0;
    const quarter = calculateScenarioQuarterHourPrice({
      scenario,
      spotCtKwh: row.spotPriceCtKwh,
      timestamp: row.timestamp,
    });
    return sum + energyKwh * (quarter.realPriceCtKwh / 100);
  }, 0);

  const fixedCostEur = getScenarioFixedMonthlyCostEur(scenario);

  return {
    variableCostEur: Number(variableCostEur.toFixed(2)),
    fixedCostEur: Number(fixedCostEur.toFixed(2)),
    totalCostEur: Number((variableCostEur + fixedCostEur).toFixed(2)),
    annualConsumptionKwh,
  };
}

export function getScenarioFixedMonthlyCostEur(scenario: PricingScenario) {
  const annualMetering =
    scenario.metering.annualGrossEur +
    (scenario.metering.additionalAnnualGrossEur ?? 0) +
    (scenario.metering.steeringBoxAnnualGrossEur ?? 0);

  const annualFixed =
    tibberTariff.monthlyBaseGrossEur * 12 +
    schwabischHallNetwork.annualBaseGrossEur +
    annualMetering -
    (scenario.applyModule1Reduction ? schwabischHallNetwork.module1AnnualReductionGrossEur : 0);

  return Math.max(0, annualFixed / 12);
}

function getVariableNetFeeCtKwh(scenario: PricingScenario, timestamp: string) {
  const controllableShare = scenario.controllableSharePercent / 100;
  const standardShare = 1 - controllableShare;

  if (scenario.networkMode === "standard") {
    return schwabischHallNetwork.standardNetFeeCtKwh;
  }

  if (scenario.networkMode === "module2") {
    return Number(
      (
        standardShare * schwabischHallNetwork.standardNetFeeCtKwh +
        controllableShare * schwabischHallNetwork.module2NetFeeCtKwh
      ).toFixed(4),
    );
  }

  const band = getModule3Band(timestamp);
  return Number(
    (
      standardShare * schwabischHallNetwork.standardNetFeeCtKwh +
      controllableShare * schwabischHallNetwork.module3NetFeeBandsCtKwh[band]
    ).toFixed(4),
  );
}
