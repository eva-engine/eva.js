const { targets: allTargets } = require('./utils');
const path = require('path');
const execa = require('execa');

function run() {
  for (const target of allTargets) {
    const pkgDir = path.resolve(__dirname, `../packages/${target}`);
    process.chdir(pkgDir);
    execa.sync('pnpm', ['link', '--global']);
    console.log('success -->', pkgDir);
  }
}

run();
