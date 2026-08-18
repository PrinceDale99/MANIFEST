# Contributing to Manifest

Welcome to Manifest — Zero-Knowledge Freight Tendering Protocol.

## Development Setup

```bash
# 1. Install root dependencies
npm install

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Start proof server (Docker)
docker pull midnightnetwork/proof-server
docker run -d --name manifest-proof-server \
  --restart unless-stopped \
  -p 6300:6300 \
  midnightnetwork/proof-server

# 4. Run tests
npm test

# 5. Start frontend dev server
npm run frontend:dev
```

## Project Conventions

### Compact Contract
- Use `pragma language_version >= 0.19;`
- Sealed ledger fields cannot be modified by exported circuits
- Witness values used in comparisons that branch into ledger updates must use `disclose()` to make the privacy boundary explicit
- Pure helper circuits use `persistentHash` for deterministic derivations

### TypeScript Frontend
- Next.js 14 App Router with `'use client'` directives
- All Midnight SDK calls go through `lib/midnight/`
- Crypto operations use Web Crypto API (`crypto.subtle`)
- Components follow shadcn/ui conventions with Tailwind

### Testing
- Unit tests: circuit logic, state machine transitions, commitment verification
- E2E tests: full auction simulation with tamper detection
- Run `npx vitest run` from the project root

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Include `Generated with Codebuff` footer
