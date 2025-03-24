require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.cjs'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {			
		}
	}
}

const rest = new REST().setToken(process.env.tokenBot);

(async () => {
	
	try {
		for (const folder of commandFolders) {
			const commandsPath = path.join(foldersPath, folder);
			const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.cjs')).map(file => file.replace('.cjs', ', ')).join('');
			console.log(`Los comandos ${files}han sido recargados!`);
		}

		const data = await rest.put(
            Routes.applicationCommands(process.env.clientId),
            { body: commands },
        );

		console.log(`${data.length} comandos.`);
	} catch (error) {
		console.error(error);
	}
})();