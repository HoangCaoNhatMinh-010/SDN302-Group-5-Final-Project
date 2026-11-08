import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./errors";
import { User, UserDocument, UserRole } from "../models/User";

interface TokenPayload {
  sub: string;
  role: UserRole;
  version: number;
}

export function issueToken(user: UserDocument): string {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    version: user.authVersion,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next(new HttpError(401, "Vui lòng đăng nhập để tiếp tục.", "UNAUTHENTICATED"));
    return;
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
    next(new HttpError(401, "Token không hợp lệ hoặc đã hết hạn.", "INVALID_TOKEN"));
    return;
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.active || user.authVersion !== payload.version) {
      throw new HttpError(401, "Phiên đăng nhập không còn hợp lệ.", "INVALID_SESSION");
    }
    req.authUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      next(new HttpError(401, "Vui lòng đăng nhập để tiếp tục.", "UNAUTHENTICATED"));
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      next(new HttpError(403, "Bạn không có quyền thực hiện thao tác này.", "FORBIDDEN"));
      return;
    }
    next();
  };
}

export function currentUser(req: Request): UserDocument {
  if (!req.authUser) {
    throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.", "UNAUTHENTICATED");
  }
  return req.authUser;
}
