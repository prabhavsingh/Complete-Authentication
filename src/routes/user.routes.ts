import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import type { NextFunction, Request, Response } from "express";

const router = Router();

router.get(
  "/me",
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as any;
    const authUser = authReq.user;

    return res.status(200).json({
      status: "success",
      data: authUser,
    });
  },
);

export default router;
