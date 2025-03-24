const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Ver el avatar de un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario cuyo avatar quieres ver')
        .setRequired(false)),

  async execute(interaction) {
    const member = interaction.options.getMember('usuario') || interaction.member;
    const displayName = member.displayName;
    const roleColor = member.roles.color?.color || 0xeb349e;
    const avatarURL = (member.user.avatarURL({ format: 'png', dynamic: true, size: 2048 }) || member.user.defaultAvatarURL).replace("webp", "png");
    const avatarEmbed = {
      title: `Avatar de ${displayName}`,
      image: { url: avatarURL },
      color: roleColor,
    };

    const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('𝗫').setStyle(ButtonStyle.Danger);
    const view = new ButtonBuilder().setLabel('Ver en navegador').setURL(avatarURL).setStyle(ButtonStyle.Link);
    const row = new ActionRowBuilder().addComponents(cancel, view);
    const reply = await interaction.reply({ embeds: [avatarEmbed], components: [row] });

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button });
    collector.on('collect', (i) => {
      if (i.customId === 'cancel') {
        reply.delete();
      }
    });
  },
};