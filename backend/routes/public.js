import { Router } from "express";
import prisma from "../config/db.js";
import { broadcast } from "../utils/bus.js";
import { createCheckoutSession, paymentsConfigured } from "./payments.js";

const router = Router();

const REWARD_THRESHOLD = 5;
const PICKUP_MINUTES = 10;

// Fetch a customer's saved usual by invite token (no auth — public PWA).
router.get("/usual/:token", async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { inviteToken: req.params.token },
      include: { owner: { select: { cafeName: true } } },
    });
    if (!customer) return res.status(404).json({ error: "This link is no longer valid" });

    let usualItem = null;
    if (customer.usualItemId) {
      usualItem = await prisma.menuItem.findFirst({
        where: { id: customer.usualItemId, ownerId: customer.ownerId },
      });
    }
    const progress = customer.orderCount % REWARD_THRESHOLD;
    res.json({
      cafeName: customer.owner.cafeName,
      customerName: customer.name,
      usualOrder: customer.usualOrder || (usualItem ? usualItem.name : ""),
      priceCents: usualItem ? usualItem.priceCents : 500,
      rewardProgress: customer.orderCount > 0 && progress === 0 ? REWARD_THRESHOLD : progress,
      paymentsConfigured: paymentsConfigured(),
    });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

// Place a pre-arrival order. payMethod: "pay_now" | "pay_at_store".
router.post("/order/:token", async (req, res) => {
  try {
    const { payMethod } = req.body;
    const customer = await prisma.customer.findUnique({
      where: { inviteToken: req.params.token },
    });
    if (!customer) return res.status(404).json({ error: "This link is no longer valid" });

    let usualItem = null;
    if (customer.usualItemId) {
      usualItem = await prisma.menuItem.findFirst({
        where: { id: customer.usualItemId, ownerId: customer.ownerId },
      });
    }
    const itemSummary = customer.usualOrder || (usualItem ? usualItem.name : "Usual order");
    const totalCents = usualItem ? usualItem.priceCents : 500;
    const pickupAt = new Date(Date.now() + PICKUP_MINUTES * 60 * 1000);

    if (payMethod === "pay_now" && !paymentsConfigured()) {
      return res.status(503).json({ error: "Card payment is not set up. Choose pay at store." });
    }

    const order = await prisma.order.create({
      data: {
        ownerId: customer.ownerId,
        customerId: customer.id,
        itemSummary,
        totalCents,
        status: "preparing",
        payStatus: payMethod === "pay_now" ? "pending" : "pay_at_store",
        pickupAt,
      },
    });

    // Record visit + streak + loyalty count.
    const now = new Date();
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        orderCount: { increment: 1 },
        streak: { increment: 1 },
        lastVisit: now,
      },
    });
    await prisma.visit.create({ data: { customerId: customer.id, visitedAt: now } });

    // Issue a reward when crossing the threshold.
    let rewardUnlocked = false;
    if (updated.orderCount % REWARD_THRESHOLD === 0) {
      await prisma.reward.create({ data: { customerId: customer.id } });
      rewardUnlocked = true;
    }

    broadcast("order", { ownerId: customer.ownerId, id: order.id });

    if (payMethod === "pay_now") {
      const session = await createCheckoutSession(order, customer.name);
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });
      return res.status(201).json({
        order: { id: order.id, pickupAt: order.pickupAt },
        checkoutUrl: session.url,
        rewardUnlocked,
      });
    }

    res.status(201).json({
      order: { id: order.id, pickupAt: order.pickupAt },
      checkoutUrl: null,
      rewardUnlocked,
    });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;