import { Events, Interaction } from "discord.js";
import * as infoCommand from "../commands/info.js";
import { Logger } from "../utils/logger.js";

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "info") {
    try {
      await infoCommand.execute(interaction);
    } catch (error) {
      Logger.console.error(`Error executing info command: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
      }
    }
  }
}
