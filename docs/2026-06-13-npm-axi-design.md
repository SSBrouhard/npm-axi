# npm-axi — Design

**Date:** 2026-06-13
**Author:** SSBrouhard

## Summary

`npm-axi` is an [AXI](https://github.com/kunchenguid/axi) (Agent eXperience Interface): an
agent-native CLI that searches and inspects the public npm registry with token-efficient
output. Read-only, zero auth (the registry is public). Built on `axi-sdk-js`, which provides
TOON serialization, command dispatch, structured errors, and session-hook installation.

## Architecture

```
src/bin/npm-axi.ts   runAxiCli() config: dispatch, home, help, setup
src/registry.ts      Network boundary — search, packument, downloads fetch helpers
src/commands/        Pure transforms returning plain JS objects (TOON-encoded by the SDK)
  search.ts
  view.ts
  versions.ts
  downloads.ts
src/home.ts          No-args home view (reads ./package.json if present)
src/help.ts          Top-level + per-command help text
src/args.ts          Flag parser (parseFlags, parseLimit)
src/format.ts        Output helpers (collapseWhitespace, truncateLine, isoDate, licenseString, normalizeRepo)
test/                vitest, global fetch mocked against captured registry fixtures
.agents/skills/npm-axi/SKILL.md   Installable skill (npx skills add)
```

All network access is isolated in `registry.ts`; command modules are pure and unit-testable.

## Commands & principle mapping

| Command | Source | Principles |
| --- | --- | --- |
| `search "<q>" [--limit 20]` | `GET /-/v1/search` | P2 minimal 3-field schema, P4 total count, P5 empty state, P9 next-steps |
| `view <pkg> [--full]` | packument + last-week downloads | P3 README truncation + size hint + `--full`, P4 deps count & weekly downloads |
| `versions <pkg> [--limit 15]` | packument `versions`/`time` | P2, P4 `latest` + total count |
| `downloads <pkg>` | last-week + last-month points | P4 aggregates, self-contained (no P9 suggestions) |
| `setup hooks` | `installSessionStartHooks()` | P7 ambient context |

**Home view (no args):** SDK injects `bin:` + `description:`; handler appends the 4 command
hints. If `./package.json` exists, also lists declared dependencies (cheap, no network) so the
run shows live content (P8).

## Endpoints

- Search: `https://registry.npmjs.org/-/v1/search?text=<q>&size=<limit>` → `{ total, objects[].package }`
- Packument: `https://registry.npmjs.org/<pkg>` → `dist-tags`, `versions`, `time`, `readme`, root `description`/`license`/`repository`/`homepage`
- Downloads point: `https://api.npmjs.org/downloads/point/last-week|last-month/<pkg>` → `{ downloads }`

## Output rules

- **Empty (P5):** `packages: 0 packages found for "<q>"`, exit 0.
- **Errors (P6):** missing arg → `AxiError(..., "VALIDATION_ERROR")` → exit 2. Unknown package
  (404) → `AxiError('package "<name>" not found in the npm registry', "NOT_FOUND", [search suggestion])`
  → exit 1. Malformed JSON from the registry → `AxiError(..., "REGISTRY")`. Raw HTTP/fetch text
  never reaches stdout.
- **Truncation (P3):** README preview ~800 chars, whitespace-collapsed, with `readmeChars`
  total and a `--full` help hint when truncated.

## Testing

TDD with vitest. Mock global `fetch` against fixtures captured from real registry responses.
Cover: search transform + total + empty state + MAX_LIMIT hint suppression, view aggregates +
truncation + `--full` order-independence + scoped package URL encoding, versions ordering +
total, downloads aggregates, error mapping (missing arg, 404, malformed JSON → REGISTRY).

## Submission

Repo: `github.com/SSBrouhard/npm-axi`. Then a PR to `kunchenguid/axi` adding one row to the
Community catalog table. npm publish optional (the catalog links a GitHub repo).
