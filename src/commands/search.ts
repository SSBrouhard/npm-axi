import { AxiError } from "axi-sdk-js";
import { parseFlags, parseLimit } from "../args.js";
import { truncateLine } from "../format.js";
import { searchPackages } from "../registry.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 250;

export async function searchCommand(args: string[]): Promise<Record<string, unknown>> {
  const { positionals, flags } = parseFlags(args);
  const query = positionals.join(" ").trim();
  if (!query) {
    throw new AxiError("a search query is required", "VALIDATION_ERROR", [
      'npm-axi search "<query>" [--limit 20]',
    ]);
  }

  const limit = parseLimit(flags.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const { total, objects } = await searchPackages(query, limit);

  if (objects.length === 0) {
    return { packages: `0 packages found for "${query}"` };
  }

  const packages = objects.map((object) => ({
    name: object.package.name,
    version: object.package.version,
    description: truncateLine(object.package.description ?? "", 100),
  }));

  const help = ["Run `npm-axi view <name>` for details"];
  if (total > packages.length) {
    const more = Math.min(limit + 30, MAX_LIMIT);
    help.push(`Run \`npm-axi search "${query}" --limit ${more}\` for more results`);
  }

  return {
    count: `${packages.length} of ${total} total`,
    packages,
    help,
  };
}
