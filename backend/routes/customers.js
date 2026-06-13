import { Router } from "express";
import crypto from "crypto";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { customerStatus } from "../utils/streaks.js";
import { queueInvite } from "./sms.js";

const router = Router();
router.use(requireAuth);

function decorate(c) {
  const rewardProgress = c.orderCount % 5;
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    usualOrder: c.usualOrder,
    usualItemId: c.usualItemId,
    streak: c.streak,
    lastVisit: c.lastVisit,
    orderCount: c.orderCount,
    inviteToken: c.inviteToken,
    status: customerStatus(c.lastVisit),
    rewardProgress: c.orderCount > 0 && rewardProgress === 0 ? 5 : rewardProgress,
  };
}

router.get("/", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { ownerId: req.user.id },
      orderBy: { streak: "desc" },
    });
    res.json({ customers: customers.map(decorate) });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, usualOrder, usualItemId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Customer name is required" });
    if (!phone || !phone.trim()) return res.status(400).json({ error: "Phone number is required" });
    const inviteToken = crypto.randomBytes(9).toString("base64url");
    const customer = await prisma.customer.create({
      data: {
        ownerId: req.user.id,
        name: name.trim(),
        phone: phone.trim(),
        usualOrder: usualOrder?.trim() || "",
        usualItemId: usualItemId || null,
        inviteToken,
      },
    });
    res.status(201).json({ customer: decorate(customer) });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Customer not found" });
    const { name, phone, usualOrder, usualItemId } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = String(phone).trim();
    if (usualOrder !== undefined) data.usualOrder = String(usualOrder).trim();
    if (usualItemId !== undefined) data.usualItemId = usualItemId || null;
    const customer = await prisma.customer.update({ where: { id: existing.id }, data });
    res.json({ customer: decorate(customer) });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/:id/invite", async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    const result = await queueInvite(req.user.id, customer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;