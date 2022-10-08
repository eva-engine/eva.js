/**
 * 初始化package基础配置，可以自行在packages目录下创建新项目目录，或者用--package命令指定项目名。
 * 已有项目可以通过 --force 覆盖，慎用。
 *
 * 创建内容包括：
 *
 * - index.js 统一入口文件
 * - api-extractor.json apiExtractor配置文件
 * - package.json
 * - README.md 文件
 */
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const gitUser = require('./git-user');
const version = require('../package.json').version;
const packagesDir = path.resolve(__dirname, '../packages');

let files;

if (!args.package) {
  files = fs.readdirSync(packagesDir);
} else {
  files = [args.package];
}

files.forEach(shortName => {
  const pkgRootDir = path.join(packagesDir, shortName);
  if (!fs.existsSync(pkgRootDir)) {
    fs.mkdirSync(pkgRootDir);
  } else {
    const stat = fs.statSync(pkgRootDir);
    if (!stat.isDirectory()) {
      return;
    }
  }

  const name = `@eva/${shortName}`;
  const pkgPath = path.join(packagesDir, shortName, 'package.json');
  const pkgExists = fs.existsSync(pkgPath);
  let pkg = {};
  if (pkgExists) {
    pkg = require(pkgPath);
    if (pkg.private) {
      return;
    }
  }

  if (args.force || !pkgExists) {
    const bundle = pkg.bundle ?? `EVA.${shortName.replace(/-/g, '.')}`;
    const pluginRendererDep = shortName.startsWith('plugin-renderer-') ? {
      "@eva/plugin-renderer": version,
      "pixi.js": "^4.8.9"
    } : {}
    const dependencies = {
      "@eva/inspector-decorator": "^0.0.5",
      "@eva/eva.js": version,
      ...pluginRendererDep,
      ...(pkg.dependencies ?? {})
    };
    const author = gitUser();
    const json = {
      name,
      version,
      description: name,
      main: 'index.js',
      module: `dist/${shortName}.esm.js`,
      bundle,
      unpkg: `dist/${bundle}.min.js`,
      files: ['index.js', 'dist'],
      types: `dist/${shortName}.d.ts`,
      keywords: ['eva.js', `eva-${shortName}`],
      author: author ? `${author.name} <${author.email}>` : 'yourself',
      license: 'MIT',
      homepage: 'https://eva.js.org',
      dependencies,
    };
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  }

  const readmePath = path.join(packagesDir, shortName, 'README.md');
  if (args.force || !fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      `
# ${name}

More Introduction
- [EN](https://eva.js.org)
- [中文](https://eva-engine.gitee.io)
    `,
    );
  }

  const apiExtractorConfigPath = path.join(packagesDir, shortName, 'api-extractor.json');
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
