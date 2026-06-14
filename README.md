<h1 align="center">npm-axi</h1>

<p align="center">Search and inspect npm registry packages with token-efficient output — an <a href="https://github.com/kunchenguid/axi">AXI</a> (Agent eXperience Interface).</p>

---

`npm-axi` wraps the public npm registry in an agent-ergonomic CLI. It returns
[TOON](https://toonformat.dev/) output (~40% fewer tokens than JSON), minimal default
schemas, pre-computed aggregates, and structured errors — so an agent can answer "what's the
latest version of X", "is this package maintained", or "how many dependencies does it have" in
a single call. Read-only, no authentication required.

## Install

```sh
npm install -g npm-axi
```

Or run without installing:

```sh
npx -y npm-axi <command>
```

## Usage

The examples below are snapshots of live npm registry output; versions, dates, counts, and
download totals will drift as packages change.

### search

```sh
$ npm-axi search "react state management" --limit 5
count: 5 of 585437 total
packages[5]{name,version,description}:
  unstated-next,1.1.0,200 bytes to never think about React state management libraries ever again
  @risingstack/react-easy-state,6.3.0,React state management with a minimal API. Made with ES6 Proxies.
  constate,4.0.0,Yet another React state management library that lets you work with local state and scale up to globa …
  ...
help[2]:
  Run `npm-axi view <name>` for details
  Run `npm-axi search "react state management" --limit 35` for more results
```

### view

```sh
$ npm-axi view axios
package:
  name: axios
  version: 1.17.0
  license: MIT
  description: Promise based HTTP client for the browser and node.js
  dependencies: 4
  weeklyDownloads: 118010181
  homepage: "https://axios-http.com"
  repository: "https://github.com/axios/axios"
  published: 2026-06-03
  readme: First ~800 chars of the README...
    readmeChars: 54720
help[1]: Run `npm-axi view axios --full` to see complete README
```

When the registry includes README data, pass `--full` to print the complete README.

### versions

```sh
$ npm-axi versions typescript --limit 4
latest: 6.0.3
count: 4 of 3760 total
versions[4]{version,published}:
  6.0.3,2026-04-16
  6.0.0-dev.20260416,2026-04-16
  ...
```

### downloads

```sh
$ npm-axi downloads express
downloads:
  package: express
  lastWeek: 110707678
  lastMonth: 444383062
```

### No arguments

Running `npm-axi` with no arguments prints the tool identity and command hints. Inside a
project, it also lists the dependencies declared in `./package.json` — live context with no
network call.

## Agent integration

`npm-axi` follows the AXI principle of offering an opt-in session integration first, and an
on-demand skill second.

**Session hooks (ambient context):**

```sh
npm-axi setup hooks
```

Installs idempotent `SessionStart` hooks for Claude Code, Codex, and OpenCode so agents see
npm-axi guidance at the start of each session.

**Agent Skill (on-demand):**

```sh
npx skills add SSBrouhard/npm-axi --skill npm-axi
```

You only need one of these — they complement each other when both are installed.

## How it maps to the 10 AXI principles

| # | Principle | In npm-axi |
| --- | --- | --- |
| 1 | Token-efficient output | TOON on stdout via `axi-sdk-js` |
| 2 | Minimal default schemas | `search` returns name, version, description |
| 3 | Content truncation | README preview with `readmeChars` + `--full` |
| 4 | Pre-computed aggregates | total counts, dependency count, weekly downloads |
| 5 | Definitive empty states | `0 packages found for "<query>"` |
| 6 | Structured errors & exit codes | TOON errors; `0`/`1`/`2` exit codes; no prompts |
| 7 | Ambient context | `setup hooks` + installable skill |
| 8 | Content first | no-args lists the local project's dependencies |
| 9 | Contextual disclosure | next-step `help` lines on lists |
| 10 | Consistent help | `npm-axi <command> --help` |

## Development

```sh
npm install
npm test          # vitest, fetch mocked against registry fixtures
npm run build     # tsc -> dist
npm run dev -- search react   # run from source
```

## License

[MIT](LICENSE)
