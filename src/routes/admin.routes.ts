import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { catchAyncError } from "../lib/catchAsyncError.js";
import { User } from "../models/user.model.js";

const router = Router();

router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  catchAyncError(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("email role isEmailVerified createdAt");

    const result = users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerfied,
      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      status: "success",
      data: result,
    });
  }),
);

export default router;
