/**
 * 开发时使用，可以watch代码变化rebuild
 *
 * USAGE：
 *
 * $tnpm run dev eva.js
 */
const path = require('path');
const execa = require('execa');
const {fuzzyMatchTarget} = require('./utils');
const args = require('minimist')(process.argv.slice(2));

const target = args._.length ? fuzzyMatchTarget(args._)[0] : 'eva.js';
// const formats = args.formats || args.f;
const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7);

const rollupDevConfigFilePath = path.resolve(__dirname, '../rollup.config.dev.js');

execa('node', [rollupDevConfigFilePath], {
  stdio: 'inherit',
  env: {
    COMMIT: commit,
    TARGET: target,
    FORMATS: 'umd',
    ROLLUP_WATCH: true,
  },
});
