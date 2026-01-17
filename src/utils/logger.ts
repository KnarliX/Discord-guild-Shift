import { EmbedBuilder, WebhookClient } from "discord.js";

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const webhookClient = WEBHOOK_URL ? new WebhookClient({ url: WEBHOOK_URL }) : null;

type LogLevel = "info" | "warn" | "error";

function getTimestamp(): string {
  return new Date().toISOString();
}

async function sendToWebhook(level: LogLevel, message: string) {
  if (!webhookClient) return;

  const colors = {
    info: 0x00ff00, // Green
    warn: 0xffff00, // Yellow
    error: 0xff0000, // Red
  };

  const embed = new EmbedBuilder()
    .setTitle(`System Log: ${level.toUpperCase()}`)
    .setDescription(message)
    .setColor(colors[level])
    .setTimestamp();

  try {
    await webhookClient.send({ embeds: [embed] });
  } catch (err) {
    console.error(`[LOGGER FAILURE] Could not send to webhook:`, err);
  }
}

function sendToConsole(level: LogLevel, message: string) {
  const timestamp = getTimestamp();
  const formattedMsg = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

  switch (level) {
    case "error":
      console.error(formattedMsg);
      break;
    case "warn":
      console.warn(formattedMsg);
      break;
    default:
      console.log(formattedMsg);
  }
}

export const Logger = {
  console: {
    info: (msg: string) => sendToConsole("info", msg),
    warn: (msg: string) => sendToConsole("warn", msg),
    error: (msg: string) => sendToConsole("error", msg),
  },
  webhook: {
    info: (msg: string) => sendToWebhook("info", msg),
    warn: (msg: string) => sendToWebhook("warn", msg),
    error: (msg: string) => sendToWebhook("error", msg),
  },
  both: {
    info: (msg: string) => {
      sendToConsole("info", msg);
      sendToWebhook("info", msg);
    },
    warn: (msg: string) => {
      sendToConsole("warn", msg);
      sendToWebhook("warn", msg);
    },
    error: (msg: string) => {
      sendToConsole("error", msg);
      sendToWebhook("error", msg);
    },
  },
};
