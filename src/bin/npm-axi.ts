#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AxiError, installSessionStartHooks, runAxiCli } from "axi-sdk-js";
import { downloadsCommand } from "../commands/downloads.js";
import { searchCommand } from "../commands/search.js";
import { versionsCommand } from "../commands/versions.js";
import { viewCommand } from "../commands/view.js";
import { COMMAND_HELP, TOP_LEVEL_HELP } from "../help.js";
import { homeCommand } from "../home.js";

function readVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8"));
    return typeof pkg.version === "string" ? pkg.version : "0.0.0";
  } catch {
    return "0.0.0";
  }
}

await runAxiCli({
  description: "Search and inspect npm registry packages",
  version: readVersion(),
  topLevelHelp: TOP_LEVEL_HELP,
  getCommandHelp: (command) => COMMAND_HELP[command] ?? null,
  home: (args) => homeCommand(args),
  commands: {
    search: (args) => searchCommand(args),
    view: (args) => viewCommand(args),
    versions: (args) => versionsCommand(args),
    downloads: (args) => downloadsCommand(args),
    setup: async (args) => {
      if (args[0] !== "hooks") {
        throw new AxiError("unknown setup command", "VALIDATION_ERROR", [
          "Run `npm-axi setup hooks`",
        ]);
      }
      installSessionStartHooks({ marker: "npm-axi", binaryNames: ["npm-axi"] });
      return { setup: "hooks installed or already up to date" };
    },
  },
});
