import path from "path";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";
import { createIndexer, prometheusRegistry } from "nostr-indexer";
import { magenta, underline } from "colorette";

// Environment variables.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log(process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env file.");
  process.exit(1);
}

// @ts-ignore
(async () => {
  const nostrIndexer = await createIndexer({
    debug: true,
    dbPath: process.env.DATABASE_URL || "",
  });

  // Create a Yoga instance with a GraphQL schema.
  // @ts-ignore
  const yoga = createYoga({ schema, context: { nostrIndexer } });

  // Pass it into a server to hook into request handlers.
  const server = createServer(yoga);

  // Start the server and you're done!
  server.listen(4000, () => {
    console.info(
      `\n\n🌍 Server is running on ${underline(
        magenta("http://localhost:4000/graphql")
      )}\n\n`
    );
  });

  /**
   * Indexer Prometheus metrics
   */
  const indexerPromServer = createServer(async (req, res) => {
    if (req.url === "/metrics") {
      res.setHeader("Content-Type", prometheusRegistry.contentType);
      const customIndexerMetrics = await prometheusRegistry.metrics();
      const dbIndexerMetrics =
        await nostrIndexer.db.client.$metrics.prometheus();
      res.end(customIndexerMetrics + dbIndexerMetrics);
    } else {
      res.statusCode = 404;
      res.end("Not found");
    }
  });

  indexerPromServer.listen(4001, () => {
    console.log("Indexer Prometheus Server listening on port 4001");
  });
})();
