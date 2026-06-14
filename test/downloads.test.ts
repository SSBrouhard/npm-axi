import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadsCommand } from "../src/commands/downloads.js";
import { mockFetch } from "./helpers.js";

afterEach(() => vi.unstubAllGlobals());

describe("downloads", () => {
  it("returns weekly and monthly aggregates", async () => {
    mockFetch({
      "/downloads/point/last-week/express": { json: { downloads: 30000000 } },
      "/downloads/point/last-month/express": { json: { downloads: 120000000 } },
    });
    const out = await downloadsCommand(["express"]);
    expect(out).toEqual({
      downloads: { package: "express", lastWeek: 30000000, lastMonth: 120000000 },
    });
  });

  it("errors when a package has no stats at all", async () => {
    mockFetch({
      "/downloads/point/last-week/ghost": { status: 404 },
      "/downloads/point/last-month/ghost": { status: 404 },
    });
    await expect(downloadsCommand(["ghost"])).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("requires a package name", async () => {
    await expect(downloadsCommand([])).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
