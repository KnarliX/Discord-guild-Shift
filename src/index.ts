import { Client, Collection, GatewayIntentBits, REST, Routes } from "discord.js";
import { config } from "./config/env.js";
import { Logger } from "./utils/logger.js";
import { startKeepAlive } from "./utils/httpServer.js";

// Events Imports
import * as readyEvent from "./events/ready.js";
import * as guildMemberAddEvent from "./events/guildMemberAdd.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";

// Commands Imports
import * as infoCommand from "./commands/info.js";

// Initialize Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

(client as any).commands = new Collection();

(client as any).commands.set(infoCommand.data.name, infoCommand);

// Start Keep-Alive HTTP Server
// Useful for uptime monitors (like Cron-job.org or UptimeRobot)
// If you don't want an HTTP server, just comment out or remove the next line.
startKeepAlive();

client.once(readyEvent.name, (c) => readyEvent.execute(c));
client.on(guildMemberAddEvent.name, (m) => guildMemberAddEvent.execute(m));
client.on(interactionCreateEvent.name, (i) => interactionCreateEvent.execute(i));

(async () => {
  try {
    await client.login(config.TOKEN);

    if (client.user) {
      const rest = new REST().setToken(config.TOKEN);

      const commandsData = [
        infoCommand.data.toJSON()
      ];

      Logger.console.info("Refreshing application (/) commands...");

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commandsData }
      );

      Logger.console.info("Slash commands registered successfully.");
    }

  } catch (error) {
    Logger.console.error(`Fatal Error during startup: ${error}`);
    process.exit(1);
  }
})();
