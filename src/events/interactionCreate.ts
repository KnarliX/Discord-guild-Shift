import { Events, Interaction } from "discord.js";
import { Logger } from "../utils/logger.js"; 

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = (interaction.client as any).commands.get(interaction.commandName);

  if (!command) {
    Logger.console.warn(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    Logger.both.error(`Error executing ${interaction.commandName}: ${errorMessage}`);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
}
