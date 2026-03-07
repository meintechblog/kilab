import { syncMarketPrices } from "../src/lib/prices/sync";

async function main() {
  const result = await syncMarketPrices({ mode: "all", historyDays: 14, futureDays: 7 });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
