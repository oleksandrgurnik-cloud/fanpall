import { execSync } from "node:child_process";

const useMock =
  process.env.USE_MOCK_DB === "true" || !process.env.DATABASE_URL;

if (useMock) {
  console.log("Skipping prisma migrate deploy (mock DB / no DATABASE_URL)");
} else {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

execSync("npx next build", { stdio: "inherit" });
