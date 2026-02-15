import { GuildMember } from "discord.js";
import { Logger } from "./logger.js";

export async function kickMemberFromOldGuild(oldMember: GuildMember, userTag: string) {
  const userTag = oldMember.user.tag;

  try {
    if (!oldMember.kickable) {
      Logger.webhook.error(
        `❌ Cannot kick ${userTag} (${oldMember.id}): Not kickable (permission or hierarchy issue).`
      );
      return false;
    }

    // Optional safety timeout (5s)
    await Promise.race([
      oldMember.kick("Automated Shift: User joined New Guild."),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Kick timeout")), 5000)
      ),
    ]);

    Logger.webhook.info(
      `👢 KICKED: ${userTag} (${oldMember.id}) from Old Guild.`
    );

    return true;

  } catch (err: any) {
    Logger.webhook.error(
      `❌ Failed to kick ${userTag} (${oldMember.id}) | Code: ${err?.code ?? "N/A"} | Message: ${err?.message}`
    );
    return false;
  }
}
