const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { embed, embed1, embed2, embed3 } = require("../../embeds.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menú de ayuda dinámico con categorías.'),
  async execute(interaction) {
    const closeButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('𝗫')
      .setStyle(ButtonStyle.Danger);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('starter')
      .setPlaceholder('Categorias')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Principal')
          .setDescription('Principal')
          .setEmoji('👈')
          .setValue('back'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Informacion')
          .setDescription('Obtén los comandos que te darán información!')
          .setEmoji('🐱')
          .setValue('info'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Server')
          .setDescription('Obtenga los comandos que le brindarán información del servidor!')
          .setEmoji('🏠')
          .setValue('server'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Moderacion')
          .setDescription('Obtén los comandos que te darán comandos de moderación!')
          .setEmoji('🔨')
          .setValue('moderation')
      );

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);
    const buttonRow = new ActionRowBuilder().addComponents(closeButton);

    const reply = await interaction.reply({
      content: 'Categories list',
      embeds: [embed],
      components: [selectRow, buttonRow],
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      max: 10,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'starter') {
        const selectedOption = i.values[0];
        const embeds = {
          back: embed,
          info: embed1,
          server: embed2,
          moderation: embed3,
        };
        await i.update({ embeds: [embeds[selectedOption]] });
      } else if (i.customId === 'confirm') {
        await reply.delete();
      }
    });
  },
};