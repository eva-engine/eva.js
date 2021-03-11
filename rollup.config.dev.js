const path = require('path');
const rollup = require('rollup');
const loadConfigFile = require('rollup/dist/loadConfigFile');

loadConfigFile(path.resolve(__dirname, 'rollup.config.js')).then(async ({options, warnings}) => {
  console.log(`We currently have ${warnings.count} warnings`);

  warnings.flush();

  for (const optionsObj of options) {
    const bundle = await rollup.rollup(optionsObj);
    await Promise.all(optionsObj.output.map(bundle.write));
  }

  rollup.watch(options);
});
