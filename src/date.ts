import { spawn } from "@malept/cross-spawn-promise";

import { Options } from "./shared-types";

export async function getTagDate(tag: string, { cwd }: Options): Promise<string> {
  const result = await spawn('git', ['--no-pager', 'show', '-s', '--pretty=%as', tag], { cwd });

  return result.trim();
}
