import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const REWARD_THRESHOLD = 5;

router.get("/", async (req, res) => {
  try {
    const ownerId = req.user.id;
    const customers = await prisma.customer.findMany({
      where: { ownerId },
      include: { rewards: { orderBy: { createdAt: "desc" } } },
      orderBy: { orderCount: "desc" },
    });

    const perCustomer = customers.map((c) => {
      const progress = c.orderCount % REWARD_THRESHOLD;
      return {
        id: c.id,
        name: c.name,
        orderCount: c.orderCount,
        progress: c.orderCount > 0 && progress === 0 ? REWARD_THRESHOLD : progress,
        pendingRewards: c.rewards.filter((r) => !r.redeemed).length,
      };
    });

    const redemptionLog = [];
    for (const c of customers) {
      for (const r of c.rewards) {
        redemptionLog.push({
          id: r.id,
          customerName: c.name,
          redeemed: r.redeemed,
          createdAt: r.createdAt,
        });
      }
    }
    redemptionLog.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      rule: { threshold: REWARD_THRESHOLD, reward: "Free drink or snack" },
      perCustomer,
      redemptionLog: redemptionLog.slice(0, 50),
    });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

router.post("/:id/redeem", async (req, res) => {
  try {
    const reward = await prisma.reward.findFirst({
      where: { id: req.params.id, customer: { ownerId: req.user.id } },
    });
    if (!reward) return res.status(404).json({ error: "Reward not found" });
    if (reward.redeemed) return res.status(400).json({ error: "Reward already redeemed" });
    const updated = await prisma.reward.update({
      where: { id: reward.id },
      data: { redeemed: true },
    });
    res.json({ reward: updated });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;