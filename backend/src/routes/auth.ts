import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { SMSService } from "../lib/sms";
import { FeatureFlags } from "../lib/featureFlags";

export const authRouter = Router();

// ── POST /api/auth/employee/login ─────────────────────────────────────────────
authRouter.post("/employee/login", async (req, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  try {
    const employee = await prisma.employee.findUnique({ where: { email } });
    if (!employee || !employee.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: employee.id, role: employee.role, type: "employee" },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any }
    );
    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        employeeCode: employee.employeeCode,
        role: employee.role,
        branchId: employee.branchId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /api/auth/investor/login ─────────────────────────────────────────────
// (Mobile + Password login)
authRouter.post("/investor/login", async (req, res: Response) => {
  const { mobile, password } = req.body as { mobile: string; password: string };
  if (!mobile || !password) {
    res.status(400).json({ error: "Mobile and password required" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, type: "investor" },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any }
    );

    // Send Login Alert if enabled
    if (await FeatureFlags.isEnabled("SMS_ALERTS")) {
      await SMSService.sendAlert(user.mobile ?? "", "RGT_LOGIN", [
        user.name,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      ]);
    }

    res.json({
      token,
      user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /api/auth/otp/send ────────────────────────────────────────────────────
authRouter.post("/otp/send", async (req, res: Response) => {
  const { mobile } = req.body as { mobile: string };
  if (!mobile) {
    res.status(400).json({ error: "Mobile number required" });
    return;
  }

  try {
    // Check if OTP Login is enabled in platform settings
    if (!(await FeatureFlags.isEnabled("OTP_LOGIN"))) {
      res.status(403).json({ error: "OTP Login is currently disabled by administrator" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.isActive) {
      res.status(404).json({ error: "Investor account not found" });
      return;
    }

    const sessionId = await SMSService.sendOTP(mobile);

    // Save session ID to user for verification
    await prisma.user.update({
      where: { id: user.id },
      data: { otpSessionId: sessionId }
    });

    res.json({ message: "OTP sent successfully", mobile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to send OTP" });
  }
});

// ── POST /api/auth/otp/verify ─────────────────────────────────────────────────
authRouter.post("/otp/verify", async (req, res: Response) => {
  const { mobile, otp } = req.body as { mobile: string; otp: string };
  if (!mobile || !otp) {
    res.status(400).json({ error: "Mobile and OTP required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.otpSessionId) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const isValid = await SMSService.verifyOTP(user.otpSessionId, otp);
    if (!isValid) {
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    // Clear session
    await prisma.user.update({
      where: { id: user.id },
      data: { otpSessionId: null }
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, type: "investor" },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any }
    );

    // Send Login Alert if enabled
    if (await FeatureFlags.isEnabled("SMS_ALERTS")) {
      await SMSService.sendAlert(user.mobile ?? "", "RGT_LOGIN", [
        user.name,
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      ]);
    }

    res.json({
      token,
      user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});
