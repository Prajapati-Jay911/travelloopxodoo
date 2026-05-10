import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  (() => {
    if (process.env.DATABSE_URL) {
      throw new Error("DATABASE_URL is missing. Rename DATABSE_URL to DATABASE_URL in your env file.");
    }

    return "postgresql://postgres:postgres@localhost:5432/traveloop";
  })();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
