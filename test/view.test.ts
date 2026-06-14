import { afterEach, describe, expect, it, vi } from "vitest";
import { viewCommand } from "../src/commands/view.js";
import { mockFetch } from "./helpers.js";

afterEach(() => vi.unstubAllGlobals());

function packument(readme: string) {
  return {
    name: "react",
    "dist-tags": { latest: "18.3.1" },
    time: { "18.3.1": "2024-04-25T17:09:33.000Z" },
    versions: {
      "18.3.1": {
        description: "React is a JavaScript library for building user interfaces.",
        license: "MIT",
        repository: { url: "git+https://github.com/facebook/react.git" },
        dependencies: { "loose-envify": "^1.1.0" },
      },
    },
    readme,
  };
}

describe("view", () => {
  it("returns aggregates: deps count and weekly downloads", async () => {
    mockFetch({
      "registry.npmjs.org/react": { json: packument("short readme") },
      "/downloads/point/last-week/react": { json: { downloads: 28500000 } },
    });
    const out = await viewCommand(["react"]);
    const pkg = out.package as Record<string, unknown>;
    expect(pkg.version).toBe("18.3.1");
    expect(pkg.license).toBe("MIT");
    expect(pkg.dependencies).toBe(1);
    expect(pkg.weeklyDownloads).toBe(28500000);
    expect(pkg.repository).toBe("https://github.com/facebook/react");
    expect(pkg.published).toBe("2024-04-25");
    expect(pkg.readme).toBe("short readme");
    expect(out.help).toBeUndefined();
  });

  it("truncates a long README and offers --full", async () => {
    const long = "word ".repeat(400); // ~2000 chars
    mockFetch({
      "registry.npmjs.org/react": { json: packument(long) },
      "/downloads/point/last-week/react": { json: { downloads: 1 } },
    });
    const out = await viewCommand(["react"]);
    const pkg = out.package as Record<string, unknown>;
    expect((pkg.readme as string).endsWith("…")).toBe(true);
    expect(pkg.readmeChars).toBeGreaterThan(800);
    expect(out.help).toEqual(["Run `npm-axi view react --full` to see complete README"]);
  });

  it("returns the full README with --full and no truncation hint", async () => {
    const long = "word ".repeat(400);
    mockFetch({
      "registry.npmjs.org/react": { json: packument(long) },
      "/downloads/point/last-week/react": { json: { downloads: 1 } },
    });
    const out = await viewCommand(["react", "--full"]);
    const pkg = out.package as Record<string, unknown>;
    expect(pkg.readmeChars).toBeUndefined();
    expect(out.help).toBeUndefined();
  });

  it("handles --full placed before the package name", async () => {
    mockFetch({
      "registry.npmjs.org/react": { json: packument("some readme") },
      "/downloads/point/last-week/react": { json: { downloads: 1 } },
    });
    const out = await viewCommand(["--full", "react"]);
    const pkg = out.package as Record<string, unknown>;
    expect(pkg.readme).toBe("some readme");
    expect(pkg.readmeChars).toBeUndefined();
    expect(out.help).toBeUndefined();
  });

  it("correctly encodes scoped package names in URLs", async () => {
    mockFetch({
      "/@babel%2Fcore": { json: packument("short readme") },
      "/last-week/@babel%2Fcore": { json: { downloads: 500 } },
    });
    const out = await viewCommand(["@babel/core"]);
    expect((out.package as Record<string, unknown>).version).toBe("18.3.1");
  });

  it("translates a 404 into a NOT_FOUND error", async () => {
    mockFetch({ "registry.npmjs.org/nope": { status: 404 } });
    await expect(viewCommand(["nope"])).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("requires a package name", async () => {
    await expect(viewCommand([])).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
