import { describe, expect, it } from "vitest";
import { buildCronEntries, buildRollingSyncWindow, selectSeriesForMode } from "./sync";

describe("price sync helpers", () => {
  it("builds a 7-day rolling sync window in Europe/Berlin", () => {
    expect(
      buildRollingSyncWindow({
        now: new Date("2026-03-07T12:00:00+01:00"),
        historyDays: 7,
        futureDays: 7,
        timezone: "Europe/Berlin",
      }),
    ).toEqual({
      startAt: "2026-02-27T23:00:00.000Z",
      endAt: "2026-03-14T22:59:59.999Z",
    });
  });

  it("returns the expected cron entries for early publication retries", () => {
    expect(buildCronEntries("/root/projects/kilab-webapp")).toEqual([
      "47 10 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=intraday-id3 >> /var/log/kilab-webapp-sync.log 2>&1",
      "58 12 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=day-ahead >> /var/log/kilab-webapp-sync.log 2>&1",
      "3 13 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=day-ahead >> /var/log/kilab-webapp-sync.log 2>&1",
      "10 13 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=day-ahead >> /var/log/kilab-webapp-sync.log 2>&1",
      "47 15 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=intraday-id1 >> /var/log/kilab-webapp-sync.log 2>&1",
      "47 22 * * * cd /root/projects/kilab-webapp && pnpm sync:prices -- --mode=intraday-id2 >> /var/log/kilab-webapp-sync.log 2>&1",
    ]);
  });

  it("maps sync modes to the expected stored series keys", () => {
    expect(selectSeriesForMode("day-ahead")).toEqual(["day_ahead_quarter_hour"]);
    expect(selectSeriesForMode("intraday")).toEqual([
      "intraday_quarter_hour",
      "intraday_auction_id1_quarter_hour",
      "intraday_auction_id2_quarter_hour",
      "intraday_auction_id3_quarter_hour",
    ]);
  });
});
