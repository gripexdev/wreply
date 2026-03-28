FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM deps AS builder
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY prisma ./prisma
COPY next.config.ts postcss.config.mjs tsconfig.json ./
COPY next-env.d.ts ./
COPY public ./public
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]
