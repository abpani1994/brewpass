import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { addClient, removeClient } from "../utils/bus.js";

const router = Router();

// SSE stream — auth via query token because EventSource can't set headers.
router.get("/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();
  res.write(`event: ping\ndata: {}\n\n`);
  const client = { res };
  addClient(client);
  const keepAlive = setInterval(() => res.write(`event: ping\ndata: {}\n\n`), 25000);
  req.on("close", () => {
    clearInterval(keepAlive);
    removeClient(client);
  });
});

router.use(requireAuth);

function shape(o) {
  return {
    id: o.id,
    itemSummary: o.itemSummary,
    totalCents: o.totalCents,
    status: o.status,
    payStatus: o.payStatus,
    pickupAt: o.pickupAt,
    createdAt: o.createdAt,
    customerName: o.customer?.name || "Guest",
  };
}

router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { ownerId: req.user.id, status: { not: "collected" } },
      include: { customer: true },
      orderBy: { pickupAt: "asc" },
    });
    res.json({ orders: orders.map(shape) });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["preparing", "ready", "collected"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const existing = await prisma.order.findFirst({
      where: { id: req.params.id, ownerId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Order not found" });
    const order = await prisma.order.update({
      where: { id: existing.id },
      data: { status },
      include: { customer: true },
    });
    res.json({ order: shape(order) });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;
