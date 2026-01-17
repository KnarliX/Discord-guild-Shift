import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Core Discord Bot Token - Must be a non-empty string
  TOKEN: z.string().min(1, "TOKEN is missing in .env"),

  // Server IDs - Must be non-empty strings
  OLD_GUILD: z.string().min(1, "OLD_GUILD ID is missing"),
  NEW_GUILD: z.string().min(1, "NEW_GUILD ID is missing"),

  // Optional: Parses "role1, role2" string into an array of role IDs
  ROLES: z.string().optional().transform((val) => {
    if (!val) return [];
    return val.split(",").map((r) => r.trim()).filter((r) => r.length > 0);
  }),

  // Optional: Webhook URL for logging (must be a valid URL format)
  WEBHOOK_URL: z.string().url().optional(),

  // Optional: Configuration for kicking users (defaults to false)
  KICK_FROM_OLD: z.enum(["true", "false"])
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

// Validate the process environment variables against the schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ INVALID ENVIRONMENT VARIABLES:");

  const formattedErrors = _env.error.format();

  Object.entries(formattedErrors).forEach(([key, value]) => {
    if (key === "_errors") return;
    // @ts-ignore
    const errors = value?._errors;
    if (errors && errors.length > 0) {
      console.error(`- ${key}: ${errors.join(", ")}`);
    }
  });

  process.exit(1);
}

export const config = _env.data;
