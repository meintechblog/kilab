import { describe, expect, it } from "vitest";
import { getAppConfig } from "./env";

describe("getAppConfig", () => {
  it("reads required database and timezone settings", () => {
    const previous = { ...process.env };

    process.env.DATABASE_URL = "postgresql://kilabwebapp:kilabwebapp@localhost:5432/kilab_webapp";
    process.env.APP_TIMEZONE = "Europe/Berlin";

    expect(getAppConfig()).toMatchObject({
      databaseUrl: process.env.DATABASE_URL,
      appTimezone: "Europe/Berlin",
      appUrl: "http://localhost:3000",
    });

    process.env = previous;
  });
});
