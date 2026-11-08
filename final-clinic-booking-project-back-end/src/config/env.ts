import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8080),
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/clinic_booking"),
  sessionSecret: required("SESSION_SECRET", isProduction ? undefined : "local-session-secret-change-me"),
  jwtSecret: required("JWT_SECRET", isProduction ? undefined : "local-jwt-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES ?? 5),
  exposeOtp: !isProduction && process.env.EXPOSE_OTP_IN_RESPONSE === "true",
  adminPhone: process.env.ADMIN_PHONE,
  adminPassword: process.env.ADMIN_PASSWORD,
};

if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}

if (!Number.isInteger(env.otpExpiresMinutes) || env.otpExpiresMinutes < 1) {
  throw new Error("OTP_EXPIRES_MINUTES must be a positive integer");
}
