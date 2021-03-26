import * as fs from "fs";

import { Options, Version } from "./shared-types";

export function readJson({ jsonPath }) {
  let data = {};

  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    data = JSON.parse(raw);
  } catch (error) {
    // File not found? No biggie
  }

  return data;
}

export function getJson(versions: Array<Version>) {
  const data = {};

  versions.forEach(({ tag, electron, chromium, date }) => {
    data[tag] = { electron, chromium, date };
  });

  return JSON.stringify(data, undefined, 2);
}

export function writeJson(versions: Array<Version>, { jsonPath }: Options) {
  fs.writeFileSync(jsonPath, getJson(versions));
}
