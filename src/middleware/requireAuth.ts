import type { NextFunction, Request, Response } from "express";
import { catchAyncError } from "../lib/catchAsyncError.js";
import { AppError } from "../lib/appError.js";
import { User } from "../models/user.model.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const requireAuth = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("you are not authorized", 401));
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401),
    );
  }

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
    sub: string;
    role: "user" | "admin";
    tokenVersion: number;
  } & JwtPayload;

  const { sub, tokenVersion } = payload;

  const currentUser = await User.findById(sub);
  if (!currentUser) {
    return next(
      new AppError("User belonging to this token no longer exists", 401),
    );
  }
  if (currentUser.tokenVersion !== tokenVersion) {
    return next(new AppError("Token invalidated", 401));
  }

  const authReq = req as any;
  authReq.user = {
    id: currentUser._id,
    email: currentUser.email,
    name: currentUser.name,
    role: currentUser.role,
    isEmailVerified: currentUser.isEmailVerfied,
  };
  next();
});
