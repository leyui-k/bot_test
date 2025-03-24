const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No hay un comando: ${interaction.commandName}`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error ejecutando: ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {
		} else if (interaction.isStringSelectMenu()) {
		}
	},
};