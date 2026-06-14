import { AxiError } from "axi-sdk-js";
import { parseFlags } from "../args.js";
import {
  collapseWhitespace,
  isoDate,
  licenseString,
  normalizeRepo,
} from "../format.js";
import { fetchDownloadsPoint, fetchPackument } from "../registry.js";

const README_PREVIEW = 800;
const NO_README = "ERROR: No README data found!";

export async function viewCommand(args: string[]): Promise<Record<string, unknown>> {
  const { positionals, flags } = parseFlags(args, ["full"]);
  const pkg = positionals[0];
  if (!pkg) {
    throw new AxiError("a package name is required", "VALIDATION_ERROR", [
      "npm-axi view <pkg> [--full]",
    ]);
  }

  const full = flags.full === true;
  const doc = await fetchPackument(pkg);
  const latest = doc["dist-tags"]?.latest;
  const manifest = (latest && doc.versions?.[latest]) || {};

  const license = licenseString(manifest.license ?? doc.license);
  const description = manifest.description ?? doc.description;
  const repository = normalizeRepo(manifest.repository ?? doc.repository);
  const homepage = manifest.homepage ?? doc.homepage;
  const published = isoDate(latest ? doc.time?.[latest] : undefined);
  const dependencies = manifest.dependencies
    ? Object.keys(manifest.dependencies).length
    : 0;
  const weekly = await fetchDownloadsPoint(pkg, "last-week");

  const pkgOut: Record<string, unknown> = {
    name: doc.name ?? pkg,
    version: latest ?? "unknown",
  };
  if (license) pkgOut.license = license;
  if (description) pkgOut.description = collapseWhitespace(description);
  pkgOut.dependencies = dependencies;
  if (weekly != null) pkgOut.weeklyDownloads = weekly;
  if (homepage) pkgOut.homepage = homepage;
  if (repository) pkgOut.repository = repository;
  if (published) pkgOut.published = published;

  const readme = doc.readme && doc.readme.trim() !== NO_README ? doc.readme : "";
  let truncated = false;
  if (readme) {
    if (full) {
      pkgOut.readme = readme.trim();
    } else {
      const collapsed = collapseWhitespace(readme);
      if (collapsed.length > README_PREVIEW) {
        pkgOut.readme = `${collapsed.slice(0, README_PREVIEW).trimEnd()} …`;
        pkgOut.readmeChars = collapsed.length;
        truncated = true;
      } else {
        pkgOut.readme = collapsed;
      }
    }
  }

  const out: Record<string, unknown> = { package: pkgOut };
  if (truncated) {
    out.help = [`Run \`npm-axi view ${pkg} --full\` to see complete README`];
  }
  return out;
}
