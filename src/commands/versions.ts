import { AxiError } from "axi-sdk-js";
import { parseFlags, parseLimit } from "../args.js";
import { isoDate } from "../format.js";
import { fetchPackument } from "../registry.js";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 100;

export async function versionsCommand(args: string[]): Promise<Record<string, unknown>> {
  const { positionals, flags } = parseFlags(args);
  const pkg = positionals[0];
  if (!pkg) {
    throw new AxiError("a package name is required", "VALIDATION_ERROR", [
      "npm-axi versions <pkg> [--limit 15]",
    ]);
  }

  const limit = parseLimit(flags.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const doc = await fetchPackument(pkg);
  const time = doc.time ?? {};
  const latest = doc["dist-tags"]?.latest;

  const sorted = Object.keys(doc.versions ?? {})
    .filter((version) => time[version])
    .sort((a, b) => new Date(time[b]).getTime() - new Date(time[a]).getTime());

  const versions = sorted.slice(0, limit).map((version) => ({
    version,
    published: isoDate(time[version]),
  }));

  const out: Record<string, unknown> = {};
  if (latest) out.latest = latest;
  out.count = `${versions.length} of ${sorted.length} total`;
  out.versions = versions;
  return out;
}
