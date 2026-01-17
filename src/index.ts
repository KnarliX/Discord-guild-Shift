import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { config } from "./config/env.js";
import { Logger } from "./utils/logger.js";
import * as readyEvent from "./events/ready.js";
import * as guildMemberAddEvent from "./events/guildMemberAdd.js";
import * as interactionCreateEvent from "./events/interactionCreate.js";
import * as infoCommand from "./commands/info.js";

// 1. Initialize Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Critical for tracking joins
  ],
});

// 2. Register Events Manually (Safe & Strict)
client.once(readyEvent.name, (c) => readyEvent.execute(c));
client.on(guildMemberAddEvent.name, (m) => guildMemberAddEvent.execute(m));
client.on(interactionCreateEvent.name, (i) => interactionCreateEvent.execute(i));

// 3. Register Slash Commands (Auto-register on start)
async function registerCommands() {
  const commands = [infoCommand.data.toJSON()];
  const rest = new REST({ version: '10' }).setToken(config.TOKEN);

  try {
    Logger.console.info("Refreshing application (/) commands...");

    // Registers globally (updates can take 1 hour)
    // For instant updates during dev, use applicationGuildCommands
    await rest.put(
      Routes.applicationCommands(client.user?.id || ""), // Takes ID after login, handled below technically but better separate usually.
      // Note: We need client ID before login strictly speaking, but inside start flow:
      { body: commands }
    );

    // NOTE: To make this safer, we usually register after login or use a known Client ID. 
    // Since we are inside index, we will rely on the token for REST, 
    // but for Routes.applicationCommands we need the App ID. 
    // Let's attach this to the ready event logic internally or just fetch it.
  } catch (error) {
    Logger.console.error(`Failed to register commands: ${error}`);
  }
}

// 4. Login
(async () => {
  try {
    await client.login(config.TOKEN);

    // Register commands after login to ensure we have the Client ID
    const rest = new REST().setToken(config.TOKEN);
    if (client.user) {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [infoCommand.data.toJSON()] }
        );
        Logger.console.info("Commands registered successfully.");
    }

  } catch (error) {
    Logger.console.error(`Fatal Error during startup: ${error}`);
    process.exit(1);
  }
})();
