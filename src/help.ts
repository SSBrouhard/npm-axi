export const TOP_LEVEL_HELP = `npm-axi — search and inspect npm registry packages

Usage: npm-axi <command> [args] [flags]

Commands:
  search "<query>" [--limit 20]   Find packages (name, version, description)
  view <pkg> [--full]             Package details: version, deps, downloads, README
  versions <pkg> [--limit 15]     Recent versions with publish dates
  downloads <pkg>                 Weekly and monthly download counts
  setup hooks                     Install agent session-start hooks (ambient context)

Run with no arguments to see command hints and the current project's dependencies.
Run \`npm-axi <command> --help\` for per-command details.
`;

export const COMMAND_HELP: Record<string, string> = {
  search: `npm-axi search "<query>" [--limit 20]

Search the npm registry. Output is a token-efficient list of name, version, and
a truncated description, plus the total match count.

Flags:
  --limit <n>   Max results (default 20, max 250)

Examples:
  npm-axi search "react router"
  npm-axi search graphql --limit 50
`,
  view: `npm-axi view <pkg> [--full]

Show package details: latest version, license, description, dependency count, weekly
downloads, homepage, repository, publish date, and a truncated README.

Flags:
  --full   Print the complete README instead of a preview

Examples:
  npm-axi view react
  npm-axi view zod --full
`,
  versions: `npm-axi versions <pkg> [--limit 15]

List a package's most recent versions (newest first) with publish dates, plus the
latest dist-tag and total version count.

Flags:
  --limit <n>   Max versions shown (default 15, max 100)

Examples:
  npm-axi versions typescript
  npm-axi versions vite --limit 30
`,
  downloads: `npm-axi downloads <pkg>

Show last-week and last-month download counts for a package.

Examples:
  npm-axi downloads express
`,
  setup: `npm-axi setup hooks

Install or repair session-start hooks so agents see npm-axi guidance at the start of
each session. Supports Claude Code, Codex, and OpenCode. Idempotent.

Examples:
  npm-axi setup hooks
`,
};
