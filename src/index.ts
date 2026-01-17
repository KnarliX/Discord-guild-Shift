import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { config } from "./config/env.js";
import { Logger } from "./utils/logger.js";
import { startKeepAlive } from "./utils/httpServer.js";
import * as readyEvent from "./events/ready.js";
import * as guildMemberAddEvent from "./events/guildMemberAdd.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";
import * as infoCommand from "./commands/info.js";

// 1. Initialize Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// 2. Start Keep-Alive HTTP Server
// Useful for uptime monitors (like Cron-job.org or UptimeRobot)
// If you don't want an HTTP server, just comment out or remove the next line.
startKeepAlive();

// 3. Register Events Manually (Safe & Strict)
client.once(readyEvent.name, (c) => readyEvent.execute(c));
client.on(guildMemberAddEvent.name, (m) => guildMemberAddEvent.execute(m));
client.on(interactionCreateEvent.name, (i) => interactionCreateEvent.execute(i));

// 4. Login & Register Commands
(async () => {
  try {
    // A. Login to Discord
    await client.login(config.TOKEN);

    // B. Register Slash Commands (Only after login to ensure Client ID is available)
    if (client.user) {
        const rest = new REST().setToken(config.TOKEN);
        const commands = [infoCommand.data.toJSON()];

        Logger.console.info("Refreshing application (/) commands...");

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        Logger.console.info("Slash commands registered successfully.");
    }

  } catch (error) {
    Logger.console.error(`Fatal Error during startup: ${error}`);
    process.exit(1);
  }
})();
