import { Router } from "express";
import { prisma } from "../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { LoginSchema, SignupSchema } from "@mini-payrun/shared";
import type { AuthRequest } from "../middleware/auth";

interface TokenInterface {
  accessToken: string;
  refreshToken: string;
}

const router: Router = Router();

// Token generation helper
const generateTokens = (userId: string, email: string): TokenInterface => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" } // Shorter expiration for access token
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" } // Longer expiration for refresh token
  );

  return { accessToken, refreshToken };
};

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = SignupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12); // Increased salt rounds
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    // Check if refresh token exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, refreshToken },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email
    );

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /auth/logout
router.post("/logout", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (userId) {
      // Remove refresh token from database
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
