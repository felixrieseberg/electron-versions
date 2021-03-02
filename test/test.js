const { execSync } = require('child_process');
const path = require('path');

const expected = `Tag v2.0.0  Electron 10.1.0  Chromium 85.0.4183.87
Tag v1.1.0  Electron 9.0.5   Chromium 83.0.4103.119
Tag v1.0.0  Electron 9.0.0   Chromium 83.0.4103.64`.trim();

function test() {
  const script = path.join(__dirname, '../src/bin.js');
  const harness = path.join(__dirname, 'harness');
  const result = execSync(`node ${script} ${harness}`).toString().trim();

  if (result === expected) {
    console.log(`✅ Tests passed`);
  } else {
    console.log(`🛑 Tests failed`);
    console.log(`Expected:`);
    console.log(expected);
    console.log();
    console.log(`Received:`);
    console.log(result);
    process.exitCode = -1;
  }
}

test();
