const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');
const { ban, error1 } = require("../../embeds.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banear a un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario que será baneado')
        .setRequired(true)),

  async execute(interaction) {
    const member = interaction.options.getMember('usuario');
    if (!member) return interaction.reply({ content: "Usuario no encontrado.", ephemeral: true });
    const roleColor = member.roles.color?.color || 0xeb349e;
    const embed = {
      title: `${member.displayName} será baneado`,
      description: '¿Estás seguro de esta acción?',
      color: roleColor,
    };

    const confirm = new ButtonBuilder().setCustomId('confirm').setLabel('SÍ').setStyle(ButtonStyle.Danger);
    const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('𝗫').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(confirm, cancel);
    const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.editReply({ embeds: [error1], components: [], ephemeral: true });
    }

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });
    collector.on('collect', async (i) => {
      if (i.customId === 'confirm') {
        try {
          await member.ban();
          await i.update({ embeds: [ban], components: [] });
        } catch (error) {
          const errorEmbed = { title: `No puedes hacer eso!`, description: error.message, color: roleColor };
          await i.update({ embeds: [errorEmbed], components: [] });
        }
      } else if (i.customId === 'cancel') {
        await reply.delete();
      }
    });
  },
};  