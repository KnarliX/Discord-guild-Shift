import { Client, Events, PermissionFlagsBits } from "discord.js";
import { config } from "../config/env.js";
import { Logger } from "../utils/logger.js";
import { StopSystem } from "../utils/StopSystem.js";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client) {
  Logger.console.info(`Logged in as ${client.user?.tag}`);

  // Fetch Guilds
  const oldGuild = client.guilds.cache.get(config.OLD_GUILD);
  const newGuild = client.guilds.cache.get(config.NEW_GUILD);

  // 1. Check if Bot is in the guilds
  if (!oldGuild) {
    StopSystem.shutdown(`Bot is not in the OLD_GUILD (ID: ${config.OLD_GUILD}). Please invite the bot.`);
  }
  if (!newGuild) {
    StopSystem.shutdown(`Bot is not in the NEW_GUILD (ID: ${config.NEW_GUILD}). Please invite the bot.`);
  }

  // 2. Check for Administrator Permissions
  // We force unwrap (!) here because we already checked existence above
  const oldMember = oldGuild!.members.cache.get(client.user!.id);
  const newMember = newGuild!.members.cache.get(client.user!.id);

  if (!oldMember?.permissions.has(PermissionFlagsBits.Administrator)) {
    StopSystem.shutdown(`Bot lacks 'Administrator' permission in OLD_GUILD: ${oldGuild!.name}`);
  }

  if (!newMember?.permissions.has(PermissionFlagsBits.Administrator)) {
    StopSystem.shutdown(`Bot lacks 'Administrator' permission in NEW_GUILD: ${newGuild!.name}`);
  }

  // 3. Success Log (Only one log as requested)
  Logger.both.info(`System Started successfully. Watching shifts from [${oldGuild!.name}] -> [${newGuild!.name}]`);
}
