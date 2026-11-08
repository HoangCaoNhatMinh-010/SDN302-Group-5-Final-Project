import express, { ErrorRequestHandler } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { env } from "./config/env";
import { HttpError } from "./lib/errors";
import { User } from "./models/User";
import apiRoutes from "./routes";

const app = express();
export const sessionStore = MongoStore.create({
  mongoUrl: env.mongoUri,
  collectionName: "sessions",
  ttl: 14 * 24 * 60 * 60,
});

passport.use(User.createStrategy());
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id: string, done) => {
  User.findById(id)
    .then((user) => done(null, user ?? false))
    .catch(done);
});

app.disable("x-powered-by");
app.use((req, res, next) => {
  const origin = req.header("origin");
  if (origin === env.frontendOrigin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(
  session({
    name: "clinic.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "clinic-booking-api" });
});
app.use("/api", apiRoutes);
app.use((_req, _res, next) => {
  next(new HttpError(404, "Không tìm thấy tài nguyên.", "NOT_FOUND"));
});

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (error && typeof error === "object" && "name" in error && error.name === "ValidationError") {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Dữ liệu gửi lên không hợp lệ." } });
    return;
  }
  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    res.status(409).json({ error: { code: "DUPLICATE_RESOURCE", message: "Dữ liệu đã tồn tại." } });
    return;
  }
  console.error("Unhandled API error:", error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Đã xảy ra lỗi máy chủ." } });
};
app.use(errorHandler);

export default app;
