import { syncMarketPrices } from "../src/lib/prices/sync";
import type { SyncMode } from "../src/lib/prices/types";

function readMode(): SyncMode {
  const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
  return (modeArg?.split("=")[1] as SyncMode | undefined) ?? "all";
}

async function main() {
  const result = await syncMarketPrices({ mode: readMode() });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
