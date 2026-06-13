# BrewPass

A no-download PWA loyalty and pre-arrival reorder tool for indie cafes. Turn
commuter regulars into confirmed daily orders with one SMS link — no app store,
no wait, no invisible churn.

## What it does

- One-tap reorder — regulars save their usual once, then confirm each morning
  with a single tap. The order lands on the owner's live board with a ten-minute
  pickup window.
- Owner dashboard — daily regulars, visit streaks, paid-and-pending revenue, and
  a five-weekday absence alert that flags regulars who are slipping away.
- Menu builder — seeded with lattes, mocha, matcha, and americano; full CRUD with
  availability toggles and modifier groups.
- Loyalty — a free drink unlocks automatically after five online orders, with a
  5-pip progress strip and a redemption log.
- Payments — pay now by card via Stripe, or pay at the store.

## Stack

- Backend: Node.js, Express, Prisma, PostgreSQL
- Frontend: React, Vite, Tailwind, framer-motion, Lenis
- Realtime: Server-Sent Events (live orders board)

## Run with Docker (one command)

Copy the example env file and edit it:

    cp .env.example .env

In .env, set a strong POSTGRES_PASSWORD and a JWT_SECRET. Generate a secret with:

    openssl rand -base64 48

Then build and start everything:

    docker compose up --build

The app serves the API and the built SPA on http://localhost:4000

## Configuration

- POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB (required) — database credentials.
- JWT_SECRET (required) — signs owner sessions, must be at least 32 characters.
- PUBLIC_BASE_URL (required) — used to build SMS invite links.
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET (optional) — enables pay-now card
  checkout. Without it, pay-now returns a clear "not set up" state and
  pay-at-store still works.
- TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER (optional) — sends
  invite links by SMS. Without it, every invite is recorded in the outbox as
  queued rather than pretending to send.

## Local development

Backend:

    cd backend
    npm install
    npm run dev

Frontend (separate terminal):

    cd frontend
    npm install
    npm run dev

The Vite dev server proxies /api to the backend on port 4000.

## Project layout

- backend/ — Express API, Prisma schema, routes, integrations
- frontend/ — React SPA (landing page, owner app, customer reorder PWA)