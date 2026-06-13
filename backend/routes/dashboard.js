import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { customerStatus, weekdaysBetween } from "../utils/streaks.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const ownerId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [customers, todayOrders] = await Promise.all([
      prisma.customer.findMany({ where: { ownerId }, orderBy: { streak: "desc" } }),
      prisma.order.findMany({
        where: { ownerId, createdAt: { gte: startOfDay } },
      }),
    ]);

    const regulars = customers.map((c) => ({
      id: c.id,
      name: c.name,
      usualOrder: c.usualOrder,
      streak: c.streak,
      lastVisit: c.lastVisit,
      status: customerStatus(c.lastVisit),
    }));

    const absent = regulars
      .filter((r) => r.lastVisit && weekdaysBetween(r.lastVisit, new Date()) >= 5)
      .slice(0, 8);

    const confirmedToday = todayOrders.length;
    const revenueCents = todayOrders
      .filter((o) => o.payStatus === "paid")
      .reduce((s, o) => s + o.totalCents, 0);
    const pendingCents = todayOrders
      .filter((o) => o.payStatus !== "paid")
      .reduce((s, o) => s + o.totalCents, 0);

    res.json({
      stats: {
        confirmedToday,
        revenueCents,
        pendingCents,
        activeRegulars: regulars.filter((r) => r.status === "active").length,
        totalRegulars: regulars.length,
      },
      regulars: regulars.slice(0, 12),
      absenceAlerts: absent,
    });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;