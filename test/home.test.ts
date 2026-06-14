import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { homeCommand } from "../src/home.js";

function tempProject(pkg: Record<string, unknown> | null): string {
  const dir = mkdtempSync(join(tmpdir(), "npm-axi-"));
  if (pkg) writeFileSync(join(dir, "package.json"), JSON.stringify(pkg));
  return dir;
}

describe("home", () => {
  it("shows only command hints with no local project", () => {
    const out = homeCommand([], undefined, tempProject(null));
    expect(out.project).toBeUndefined();
    expect((out.help as string[])[0]).toContain("npm-axi search");
  });

  it("lists declared dependencies when package.json is present (content-first)", () => {
    const dir = tempProject({ name: "my-app", dependencies: { react: "^18", zod: "^3" } });
    const out = homeCommand([], undefined, dir);
    const project = out.project as Record<string, unknown>;
    expect(project.name).toBe("my-app");
    expect(project.dependencyCount).toBe(2);
    expect(project.dependencies).toEqual(["react", "zod"]);
  });
});
