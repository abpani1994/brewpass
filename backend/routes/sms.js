import { Router } from "express";
import prisma from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;
const BASE_URL = process.env.PUBLIC_BASE_URL || "http://localhost:4000";

function twilioConfigured() {
  return Boolean(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM);
}

// Sends via Twilio REST when configured; otherwise records an outbox row
// that stays "queued" and is visible in the app — never a fake "sent".
export async function queueInvite(ownerId, customer) {
  const link = `${BASE_URL}/order/${customer.inviteToken}`;
  const body = `It's BrewPass — tap to set your usual and skip the line: ${link}`;

  if (!twilioConfigured()) {
    const row = await prisma.smsOutbox.create({
      data: { ownerId, phone: customer.phone, body, status: "queued" },
    });
    return { delivery: "queued", configured: false, link, outboxId: row.id };
  }

  try {
    const params = new URLSearchParams();
    params.append("To", customer.phone);
    params.append("From", TWILIO_FROM);
    params.append("Body", body);
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
    const resp = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );
    const status = resp.ok ? "sent" : "failed";
    const row = await prisma.smsOutbox.create({
      data: { ownerId, phone: customer.phone, body, status },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return { delivery: "failed", configured: true, link, outboxId: row.id, error: text };
    }
    return { delivery: "sent", configured: true, link, outboxId: row.id };
  } catch (err) {
    await prisma.smsOutbox.create({
      data: { ownerId, phone: customer.phone, body, status: "failed" },
    });
    return { delivery: "failed", configured: true, link, error: err.message };
  }
}

router.use(requireAuth);

router.get("/outbox", async (req, res) => {
  try {
    const messages = await prisma.smsOutbox.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ configured: twilioConfigured(), messages });
  } catch (err) {
    res.status(500).json({ error: (process.env.NODE_ENV === "production" ? "Internal server error" : err.message) });
  }
});

export default router;