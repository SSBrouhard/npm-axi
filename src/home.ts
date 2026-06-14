import { readFileSync } from "node:fs";
import { join } from "node:path";

const HELP = [
  'Run `npm-axi search "<query>"` to find packages',
  "Run `npm-axi view <pkg>` for package details",
  "Run `npm-axi versions <pkg>` to list recent versions",
  "Run `npm-axi downloads <pkg>` for download stats",
];

const MAX_LISTED_DEPS = 40;

interface LocalProject {
  name: string;
  dependencies: string[];
}

/** Read the current directory's package.json dependencies, if present. */
export function readLocalProject(dir: string = process.cwd()): LocalProject | null {
  let raw: string;
  try {
    raw = readFileSync(join(dir, "package.json"), "utf8");
  } catch {
    return null;
  }

  let parsed: { name?: string; dependencies?: Record<string, string> };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return {
    name: parsed.name ?? "(unnamed)",
    dependencies: Object.keys(parsed.dependencies ?? {}).sort(),
  };
}

export function homeCommand(
  _args: string[] = [],
  _context?: unknown,
  dir: string = process.cwd(),
): Record<string, unknown> {
  const project = readLocalProject(dir);
  if (!project) {
    return { help: HELP };
  }

  const listed = project.dependencies.slice(0, MAX_LISTED_DEPS);
  const help = [...HELP];
  if (project.dependencies.length > listed.length) {
    help.unshift(
      `Showing ${listed.length} of ${project.dependencies.length} dependencies from ./package.json`,
    );
  }

  return {
    project: {
      name: project.name,
      dependencyCount: project.dependencies.length,
      ...(listed.length > 0 ? { dependencies: listed } : {}),
    },
    help,
  };
}
