import { execSync } from "child_process";

import { Options } from "./shared-types";

export function getTagDate(tag: string, { cwd }: Options): string {
  const cmd = `git --no-pager show -s --pretty="format:%as" ${tag}`;
  const result = execSync(cmd, { cwd }).toString().trim();

  return result;
}
