/*
为开发和生产环境构建，并将d.ts文件整合

USAGE:

$tnpm run build eva.js 构建一个package
$tnpm run build eva.js plugin-renderer 构建多个 package
$tnpm run build 构建全部package

--all -a      根据模糊匹配构建多个 $tnpm run build plugin-renderer -- --all`，会构建包含`plugin-renderer`的所有package
--devOnly -d  为开发环境构建      $tnpm run build -- --devOnly
--prodOnly -p 为生产环境构建      $tnpm run build -- --prodOnly
--formats -f  指定构建格式       $tnpm run build -- --formats ejs-umd-esm
--types -t    生成d.ts             $tnpm run build -- --types
--sourcemap -s 生成sourceMap    $tnpm run build -- --sourcemap

常用命令

生产环境构建eva.js的cjs和umd包，$tnpm run build eva.js -- -f cjs-umd -p

开发环境构建所有plugin，$tnpm run build plugin -- -ad
*/

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { gzipSync } = require('zlib');
const { compress } = require('brotli');
const { targets: allTargets, fuzzyMatchTarget } = require('./utils');

const args = require('minimist')(process.argv.slice(2));
const targets = args._;
const formats = args.formats || args.f;
const devOnly = args.devOnly || args.d;
const prodOnly = !devOnly && (args.prodOnly || args.p);
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;
const buildAllMatching = args.all || args.a;
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7);

run();

async function run() {
  if (isRelease) {
    // remove build cache for release builds to avoid outdated enum values
    await fs.remove(path.resolve(__dirname, '../node_modules/.rts2_cache'));
  }
  if (!targets.length) {
    await buildAll(allTargets);
    checkAllSizes(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching));
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching));
  }
}

async function buildAll(targets) {
  for (const target of targets) {
    await build(target);
  }
}

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  // only build published packages for release
  if (isRelease && pkg.private) {
    return;
  }

  // if building a specific format, do not remove dist.
  if (!formats) {
    await fs.remove(`${pkgDir}/dist`);
  }

  const env = (pkg.buildOptions && pkg.buildOptions.env) || (devOnly ? 'development' : 'production');

  try {
    await execa(
      'rollup',
      [
        '-c',
        '--environment',
        [
          `COMMIT:${commit}`,
          `NODE_ENV:${env}`,
          `TARGET:${target}`,
          formats ? `FORMATS:${formats}` : '',
          buildTypes ? 'TYPES:true' : '',
          prodOnly ? 'PROD_ONLY:true' : '',
          sourceMap ? 'SOURCE_MAP:true' : '',
        ]
          .filter(Boolean)
          .join(','),
      ],
      { stdio: 'inherit' },
    );
  } catch (err) {
    console.error(err);
  }

  if (buildTypes && pkg.types) {
    console.log();
    console.log(chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`)));

    // build types
    const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

    const extractorConfigPath = path.resolve(pkgDir, 'api-extractor.json');
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      // concat additional d.ts to rolled-up dts
      const typesDir = path.resolve(pkgDir, 'types');
      if (await fs.exists(typesDir)) {
        const dtsPath = path.resolve(pkgDir, pkg.types);
        const existing = await fs.readFile(dtsPath, 'utf-8');
        const typeFiles = await fs.readdir(typesDir);
        const toAdd = await Promise.all(
          typeFiles.map(file => {
            return fs.readFile(path.resolve(typesDir, file), 'utf-8');
          }),
        );
        await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
      }
      console.log(chalk.bold(chalk.green('API Extractor completed successfully.')));
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      );
      process.exitCode = 1;
    }

    await fs.remove(`${pkgDir}/dist/packages`);
  }
}

function checkAllSizes(targets) {
  if (devOnly) {
    return;
  }
  console.log();
  for (const target of targets) {
    checkSize(target);
  }
  console.log();
}

function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);
  checkFileSize(`${pkgDir}/dist/${pkg.bundle}.js`);
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const file = fs.readFileSync(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(file);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath)),
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`,
  );
}
