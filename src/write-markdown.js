const fs = require("fs");

const { getMarkdownTable } = require("./table");

const START_TABLE = "<!--- Begin Electron Version Table --->";
const END_TABLE = "<!--- End Electron Version Table --->";

function writeMarkdown(versions, { filePath }) {
  if (!versions || versions.length === 0) {
    return;
  }

  const markdown = getMarkdownTable(versions);
  const table = `${START_TABLE}\n${markdown}\n${END_TABLE}`;

  // Check if we already have a file
  const exists = fs.existsSync(filePath);
  let content = "";

  if (exists) {
    content = fs.readFileSync(filePath, "utf-8");

    const start = content.indexOf(START_TABLE);
    const end = content.indexOf(END_TABLE) + END_TABLE.length;

    // If we already have a table, replace it
    // If we don't, add one
    if (start >= 0 && end) {
      content = `${content.slice(0, start)}${table}${content.slice(end)}`;
    } else {
      content += `\n${table}`;
    }
  } else {
    content = table;
  }

  fs.writeFileSync(filePath, content);
}

module.exports = {
  writeMarkdown,
};
