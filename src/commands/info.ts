import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Displays system status and information about bot.");

export async function execute(interaction: ChatInputCommandInteraction) {
  const ping = interaction.client.ws.ping;

  // Calculate Uptime
  const uptimeMs = interaction.client.uptime ?? 0;
  const uptimeSeconds = Math.floor(uptimeMs / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeString = `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;
  const repoUrl = `https://gh-perma.pages.dev?id=172272341&path=Discord-guild-Shift`;

  const embed = new EmbedBuilder()
    .setColor(0x70a5ff) // Light Blue
    .setTitle("Discord Guild Shift Bot")
    .setURL(repoUrl)
    .setDescription("Open source automated migration system.")
    .setThumbnail("https://avatars.githubusercontent.com/u/172272341?v=4")
    .addFields(
      { name: "Developer", value: "[Rajnish Mehta](https://gh-perma.pages.dev/?id=172272341)", inline: true },
      { name: "Ping", value: `${ping}ms`, inline: true },
      { name: "Uptime", value: uptimeString, inline: true }
    )
    .setFooter({ text: "System Operational" });

  // Create Link Button
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("GitHub Repository")
      .setEmoji('1462203890589110374')
      .setStyle(ButtonStyle.Link)
      .setURL(repoUrl)
  );

  await interaction.reply({ embeds: [embed], components: [row] });
}
