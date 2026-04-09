import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export const authRouter = Router();

// ── POST /api/auth/register ──────────────────────────────────────────────────
authRouter.post("/register", AuthController.register);

// ── POST /api/auth/login ─────────────────────────────────────────────────────
authRouter.post("/login", AuthController.login);

// ── OTP Login ───────────────────────────────────────────────────────────────
authRouter.post("/otp/send", AuthController.sendOTP);
authRouter.post("/otp/verify", AuthController.verifyOTP);

// ── GET /api/auth/lookup-referrer ─────────────────────────────────────────────
authRouter.get("/lookup-referrer", AuthController.lookupReferrer);

// ── GET /api/auth/invite/:code ────────────────────────────────────────────────
authRouter.get("/invite/:code", AuthController.lookupInvite);
