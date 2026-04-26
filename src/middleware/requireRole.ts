import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/appError.js";

export const requireRole = function (role: "user" | "admin") {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;
    const authUser = authReq.user;
    if (authUser.role !== role) {
      return next(
        new AppError("you do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
