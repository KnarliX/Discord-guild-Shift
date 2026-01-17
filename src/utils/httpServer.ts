import { createServer } from "node:http";
import { Logger } from "./logger.js";

/**
 * Starts a lightweight HTTP server to keep the bot alive with cornjob on platforms like Render.
 * Responds with "online" to any request.
 */
export function startKeepAlive() {
  const port = process.env.PORT || 5000;

  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("online");
    res.end();
  });

  server.listen(port, () => {
    Logger.console.info(`Keep-Alive HTTP Server is running on port ${port}`);
  });

  server.on("error", (err) => {
    Logger.console.error(`HTTP Server Error: ${err.message}`);
  });
}
