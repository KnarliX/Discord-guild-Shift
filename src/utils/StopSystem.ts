import { Logger } from "./logger.js";

export class StopSystem {
  /**
   * Stops the bot application immediately.
   * Logs the reason to both Console and Webhook before exiting.
   * @param reason The reason for the emergency stop.
   */
  public static shutdown(reason: string): never {
    const timestamp = new Date().toISOString();
    const crashMessage = `\n🚨 **SYSTEM CRASH INITIATED** 🚨\n\n**Reason:** ${reason}\n**Time:** ${timestamp}`;

    // We force a log to both sources
    Logger.both.error(crashMessage);

    // Allow a brief moment for the webhook request to flush before hard exiting
    setTimeout(() => {
      console.error("Exiting process with code 1.");
      process.exit(1);
    }, 1000);

    // Throw error to satisfy 'never' return type if timeout hasn't triggered yet
    throw new Error(crashMessage);
  }
}
