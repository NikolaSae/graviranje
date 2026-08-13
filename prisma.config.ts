import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 ne ucitava .env automatski u config fajlu -> "dotenv/config" iznad je obavezan.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nije definisan. Proveri .env u root-u projekta.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
