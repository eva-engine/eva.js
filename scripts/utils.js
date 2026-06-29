const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 过滤文件夹，不进行编译
const excludes = ['plugin-renderer-test'];

// 锚定到 scripts 所在目录,而不是相对 cwd。
// npm publish 在 packages/<pkg>/ 里 spawn `prepublishOnly: build:prod`,
// 子进程 cwd 就在 package 目录里,如果用 'packages' 相对路径会 ENOENT。
const PACKAGES_ROOT = path.resolve(__dirname, '../packages');

const targets = (exports.targets = fs.readdirSync(PACKAGES_ROOT).filter(f => {
  if (!fs.statSync(path.join(PACKAGES_ROOT, f)).isDirectory()) {
    return false;
  }
  if (excludes.indexOf(f) > -1) {
    return false;
  }
  const pkg = require(path.join(PACKAGES_ROOT, f, 'package.json'));
  if (pkg.private && !pkg.buildOptions) {
    return false;
  }
  return true;
}));

exports.fuzzyMatchTarget = (partialTargets, includeAllMatching) => {
  const matched = [];
  partialTargets.forEach(partialTarget => {
    for (const target of targets) {
      if (target.match(partialTarget)) {
        matched.push(target);
        if (!includeAllMatching) {
          break;
        }
      }
    }
  });
  if (matched.length) {
    return matched;
  } else {
    console.log();
    console.error(`  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`Target ${chalk.underline(partialTargets)} not found!`)}`);
    console.log();

    process.exit(1);
  }
};
