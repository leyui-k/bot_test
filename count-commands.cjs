const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, 'commands');

function countCommands() {
  let totalCommands = 0;
  const subfolders = fs.readdirSync(commandsDir).filter(item => fs.statSync(path.join(commandsDir, item)).isDirectory());

  subfolders.forEach(subfolder => {
    const subfolderPath = path.join(commandsDir, subfolder);
    const commandFiles = fs.readdirSync(subfolderPath).filter(file => file.endsWith('.cjs'));
    totalCommands += commandFiles.length;
  });

  return totalCommands;
}

module.exports = countCommands;
