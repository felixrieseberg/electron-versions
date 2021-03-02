import * as fs from "fs";

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

export function writeJson(versions, { jsonPath }) {}
