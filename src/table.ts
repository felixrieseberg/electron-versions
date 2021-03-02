import * as textTable from "text-table";
import * as markdownTable from "markdown-table";

import { getRepoUrl } from "./package";
import { Options, Version } from "./shared-types";

export function getTextTable(versions: Array<Version> = []) {
  const rows = [];

  for (const { tag, electron, chromium } of versions) {
    rows.push([
      `Tag ${tag}`,
      `Electron ${electron || "?"}`,
      `Chromium ${chromium || "?"}`,
    ]);
  }

  return textTable(rows);
}

export function getMarkdownTable(
  versions: Array<Version> = [],
  options: Options
) {
  const rows = [["Tag", "Electron", "Chromium"]];
  const repoUrl = getRepoUrl(options);

  for (let i = 0; i < versions.length; i++) {
    let { tag, electron, chromium } = versions[i];

    if (repoUrl) {
      // First entry will be the default branch, not a tag
      if (i === 0) {
        tag = `[${tag}](${repoUrl})`;
      } else {
        tag = `[${tag}](${repoUrl}/releases/tag/${tag})`;
      }
    }

    electron = `[${electron}](https://github.com/electron/electron/releases/tag/v${electron})`;

    rows.push([tag, electron || "?", chromium || "?"]);
  }

  return markdownTable(rows);
}
