const textTable = require("text-table");
const markdownTable = require("markdown-table");

const { getRepoUrl } = require("./package");

function getTextTable(versions = [], options) {
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

function getMarkdownTable(versions = [], options) {
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

module.exports = {
  getTextTable,
  getMarkdownTable,
};
