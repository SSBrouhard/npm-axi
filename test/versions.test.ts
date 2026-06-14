import { afterEach, describe, expect, it, vi } from "vitest";
import { versionsCommand } from "../src/commands/versions.js";
import { mockFetch } from "./helpers.js";

afterEach(() => vi.unstubAllGlobals());

const doc = {
  name: "typescript",
  "dist-tags": { latest: "5.7.2" },
  time: {
    created: "2012-10-01T00:00:00.000Z",
    "5.7.2": "2024-11-22T00:00:00.000Z",
    "5.7.1": "2024-11-20T00:00:00.000Z",
    "5.6.3": "2024-10-01T00:00:00.000Z",
  },
  versions: { "5.7.2": {}, "5.7.1": {}, "5.6.3": {} },
};

describe("versions", () => {
  it("lists newest-first with latest tag and total count", async () => {
    mockFetch({ "registry.npmjs.org/typescript": { json: doc } });
    const out = await versionsCommand(["typescript"]);
    expect(out.latest).toBe("5.7.2");
    expect(out.count).toBe("3 of 3 total");
    expect(out.versions).toEqual([
      { version: "5.7.2", published: "2024-11-22" },
      { version: "5.7.1", published: "2024-11-20" },
      { version: "5.6.3", published: "2024-10-01" },
    ]);
  });

  it("honors --limit while reporting the true total", async () => {
    mockFetch({ "registry.npmjs.org/typescript": { json: doc } });
    const out = await versionsCommand(["typescript", "--limit", "1"]);
    expect(out.count).toBe("1 of 3 total");
    expect((out.versions as unknown[]).length).toBe(1);
  });

  it("requires a package name", async () => {
    await expect(versionsCommand([])).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
