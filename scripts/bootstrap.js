/**
 * 初始化package基础配置，在项目最开始使用，已经有package时可以通过 --force 覆盖，慎用。
 *
 * 区别于lerna bootstrap命令，这个命令是用来在已有package后，为所有package安装依赖，应该后于该脚本使用过
 *
 * 创建内容包括：
 *
 * - index.js 统一入口文件
 * - api-extractor.json apiExtractor配置文件
 * - package.json
 * - lib/index.ts 源码入口文件，废弃
 * - Readme.md 文件
 */
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const version = require('../package.json').version;

const packagesDir = path.resolve(__dirname, '../packages');
const files = fs.readdirSync(packagesDir);

files.forEach(shortName => {
  const isDirectory = fs.statSync(path.join(packagesDir, shortName)).isDirectory();
  if (!isDirectory) return;

  const name = shortName.startsWith('eva-') ? `@eva/${shortName.replace('eva-', '')}` : `@eva/${shortName}`;
  const pkgPath = path.join(packagesDir, shortName, `package.json`);
  const pkgExists = fs.existsSync(pkgPath);
  const pkg = require(pkgPath);
  if (pkgExists) {
    if (pkg.private) {
      return;
    }
  }

  if (args.force || !pkgExists) {
    const json = {
      name,
      version,
      description: name,
      main: 'index.js',
      module: `dist/${shortName}.esm.js`,
      bundle: pkg.bundle || '',
      files: [`index.js`, `dist`],
      types: `dist/${shortName}.d.ts`,
      keywords: ['eva.js'],
      author: 'fanmingfei <az8641683@163.com>',
      license: 'MIT',
      homepage: `https://eva.js.org`,
      dependencies: pkg.dependencies || {},
    };
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  }

  const readmePath = path.join(packagesDir, shortName, `README.md`);
  if (args.force || !fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# ${name}`);
  }

  const apiExtractorConfigPath = path.join(packagesDir, shortName, `api-extractor.json`);
  if (args.force || !fs.existsSync(apiExtractorConfigPath)) {
    fs.writeFileSync(
      apiExtractorConfigPath,
      `
{
  "extends": "../../api-extractor.json",
  "mainEntryPointFilePath": "./dist/packages/${shortName}/lib/index.d.ts",
  "dtsRollup": {
    "publicTrimmedFilePath": "./dist/${shortName}.d.ts"
  }
}
`.trim(),
    );
  }

  const nodeIndexPath = path.join(packagesDir, shortName, 'index.js');
  if (args.force || !fs.existsSync(nodeIndexPath)) {
    fs.writeFileSync(
      nodeIndexPath,
      `
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/${shortName}.cjs.prod.js')
} else {
  module.exports = require('./dist/${shortName}.cjs.js')
}
    `.trim() + '\n',
    );
  }
});
