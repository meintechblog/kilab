import monthShares from "../../data/h0-profile-2026.json";

export function getMonthProfileShares(year: number, month: number) {
  const key = `${year}-${String(month).padStart(2, "0")}` as keyof typeof monthShares;
  const shares = monthShares[key];
  if (!shares) {
    throw new Error(`No H0 profile data for ${key}`);
  }
  return shares;
}

export function scaleMonthProfileToConsumption(shares: number[], annualConsumptionKwh: number) {
  return shares.map((share) => share * annualConsumptionKwh);
}
