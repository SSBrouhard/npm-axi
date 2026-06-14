import { AxiError } from "axi-sdk-js";
import { parseFlags } from "../args.js";
import { fetchDownloadsPoint } from "../registry.js";

export async function downloadsCommand(args: string[]): Promise<Record<string, unknown>> {
  const { positionals } = parseFlags(args);
  const pkg = positionals[0];
  if (!pkg) {
    throw new AxiError("a package name is required", "VALIDATION_ERROR", [
      "npm-axi downloads <pkg>",
    ]);
  }

  const [lastWeek, lastMonth] = await Promise.all([
    fetchDownloadsPoint(pkg, "last-week"),
    fetchDownloadsPoint(pkg, "last-month"),
  ]);

  if (lastWeek == null && lastMonth == null) {
    throw new AxiError(`no download stats found for "${pkg}"`, "NOT_FOUND", [
      `Run \`npm-axi search "${pkg}"\` to find the package`,
    ]);
  }

  return {
    downloads: {
      package: pkg,
      lastWeek: lastWeek ?? 0,
      lastMonth: lastMonth ?? 0,
    },
  };
}
