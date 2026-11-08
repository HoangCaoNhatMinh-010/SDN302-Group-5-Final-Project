import mongoose from "mongoose";
import app, { sessionStore } from "./app";
import { env } from "./config/env";

async function start(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  const server = app.listen(env.port, () => {
    console.info(`Clinic API listening on http://localhost:${env.port}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.info(`${signal} received; closing the clinic API`);
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await sessionStore.close();
    await mongoose.disconnect();
  };
  process.on("SIGINT", () => void shutdown("SIGINT").catch((error: unknown) => {
    console.error("Clinic API shutdown failed:", error);
    process.exitCode = 1;
  }));
  process.on("SIGTERM", () => void shutdown("SIGTERM").catch((error: unknown) => {
    console.error("Clinic API shutdown failed:", error);
    process.exitCode = 1;
  }));
}

start().catch((error: unknown) => {
  console.error("Unable to start clinic API:", error);
  process.exitCode = 1;
});
