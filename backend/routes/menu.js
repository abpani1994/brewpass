import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, category, priceCents, modifiers } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Item name is required" });
    const price = Number(priceCents);
    if (!Number.isFinite(price) || price < 0)
      return res.status(400).json({ error: "Enter a valid price" });
    const item = await prisma.menuItem.create({
      data: {
        ownerId: req.user.id,
        name: name.trim(),
        category: category?.trim() || "Coffee",
        priceCents: Math.round(price),
        modifiers: Array.isArray(modifiers) ? modifiers : [],
      },
    });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await prisma.menuItem.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    const { name, category, priceCents, available, modifiers } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (category !== undefined) data.category = String(category).trim();
    if (priceCents !== undefined) data.priceCents = Math.round(Number(priceCents)) || 0;
    if (available !== undefined) data.available = Boolean(available);
    if (modifiers !== undefined) data.modifiers = Array.isArray(modifiers) ? modifiers : [];
    const item = await prisma.menuItem.update({
      where: { id: existing.id },
      data,
    });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const existing = await prisma.menuItem.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Item not found" });
    await prisma.menuItem.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;