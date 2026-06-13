import { Router } from "express";
import Stripe from "stripe";
import prisma from "../config/db.js";

const router = Router();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:4000";

const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

export function paymentsConfigured() {
  return Boolean(stripe);
}

// Create a Stripe Checkout session for an order. Returns 503 when unconfigured.
export async function createCheckoutSession(order, customerName) {
  if (!stripe) {
    const e = new Error("payments not configured");
    e.statusCode = 503;
    throw e;
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: order.itemSummary || "BrewPass order" },
          unit_amount: order.totalCents,
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id, customerName },
    success_url: `${BASE_URL}/order/success?order=${order.id}`,
    cancel_url: `${BASE_URL}/order/cancel?order=${order.id}`,
  });
  return session;
}

// Stripe webhook — raw body parsing wired in server.js before json middleware.
router.post("/webhook", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "payments not configured" });
  let event;
  try {
    if (WEBHOOK_SECRET) {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${(process.env.NODE_ENV === "production" ? "Internal server error" : err.message)}` });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId },
          data: { payStatus: "paid", stripeSessionId: session.id },
        });
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;