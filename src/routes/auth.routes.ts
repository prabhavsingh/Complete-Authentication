import { Router } from "express";
import {
  forgotPassword,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  verifyEmailHandler,
} from "../controllers/auth/auth.controller.js";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshTokenHandler);
router.get("/verify-email", verifyEmailHandler);
router.get("/logout", logoutHandler);
router.post("/forgot-password", forgotPassword);

export default router;
