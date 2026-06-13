import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Attempt to load local environment, but fallback safely if running inside Docker environment
try {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
} catch (e) {
  dotenv.config();
}

export const env = {
  port: parseInt(process.env.PORT || "8080", 10),
  nodeEnv: process.env.NODE_ENV || "production", // Default to production inside container
  frontendUrl: process.env.FRONTEND_URL || "https://yb-gallery.vercel.app",

  // Database
  databaseUrl: process.env.DATABASE_URL!,
  directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  // JWT
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",

  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",

  // Email
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@yashika.art",
};