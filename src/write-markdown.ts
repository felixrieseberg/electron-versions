import * as fs from "fs";
import { fileExists } from "./exists";

import { Options, Version } from "./shared-types";
import { getMarkdownTable } from "./table";

const START_TABLE = "<!--- Begin Electron Version Table --->";
const END_TABLE = "<!--- End Electron Version Table --->";

export async function writeMarkdown(versions: Array<Version> = [], options: Options) {
  if (!versions || versions.length === 0) {
    return;
  }

  const markdown = await getMarkdownTable(versions, options);
  const table = `${START_TABLE}\n${markdown}\n${END_TABLE}`;

  // Check if we already have a file
  const exists = await fileExists(options.mdPath);
  let content = "";

  if (exists) {
    content = await fs.promises.readFile(options.mdPath, "utf-8");

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

  await fs.promises.writeFile(options.mdPath, content);
}
