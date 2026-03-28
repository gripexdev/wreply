# WReply Foundation

WReply is a production-oriented SaaS foundation for a WhatsApp auto-reply platform aimed at Moroccan businesses. This step sets up the architecture, auth flow, database schema, dashboard shell, and developer tooling without implementing WhatsApp automation, billing, or analytics logic yet.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma ORM
- NextAuth credentials flow
- Zod validation
- Docker
- ESLint and Prettier

## Why NextAuth

This foundation uses `next-auth` instead of Clerk because it keeps authentication inside the application stack, works naturally with Prisma and PostgreSQL, and avoids introducing a second hosted platform before the core product workflow is in place.

## Project Structure

```text
.
|-- prisma/
|   |-- schema.prisma
|   `-- seed.ts
|-- src/
|   |-- app/
|   |   |-- (app)/
|   |   |   |-- dashboard/
|   |   |   |   `-- page.tsx
|   |   |   `-- layout.tsx
|   |   |-- (auth)/
|   |   |   |-- sign-in/
|   |   |   |   `-- page.tsx
|   |   |   |-- sign-up/
|   |   |   |   `-- page.tsx
|   |   |   `-- layout.tsx
|   |   |-- (marketing)/
|   |   |   `-- page.tsx
|   |   |-- api/
|   |   |   |-- auth/
|   |   |   |   |-- [...nextauth]/
|   |   |   |   |   `-- route.ts
|   |   |   |   `-- register/
|   |   |   |       `-- route.ts
|   |   |   `-- health/
|   |   |       `-- route.ts
|   |   |-- globals.css
|   |   `-- layout.tsx
|   |-- components/
|   |   |-- auth/
|   |   |-- common/
|   |   |-- dashboard/
|   |   `-- ui/
|   |-- config/
|   |-- database/
|   |-- hooks/
|   |-- lib/
|   |   `-- validation/
|   |-- services/
|   |   |-- auth/
|   |   |-- dashboard/
|   |   `-- workspaces/
|   `-- types/
|-- Dockerfile
`-- docker-compose.yml
```

## Environment Variables

Copy `.env.example` to `.env` and set real values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`

## Local Setup

1. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Prisma client and apply the schema:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Seed the database:

   ```bash
   npm run db:seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Open:

   ```text
   http://localhost:3000
   ```

## Seeded Login

- Email: `owner@wreply.ma`
- Password: `Password123!`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`
- `npm run db:deploy`
- `npm run db:reset`

## Current Scope

Complete in this step:

- Marketing landing page
- Auth pages and credentials flow
- Protected dashboard route and shell
- Prisma schema for the core SaaS domain
- Seed script
- Docker and developer tooling

Intentionally not implemented yet:

- WhatsApp webhook handling
- FAQ or rules CRUD workflows
- Billing and subscription provider integration
- Analytics pipelines
- Advanced onboarding or workspace member management
