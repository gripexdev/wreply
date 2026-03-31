# WReply

WReply helps Moroccan businesses answer WhatsApp messages automatically with rules, business knowledge, and clear activity tracking.

## What’s Included

- Automatic reply rules
- AI knowledge-based replies
- WhatsApp connection setup
- Message history
- Analytics dashboard
- Business settings and default replies

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma
- NextAuth
- OpenAI

## Local Setup

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`

## Demo Account

- Email: `owner@wreply.ma`
- Password: `Password123!`

## Environment

Required values in `.env`:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Main Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:seed
```

## Product Areas

- `/dashboard`
- `/dashboard/rules`
- `/dashboard/messages`
- `/dashboard/analytics`
- `/dashboard/whatsapp`
- `/dashboard/settings`

## Notes

- WhatsApp sending only works with valid WhatsApp Cloud API credentials.
- AI replies only work when `OPENAI_API_KEY` is set.
- Seed data is included so the product is ready to explore locally.
