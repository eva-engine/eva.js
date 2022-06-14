const execSync = require('child_process').execSync;

module.exports = () => {
  const commandPrefix = 'git config --get user';

  try {
    const name = execSync(`${commandPrefix}.name`).toString().replaceAll('\n', '');
    const email = execSync(`${commandPrefix}.email`).toString().replaceAll('\n', '');
    
    return {
      name,
      email
    }
  } catch(e) {
    console.error('error occurred during reading git user config', e);
    return null;
  }
}