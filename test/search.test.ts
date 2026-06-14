import { afterEach, describe, expect, it, vi } from "vitest";
import { searchCommand } from "../src/commands/search.js";
import { mockFetch } from "./helpers.js";

afterEach(() => vi.unstubAllGlobals());

const twoResults = {
  total: 1240,
  objects: [
    { package: { name: "react", version: "18.3.1", description: "A JavaScript library for building user interfaces" } },
    { package: { name: "react-dom", version: "18.3.1", description: "React package for working with the DOM" } },
  ],
};

describe("search", () => {
  it("returns a minimal 3-field schema with total count", async () => {
    mockFetch({ "/-/v1/search": { json: twoResults } });
    const out = await searchCommand(["react"]);
    expect(out.count).toBe("2 of 1240 total");
    expect(out.packages).toEqual([
      { name: "react", version: "18.3.1", description: "A JavaScript library for building user interfaces" },
      { name: "react-dom", version: "18.3.1", description: "React package for working with the DOM" },
    ]);
    expect(out.help).toContain("Run `npm-axi view <name>` for details");
  });

  it("suggests a larger limit when more results exist", async () => {
    mockFetch({ "/-/v1/search": { json: twoResults } });
    const out = await searchCommand(["react", "--limit", "2"]);
    expect(out.help).toContain('Run `npm-axi search "react" --limit 32` for more results');
  });

  it("gives a definitive empty state", async () => {
    mockFetch({ "/-/v1/search": { json: { total: 0, objects: [] } } });
    const out = await searchCommand(["zzzznotreal"]);
    expect(out).toEqual({ packages: '0 packages found for "zzzznotreal"' });
  });

  it("requires a query (exit 2 validation error)", async () => {
    await expect(searchCommand([])).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("truncates long descriptions", async () => {
    const long = "x".repeat(200);
    mockFetch({ "/-/v1/search": { json: { total: 1, objects: [{ package: { name: "p", version: "1.0.0", description: long } }] } } });
    const out = await searchCommand(["p"]);
    const desc = (out.packages as Array<{ description: string }>)[0].description;
    expect(desc.length).toBeLessThanOrEqual(102);
    expect(desc.endsWith("…")).toBe(true);
  });
});
