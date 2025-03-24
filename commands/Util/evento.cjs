const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('evento')
		.setDescription('Crea un evento.')
		.addStringOption(option =>
			option.setName('titulo')
				.setDescription('El título del evento')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('fecha')
				.setDescription('La fecha del evento (DD/MM)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('descripcion')
				.setDescription('Descripción opcional del evento')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('requisitos')
				.setDescription('Requisitos opcionales del evento')
				.setRequired(false))
		.addAttachmentOption(option =>
			option.setName('imagen')
				.setDescription('Imagen opcional del evento')
				.setRequired(false)),

	async execute(interaction) {
		const titulo = interaction.options.getString('titulo');
		const fecha = interaction.options.getString('fecha');
		const descripcion = interaction.options.getString('descripcion')?.trim() || null;
		const requisitos = interaction.options.getString('requisitos')?.trim() || null;
		const imagen = interaction.options.getAttachment('imagen')?.url || null;

		if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(fecha)) {
			return await interaction.reply('⚠️ Usa el formato **DD/MM** para la fecha.');
		}

		try {
			const reply = await interaction.reply({
				content: `📅 **Evento creado:**\n**Título:** ${titulo}\n**Fecha:** ${fecha}`,
				fetchReply: true
			});

			const eventoURL = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${reply.id}`;

			await axios.post('http://127.0.0.1:3001/api/evento', {
				titulo,
				date: fecha,
				descripcion,
				requisitos,
				image: imagen,
				eventoURL
			});

			let responseMessage = `✅ **Evento creado:**\n**Título:** ${titulo}\n**Fecha:** ${fecha}\n🔗 **URL:** ${eventoURL}`;
			if (descripcion) responseMessage += `\n📝 **Descripción:** ${descripcion}`;
			if (requisitos) responseMessage += `\n📌 **Requisitos:** ${requisitos}`;
			if (imagen) responseMessage += `\n🖼️ **Imagen:** ${imagen}`;

			await interaction.editReply(responseMessage);
		} catch (error) {
			console.error('Error enviando evento al servidor:', error);
			await interaction.editReply('❌ Hubo un error al registrar el evento.');
		}
	},
};
