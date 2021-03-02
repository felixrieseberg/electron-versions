const textTable = require("text-table");
const markdownTable = require("markdown-table");

function getTextTable(versions = []) {
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

function getMarkdownTable(versions = []) {
  const rows = [["Tag", "Electron", "Chromium"]];

  for (const { tag, electron, chromium } of versions) {
    rows.push([tag, electron || "?", chromium || "?"]);
  }

  return markdownTable(rows);
}

module.exports = {
  getTextTable,
  getMarkdownTable,
};
