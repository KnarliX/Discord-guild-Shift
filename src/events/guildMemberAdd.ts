import { Events, GuildMember } from "discord.js";
import { config } from "../config/env.js";
import { Logger } from "../utils/logger.js";

export const name = Events.GuildMemberAdd;

export async function execute(member: GuildMember) {
  // 1. Ensure event is for the NEW_GUILD
  if (member.guild.id !== config.NEW_GUILD) return;

  const client = member.client;

  try {
    // 2. Check if user exists in OLD_GUILD
    const oldGuild = await client.guilds.fetch(config.OLD_GUILD);
    // Force fetch to ensure cache is up to date
    let oldMember: GuildMember | null = null;

    try {
      oldMember = await oldGuild.members.fetch(member.id);
    } catch (e) {
      // User not found in old guild, ignore completely
      return;
    }

    if (!oldMember) return;

    // 3. User Found - Start Process (Log ONLY to Webhook)
    Logger.webhook.info(`User Detected: **${member.user.tag}** (${member.id}) joined New Guild and exists in Old Guild.`);

    // 4. Add Roles (If configured)
    if (config.ROLES.length > 0) {
      const rolesAdded: string[] = [];
      const rolesFailed: string[] = [];

      for (const roleId of config.ROLES) {
        try {
          await member.roles.add(roleId);
          rolesAdded.push(roleId);
        } catch (err) {
          rolesFailed.push(roleId);
        }
      }

      if (rolesAdded.length > 0) {
        Logger.webhook.info(`✅ Roles Added to ${member.user.tag}: ${rolesAdded.map(r => `<@&${r}>`).join(", ")}`);
      }
      if (rolesFailed.length > 0) {
        Logger.webhook.warn(`⚠️ Failed to add roles to ${member.user.tag}: ${rolesFailed.join(", ")}`);
      }
    }

    // 5. Kick from Old Guild (If configured)
    if (config.KICK_FROM_OLD) {
      try {
        await oldMember.kick("Automated Shift: User joined New Guild.");
        Logger.webhook.info(`👢 **KICKED**: ${member.user.tag} was kicked from Old Guild.`);
      } catch (err) {
        Logger.webhook.error(`❌ Failed to kick ${member.user.tag} from Old Guild. Check permissions.`);
      }
    }

  } catch (error) {
    Logger.webhook.error(`System Error in GuildMemberAdd: ${(error as Error).message}`);
  }
}
