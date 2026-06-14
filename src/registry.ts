import { AxiError } from "axi-sdk-js";

const REGISTRY = "https://registry.npmjs.org";
const DOWNLOADS = "https://api.npmjs.org/downloads";

export interface SearchObject {
  package: {
    name: string;
    version: string;
    description?: string;
  };
}

export interface SearchResult {
  total: number;
  objects: SearchObject[];
}

export interface Packument {
  name?: string;
  description?: string;
  license?: unknown;
  homepage?: string;
  repository?: unknown;
  readme?: string;
  "dist-tags"?: Record<string, string>;
  versions?: Record<string, PackageManifest>;
  time?: Record<string, string>;
}

export interface PackageManifest {
  description?: string;
  license?: unknown;
  homepage?: string;
  repository?: unknown;
  dependencies?: Record<string, string>;
}

function notFound(pkg: string, what: string): AxiError {
  return new AxiError(`${what} "${pkg}" not found in the npm registry`, "NOT_FOUND", [
    `Run \`npm-axi search "${pkg}"\` to find similar packages`,
  ]);
}

async function getJson(url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch {
    throw new AxiError("could not reach the npm registry", "NETWORK", [
      "Check your network connection and try again",
    ]);
  }
  if (!response.ok) {
    // Signal 404 distinctly so callers can translate it into a NOT_FOUND.
    const error = new Error(`HTTP ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/** Search the registry. Returns total match count plus this page of results. */
export async function searchPackages(query: string, limit: number): Promise<SearchResult> {
  const url = `${REGISTRY}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`;
  const data = (await getJson(url)) as { total?: number; objects?: SearchObject[] };
  return { total: data.total ?? 0, objects: data.objects ?? [] };
}

/** Fetch the full packument for a package, translating 404 into a NOT_FOUND AxiError. */
export async function fetchPackument(pkg: string): Promise<Packument> {
  try {
    return (await getJson(`${REGISTRY}/${encodeURIComponent(pkg)}`)) as Packument;
  } catch (error) {
    if (error instanceof AxiError) throw error;
    if ((error as { status?: number }).status === 404) throw notFound(pkg, "package");
    throw new AxiError("the npm registry returned an unexpected error", "REGISTRY", [
      "Try again in a moment",
    ]);
  }
}

/**
 * Fetch a download-count point (e.g. "last-week"). Returns null when the package
 * has no stats yet, so callers can decide whether absence is an error.
 */
export async function fetchDownloadsPoint(
  pkg: string,
  period: "last-week" | "last-month",
): Promise<number | null> {
  try {
    const data = (await getJson(`${DOWNLOADS}/point/${period}/${encodeURIComponent(pkg)}`)) as {
      downloads?: number;
    };
    return typeof data.downloads === "number" ? data.downloads : null;
  } catch (error) {
    if (error instanceof AxiError) throw error;
    if ((error as { status?: number }).status === 404) return null;
    throw new AxiError("the npm registry returned an unexpected error", "REGISTRY", [
      "Try again in a moment",
    ]);
  }
}
