import { randomInt } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { env } from "../config/env";
import { authenticate, currentUser, issueToken } from "../lib/auth";
import { HttpError } from "../lib/errors";
import { requirePhone, requireString } from "../lib/validate";
import { OtpChallenge } from "../models/OtpChallenge";
import { User, UserDocument } from "../models/User";

const router = Router();

router.post("/register", async (req, res) => {
  const name = requireString(req.body.name, "Tên", 120);
  const phone = requirePhone(req.body.phone);
  const password = requireString(req.body.password, "Mật khẩu", 128);
  if (password.length < 10) {
    throw new HttpError(400, "Mật khẩu cần có ít nhất 10 ký tự.", "WEAK_PASSWORD");
  }

  const user = new User({ name, phone, role: "PATIENT" });
  await User.register(user, password);
  await establishLogin(req, user);
  const token = issueToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error: Error | null, user: UserDocument | false, info?: { message?: string }) => {
    if (error) {
      next(error);
      return;
    }
    if (!user || !user.active) {
      next(new HttpError(401, info?.message ?? "Số điện thoại hoặc mật khẩu không đúng.", "INVALID_CREDENTIALS"));
      return;
    }
    req.logIn(user, (loginError) => {
      if (loginError) {
        next(loginError);
        return;
      }
      res.json({ token: issueToken(user), user: publicUser(user) });
    });
  })(req, res, next);
});

router.post("/otp/request", async (req, res) => {
  const phone = requirePhone(req.body.phone);
  const recent = await OtpChallenge.findOne({
    phone,
    createdAt: { $gt: new Date(Date.now() - 60_000) },
    consumedAt: { $exists: false },
  });
  if (recent) {
    throw new HttpError(429, "Vui lòng đợi một phút trước khi yêu cầu mã mới.", "OTP_RATE_LIMIT");
  }

  const code = String(randomInt(100000, 1_000_000));
  await OtpChallenge.create({
    phone,
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: new Date(Date.now() + env.otpExpiresMinutes * 60_000),
  });

  const response: { message: string; developmentCode?: string } = {
    message: "Yêu cầu đã được nhận. Kênh gửi OTP bên ngoài cần được cấu hình để chuyển mã cho người dùng.",
  };
  if (env.exposeOtp) {
    response.developmentCode = code;
  }
  res.json(response);
});

router.post("/otp/verify", async (req, res) => {
  const phone = requirePhone(req.body.phone);
  const code = requireString(req.body.code, "Mã xác thực", 6);
  const challenge = await OtpChallenge.findOne({
    phone,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  }).sort({ createdAt: -1 });

  if (!challenge || !(await bcrypt.compare(code, challenge.codeHash))) {
    if (challenge) {
      challenge.attempts += 1;
      await challenge.save();
    }
    throw new HttpError(401, "Mã xác thực không đúng hoặc đã hết hạn.", "INVALID_OTP");
  }

  challenge.consumedAt = new Date();
  await challenge.save();
  const user = await User.findOne({ phone, active: true });
  if (!user) {
    throw new HttpError(401, "Số điện thoại chưa được đăng ký hoặc đã bị khóa.", "ACCOUNT_NOT_FOUND");
  }
  await establishLogin(req, user);
  res.json({ token: issueToken(user), user: publicUser(user) });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: publicUser(currentUser(req)) });
});

router.post("/logout", authenticate, async (req, res) => {
  const user = currentUser(req);
  user.authVersion += 1;
  await user.save();
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  res.json({ message: "Đã đăng xuất." });
});

function publicUser(user: UserDocument) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    doctorProfile: user.doctorProfile,
  };
}

function establishLogin(req: Parameters<typeof authenticate>[0], user: UserDocument): Promise<void> {
  return new Promise((resolve, reject) => {
    req.logIn(user, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export default router;
