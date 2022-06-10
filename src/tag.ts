import { spawn } from "@malept/cross-spawn-promise";

import { Options, TagDetails } from "./shared-types";

export async function getTagDetails(
  tag: string,
  { cwd }: Options
): Promise<TagDetails> {
  const result = await spawn(
    "git",
    ["--no-pager", "show", "-s", `--pretty=%as %H`, tag],
    { cwd }
  );

  const data = result.trim().split(" ");
  return {
    date: data[0],
    commit: data[1].slice(0, 7),
  };
}
