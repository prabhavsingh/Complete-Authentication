import jwt from "jsonwebtoken";
import type { ObjectId } from "mongoose";

export function createTokens(
  userId: string,
  role: "user" | "admin",
  tokenVersion: number,
) {
  const payload = { sub: userId, role, tokenVersion };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(
    { sub: userId, tokenVersion },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as any,
    },
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
    sub: string;
    tokenVersion: number;
  };
}
