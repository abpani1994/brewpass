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
// Stripe webhook — authenticated via Stripe signature verification (not JWT).
// Raw body parsing is wired in server.js before json middleware.
router.post("/webhook", async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "payments not configured" });
  // Require a configured signing secret so the webhook is authenticated.
  if (!WEBHOOK_SECRET) {
    return res.status(503).json({ error: "webhook signing secret not configured" });
  }
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).json({ error: "Missing stripe-signature header" });
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${(process.env.NODE_ENV === "production" ? "Invalid signature" : err.message)}` });
  }

  // Validate the parsed event shape before using it.
  if (!event || typeof event.type !== "string" || !event.data || typeof event.data.object !== "object") {
    return res.status(400).json({ error: "Malformed event payload" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId && typeof orderId === "string") {
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