import { Events, GuildMember } from "discord.js";
import { config } from "../config/env.js";
import { Logger } from "../utils/logger.js";
import { kickMemberFromOldGuild } from "../utils/kickMember.js";

export const name = Events.GuildMemberAdd;

export async function execute(member: GuildMember) {
  if (member.guild.id !== config.NEW_GUILD) return;

  const client = member.client;

  try {
    // Use cache first (avoid REST hit every time)
    let oldGuild = client.guilds.cache.get(config.OLD_GUILD);
    if (!oldGuild) {
      oldGuild = await client.guilds.fetch(config.OLD_GUILD);
    }

    let oldMember: GuildMember | null = null;

    try {
      oldMember = await oldGuild.members.fetch(member.id);
    } catch {
      return; // user not in old guild
    }

    if (!oldMember) return;

    Logger.webhook.info(
      `User Detected: **${member.user.tag}** (${member.id}) joined New Guild and exists in Old Guild.`
    );

    // 2. Batch roles add (single API call)
    const rolePromise =
      config.ROLES.length > 0
        ? member.roles
            .add(config.ROLES)
            .then(() =>
              Logger.webhook.info(
                `✅ Roles Added to ${member.user.tag}: ${config.ROLES
                  .map(r => `<@&${r}>`)
                  .join(", ")}`
              )
            )
            .catch(() =>
              Logger.webhook.warn(
                `⚠️ Failed to add some roles to ${member.user.tag}`
              )
            )
        : Promise.resolve();

    // Parallel execution (roles + kick together)
    const kickPromise =
      config.KICK_FROM_OLD && oldMember
        ? kickMemberFromOldGuild(oldMember, member.user.tag)
        : Promise.resolve();

    await Promise.all([rolePromise, kickPromise]);

  } catch (error) {
    Logger.webhook.error(
      `System Error in GuildMemberAdd: ${(error as Error).message}`
    );
  }
}
