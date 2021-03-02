# electron-versions

Check a repository for tags and list the Electron & Chromium versions referenced in the `package.json` files of those tags.

```sh
🍄  ➜  ~/Desktop  electron-versions ~/Code/slack-desktop -f="<9.0.0"
Tag 4.10.0  Electron 10.1.2         Chromium 85.0.4183.98
Tag 4.9.1   Electron 10.1.1         Chromium 85.0.4183.93
Tag 4.9.0   Electron 10.1.0         Chromium 85.0.4183.87
Tag 4.8.0   Electron 9.0.5          Chromium 83.0.4103.119
Tag 4.7.0   Electron 9.0.5          Chromium 83.0.4103.119
Tag 4.6.0   Electron 8.2.5          Chromium 80.0.3987.165
Tag 4.5.1   Electron 8.2.5          Chromium 80.0.3987.165
Tag 4.5.0   Electron 8.2.2          Chromium 80.0.3987.163
Tag 4.4.9   Electron 9.0.0-beta.24  Chromium 83.0.4103.45
Tag 4.4.3   Electron 7.2.4          Chromium 78.0.3904.130
```

## Usage
 * `-f | --filter`: A semver-range used to filter the tags tested
 * `-l | --length`: How many tags to check (default: 10)
 * `--write-markdown`: Write the results to a markdown file
 * `--write-json`: Write the results to a json file (will speed up future runs)
 * `--json`: Print the result as JSON

## Usage as a module
This module is synchronous. It could be async, but since using this
anywhere outside of cli tools seems silly, I didn't bother implementing
an async version.

```js
const { getVersions } = require('electron-versions')

const options = {
  cwd: '/path/to/the/repo',
  filter: '>4.0.0',         // Undefined for no filter
  length: 10                // Undefined for no limit
  onProgress: (done, left, total) => {}
}

const versions = getVersions(options);
```

## License
MIT