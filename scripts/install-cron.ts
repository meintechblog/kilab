import { execSync } from "node:child_process";
import { buildCronEntries } from "../src/lib/prices/sync";

const START_MARKER = "# kilab-webapp price sync start";
const END_MARKER = "# kilab-webapp price sync end";
const projectDir = "/root/projects/kilab-webapp";

function readExistingCrontab() {
  try {
    return execSync("crontab -l", { encoding: "utf8" });
  } catch {
    return "";
  }
}

function stripManagedBlock(input: string) {
  const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}\\n?`, "g");
  return input.replace(pattern, "").trim();
}

const cronBlock = [START_MARKER, "CRON_TZ=Europe/Berlin", ...buildCronEntries(projectDir), END_MARKER].join("\n");
const existing = stripManagedBlock(readExistingCrontab());
const nextCrontab = [existing, cronBlock].filter(Boolean).join("\n") + "\n";

execSync("crontab -", { input: nextCrontab, stdio: ["pipe", "inherit", "inherit"] });
console.log(cronBlock);
