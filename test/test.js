const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const expected = `Tag master  Electron 10.1.0  Chromium 85.0.4183.87
Tag v2.0.0  Electron 10.1.0  Chromium 85.0.4183.87
Tag v1.1.0  Electron 9.0.5   Chromium 83.0.4103.119
Tag v1.0.0  Electron 9.0.0   Chromium 83.0.4103.64`.trim();

const script = path.join(__dirname, '../built/bin.js');
const harness = path.join(__dirname, 'harness');

function prep() {
  const and = process.platform === 'win32' ? ';' : '&&'

  // Unzip
  if (!fs.existsSync(harness)) {
    execSync(`cd ${__dirname} ${and} unzip ${harness}.zip`)
  }

  // Checkout master
  execSync(`cd ${harness} ${and} git checkout master`);
}

function test() {
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

prep();
test();
