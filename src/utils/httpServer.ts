import { createServer } from "node:http";
import { Logger } from "./logger.js";
import { Client } from "discord.js";

/**
 * Starts a lightweight HTTP server to keep the bot alive with cornjob on platforms like Render.
 * Responds with "online" if bot is ready, otherwise returns an error.
 */
export function startKeepAlive(client: Client) {
  const port = process.env.PORT || 5000;

  const server = createServer((req, res) => {
    if (client.isReady()) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(`${client.user?.username} is online`);
    } else {
      res.writeHead(503);
    }
    res.end();
  });

  server.listen(port, () => {
    Logger.console.info(`Keep-Alive HTTP Server is running on port ${port}`);
  });

  server.on("error", (err) => {
    Logger.console.error(`HTTP Server Error: ${err.message}`);
  });
}
