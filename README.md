# JewelFind frontend prototype

JewelFind is a frontend-only Next.js prototype for helping shoppers find jewellery across a curated showroom network. It includes the public shopper journey, showroom workspace, admin operations console, and a configurable demo-state panel.

No backend, database, real authentication, or external API is used. Data is provided through typed repository interfaces and a browser-local mock implementation, so a future API adapter can replace the mock services without rewriting screens.

## Run locally

Requirements: Node.js 20.9 or newer and pnpm.

```bash
cd /Users/krishna/Documents/jewelfind
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production-mode local run:

```bash
pnpm build
pnpm start
```

## Demo access

- Admin: `demo@jewelfind.in` / `jewel123`
- Showroom: `9900001000` / OTP `246810`
- Shopper verification OTP: `246810`
- Seeded tracking reference: `JF-9R5T1BCA`
- Demo controls and data reset: [http://localhost:3000/demo](http://localhost:3000/demo)

Mock changes are saved in browser `localStorage`, allowing admin, showroom, and shopper tabs to share the same evolving demo state.

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

See `FRONTEND_IMPLEMENTATION_PLAN.md` for the frontend architecture and future API-integration path.
