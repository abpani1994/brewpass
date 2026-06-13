import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { DEFAULT_MENU } from "../utils/seed.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, cafeName } = req.body;
    if (!email || !password || !cafeName)
      return res.status(400).json({ error: "Email, password and cafe name are required" });
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await prisma.owner.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: "That email is already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const owner = await prisma.owner.create({
      data: { email: email.toLowerCase(), passwordHash, cafeName },
    });

    await prisma.menuItem.createMany({
      data: DEFAULT_MENU.map((m) => ({
        ownerId: owner.id,
        name: m.name,
        category: m.category,
        priceCents: m.priceCents,
        modifiers: m.modifiers,
      })),
    });

    const token = signToken(owner.id);
    res.status(201).json({ token, owner: { id: owner.id, email: owner.email, cafeName: owner.cafeName } });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const owner = await prisma.owner.findUnique({ where: { email: email.toLowerCase() } });
    if (!owner) return res.status(401).json({ error: "No account with that email" });
    const ok = await bcrypt.compare(password, owner.passwordHash);
    if (!ok) return res.status(401).json({ error: "Incorrect password. Try again." });
    const token = signToken(owner.id);
    res.json({ token, owner: { id: owner.id, email: owner.email, cafeName: owner.cafeName } });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, cafeName: true, createdAt: true },
    });
    if (!owner) return res.status(404).json({ error: "Account not found" });
    res.json({ owner });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;