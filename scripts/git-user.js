const execSync = require('child_process').execSync;

module.exports = () => {
  const commandPrefix = 'git config --get user';

  try {
    const name = execSync(`${commandPrefix}.name`).toString().replace(/\n/, '');
    const email = execSync(`${commandPrefix}.email`).toString().replace(/\n/, '');
    
    return {
      name,
      email
    }
  } catch(e) {
    console.error('error occurred during reading git user config', e);
    return null;
  }
}