const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

const db = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete-evento')
		.setDescription('Eliminar un evento creado.')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('El ID del evento a eliminar.')
				.setRequired(true)
				.setAutocomplete(true)),

	async execute(interaction) {
		try {
			const eventId = interaction.options.getString('id');
			const [result] = await db.execute('DELETE FROM eventos WHERE id = ?', [eventId]);

			await interaction.reply(result.affectedRows
				? `✅ Evento con ID **${eventId}** eliminado.`
				: `⚠️ No se encontró el evento con ID **${eventId}**.`);
		} catch (error) {
			console.error('Error eliminando evento:', error);
			await interaction.reply('❌ Error eliminando el evento.');
		}
	},

	async autocomplete(interaction) {
		try {
			const focused = interaction.options.getFocused().toLowerCase();
			const [rows] = await db.execute('SELECT id, titulo FROM eventos');

			await interaction.respond(rows
				.map(({ id, titulo }) => ({ name: `${id} - ${titulo}`, value: id.toString() }))
				.filter(({ name }) => name.toLowerCase().includes(focused))
				.slice(0, 25));
		} catch (error) {
			console.error('Error en autocomplete:', error);
			await interaction.respond([]);
		}
	},
};
