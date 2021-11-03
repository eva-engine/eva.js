/**
 * 发布流程，升级版本，生产环境build（可跳过），运行测试（可跳过），commit代码，发布npm包，push代码
 *
 * --dry 空运行，测试脚本使用，会把命令输出到命令行，不会真的执行
 * --skipTests 跳过测试，在非空运行状态下生效
 * --skipBuild 跳过生产环境编译，在非控运行状态下生效
 */

const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const semver = require('semver');
const currentVersion = require('../package.json').version;
const {prompt} = require('enquirer');
const execa = require('execa');

const preId = args.preid || (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]);
const isDryRun = args.dry;
const skipTests = args.skipTests;
const skipBuild = args.skipBuild;

const packages = fs.readdirSync(path.resolve(__dirname, '../packages')).filter(p => !p.endsWith('.ts') && !p.startsWith('.'));

const skippedPackages = ['plugin-renderer-test'];

const versionIncrements = ['patch', 'minor', 'major', ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])];

const inc = i => semver.inc(currentVersion, i, preId);
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name);
const run = (bin, args, opts = {}) => execa(bin, args, {stdio: 'inherit', ...opts});
const dryRun = (bin, args, opts = {}) => console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);
const runIfNotDry = isDryRun ? dryRun : run;
const getPkgRoot = pkg => path.resolve(__dirname, '../packages/' + pkg);
const step = msg => console.log(chalk.cyan(msg));

async function main() {
  let targetVersion = args._[0];

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const {release} = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom']),
    });

    if (release === 'custom') {
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version;
    } else {
      targetVersion = release.match(/\((.*)\)/)[1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  const {yes} = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!yes) {
    return;
  }

  // run tests before release
  step('\nRunning tests...');
  if (!skipTests && !isDryRun) {
    await run(bin('jest'), ['--clearCache']);
    await run('npm', ['test']);
  } else {
    console.log('(skipped)');
  }

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...');
  updateVersions(targetVersion);

  // build all packages with types
  step('\nBuilding all packages...');
  if (!skipBuild && !isDryRun) {
    await run('npm', ['run', 'build', '--', '--release', '-f', 'cjs-esm-iife']);
  } else {
    console.log('(skipped)');
  }

  const {stdout} = await run('git', ['diff'], {stdio: 'pipe'});
  if (stdout) {
    step('\nCommitting changes...');
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  // publish packages
  step('\nPublishing packages...');
  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion, runIfNotDry);
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push']);

  if (isDryRun) {
    console.log('\nDry run finished - run git diff to see package changes.');
  }

  if (skippedPackages.length) {
    console.log(chalk.yellow(`The following packages are skipped and NOT published:\n- ${skippedPackages.join('\n- ')}`));
  }
  console.log();
}

function updateVersions(version) {
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version);

  // 2. update all packages
  packages.forEach(p => updatePackage(getPkgRoot(p), version));
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.version = version;
  updateDeps(pkg, 'dependencies', version);
  updateDeps(pkg, 'peerDependencies', version);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updateDeps(pkg, depType, version) {
  const deps = pkg[depType];
  if (!deps) return;
  Object.keys(deps).forEach(dep => {
    if (dep.startsWith('@eva/') && packages.indexOf(dep.substring(5)) > -1) {
      console.log(chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`));
      deps[dep] = `${version}`;
    }
  });
}

async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) {
    return;
  }
  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.private) {
    return;
  }

  const preReleaseTag = semver.prerelease(version);
  const releaseTag = preReleaseTag ? preReleaseTag[0] : null;

  step(`Publishing ${pkgName}...`);
  try {
    await runIfNotDry('npm', ['publish', ...(releaseTag ? ['--tag', releaseTag] : []), '--access', 'public'], {
      cwd: pkgRoot,
      stdio: 'pipe',
    });
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`));
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkgName}`));
    } else {
      throw e;
    }
  }
}

main().catch(err => {
  console.error(err);
});
