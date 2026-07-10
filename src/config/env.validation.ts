import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const validateEnv = () => {
  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "STRIPE_API_SECRET",
    "WEBHOOK_SECRET",
    "SESSION_SECRET",
    "ENCRYPTION_KEY",
  ];

  const missingVars: string[] = [];

  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missingVars.push(key);
    }
  });

  // ❌ If missing → throw clean error
  if (missingVars.length > 0) {
    throw new Error(
      `❌ Missing environment variables:\n` +
      missingVars.map((v) => `   - ${v}`).join("\n")
    );
  }


};