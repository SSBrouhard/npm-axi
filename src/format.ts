/** Collapse all runs of whitespace (including newlines) into single spaces. */
export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Collapse then hard-truncate a single-line value, appending an ellipsis. */
export function truncateLine(text: string, max: number): string {
  const line = collapseWhitespace(text);
  if (line.length <= max) return line;
  return `${line.slice(0, max).trimEnd()} …`;
}

/** Convert an npm `time` ISO timestamp to a YYYY-MM-DD date. */
export function isoDate(timestamp: string | undefined): string | undefined {
  if (!timestamp) return undefined;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

/** npm `license` can be a string or a legacy `{ type }` object. */
export function licenseString(license: unknown): string | undefined {
  if (typeof license === "string") return license;
  if (license && typeof license === "object" && "type" in license) {
    const type = (license as { type?: unknown }).type;
    if (typeof type === "string") return type;
  }
  return undefined;
}

/** npm `repository` can be a string or `{ url }`; normalize to a clean https URL. */
export function normalizeRepo(repository: unknown): string | undefined {
  let url: string | undefined;
  if (typeof repository === "string") {
    url = repository;
  } else if (repository && typeof repository === "object" && "url" in repository) {
    const raw = (repository as { url?: unknown }).url;
    if (typeof raw === "string") url = raw;
  }
  if (!url) return undefined;

  return url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/\.git$/, "");
}
