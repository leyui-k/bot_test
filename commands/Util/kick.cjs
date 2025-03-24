const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');
const { kick, error2 } = require("../../embeds.cjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a un usuario')
    .addUserOption(option =>
      option.setName('user').setDescription('Usuario para kickear.').setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: "Usuario no encontrado.", ephemeral: true });
    const roleColor = member.roles.color?.color || 0xeb349e;
    const embed = {
      title: `${member.displayName} sera kickeado.`,
      description: `Estas seguro de esto?`,
      color: roleColor,
    };

    const confirm = new ButtonBuilder().setCustomId('confirm').setLabel('SI').setStyle(ButtonStyle.Danger);
    const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('𝗫').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(confirm, cancel);
    const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.editReply({ embeds: [error2], components: [], ephemeral: true });
    }

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm') {
        try {
          await member.kick();
          await i.update({ embeds: [kick], components: [] });
        } catch (error) {
          console.error(error);
          const errorEmbed = { title: `No puedes hacer eso!`, description: error.message, color: roleColor };
          await i.update({ embeds: [errorEmbed], components: [] });
        }
      } else if (i.customId === 'cancel') {
        await reply.delete();
      }
    });
  },
};
