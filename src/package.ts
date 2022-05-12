import * as fs from "fs";
import * as path from "path";
import { fileExists } from "./exists";

import { Options } from "./shared-types";

async function getPackage({ cwd }: Options) {
  const expectedPath = path.join(cwd, "package.json");

  if (await fileExists(expectedPath)) {
    const data = await fs.promises.readFile(expectedPath, "utf-8");
    return JSON.parse(data);
  }
}

let repoUrl = null;
export async function getRepoUrl(options: Options) {
  if (repoUrl !== null) {
    return repoUrl;
  }

  const p = await getPackage(options);
  const url = (p && p.repository && p.repository.url) || "";
  const isGitHub = url.indexOf("https://github.com/") > -1;

  // Stop here if we're not on GitHub
  if (!isGitHub) {
    return (repoUrl = undefined);
  }

  let cleanedUrl = url;

  if (cleanedUrl.endsWith(".git")) {
    cleanedUrl = url.slice(0, url.length - 4);
  }

  return (repoUrl = cleanedUrl);
}
