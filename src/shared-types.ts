export interface Options {
  cwd: string;
  filter: string;
  allowedPrereleases: string[];
  length: number;
  onProgress?: (done: number, left: number, total: number) => void;
  mdPath: string;
  jsonPath: string;
}

export interface TagDetails {
  date: string;
  commit: string;
}

export interface Version extends TagDetails {
  tag: string;
  electron: string;
  chromium: string;
}
