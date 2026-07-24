# FunPall — Gaming Items Marketplace g

A peer-to-peer marketplace for buying and selling in-game currency, accounts, items, skins, and boosting services. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and NextAuth.js.

Inspired by [FunPay.com](https://funpay.com).

## Features

- **Browse games & offers** — Homepage with popular games, category filters, sorting, and price filters
- **Offer details** — Full listing view with seller trust signals (rating, verified badge, online status)
- **Escrow checkout flow** — Mock payment with order statuses: Pending → Paid → Delivered → Completed
- **User dashboard** — Purchases, sales, listings management, balance
- **Seller profiles** — Active listings and buyer reviews
- **Messaging** — Chat UI with polling (WebSocket/Pusher ready for future integration)
- **Authentication** — Email/password via NextAuth.js (optional Google OAuth)
- **Dark mode** — Toggle in header
- **Responsive** — Mobile-first layout

## Tech Stack

- Next.js 14+ (App Router, Server Components)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui-style components
- Zustand (cart, filters)
- React Hook Form + Zod
- Prisma ORM + PostgreSQL
- NextAuth.js

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

Copy the example env file and update values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |

Optional:

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed demo data
npm run db:seed
```

Alternatively, for quick prototyping without migrations:

```bash
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

After seeding, log in with any of these (password: `password123`):

| Email | Role |
|-------|------|
| `buyer@funpall.com` | Buyer ($500 balance) |
| `seller1@funpall.com` | Verified seller |
| `seller2@funpall.com` | Verified seller |
| `seller3@funpall.com` | Seller |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST API with Zod validation
│   ├── games/              # Game category & offer pages
│   ├── checkout/           # Order checkout flow
│   ├── dashboard/          # User dashboard & listing creation
│   ├── messages/           # Chat UI
│   ├── sellers/            # Seller profile pages
│   └── login|register/     # Auth pages
├── components/
│   ├── marketplace/        # GameCard, OfferCard, RatingStars, etc.
│   ├── layout/             # Header, Footer
│   └── ui/                 # Base UI components
├── lib/                    # Auth, Prisma, validations, utils
├── store/                  # Zustand stores
└── generated/prisma/       # Prisma client (after generate)
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/games` | List all games |
| GET | `/api/games/[slug]/listings` | Filtered listings for a game |
| GET/POST | `/api/listings` | User listings CRUD |
| GET/PATCH/DELETE | `/api/listings/[id]` | Single listing |
| GET/POST | `/api/orders` | Orders |
| PATCH | `/api/orders/[id]` | Update order status |
| GET | `/api/sellers/[id]` | Seller profile |
| GET/POST | `/api/conversations` | Chat conversations |
| POST | `/api/conversations/[id]` | Send message |

## Out of Scope (v1)

- Real payment gateway integration
- Real-time WebSocket chat (polling used instead)
- Admin moderation panel
- Withdrawals

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT — Demo project for educational purposes.
