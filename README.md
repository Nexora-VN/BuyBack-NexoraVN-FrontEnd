# NexoraVN Frontend Starter

Reusable frontend starter built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, next-intl, TanStack Query, and a minimal shadcn/ui foundation.

## Requirements

- Node.js 20.9 or newer (Node.js 22 recommended)
- npm 10 or newer

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default locale is Vietnamese; the English version is available at `/en`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL used by the shared API client |
| `NEXT_PUBLIC_SITE_URL` | Public frontend URL used for metadata |

Real environment files are ignored. Only `.env.example` should be committed.

## Project structure

```text
src/
├── app/          # App Router routes and layouts
├── components/   # Reusable UI and locale components
├── constants/    # Environment, endpoint, and language constants
├── hooks/        # Shared React hooks
├── i18n/         # next-intl routing and request configuration
├── layouts/      # Header, footer, and page containers
├── lib/          # API client and shared utilities
├── messages/     # Vietnamese and English messages
├── modules/      # Feature modules
├── providers/    # Application and Query providers
├── services/     # Domain API services
├── store/        # Client state stores when needed
├── types/        # Shared TypeScript types
└── utils/        # Framework-agnostic helpers
```

Empty architecture folders contain `.gitkeep` and are ready for new features.

## Internationalization

- Supported locales: `vi`, `en`
- Default locale: `vi`
- Vietnamese routes do not need a prefix: `/`
- English routes use the `/en` prefix

Add UI copy to both files in `src/messages`. Use the navigation helpers from `src/i18n/navigation.ts` for locale-aware links and redirects.

## API client

The shared client lives in `src/lib/api/client.ts` and returns the parsed response payload without assuming a backend envelope.

```ts
import { apiClient } from "@/lib/api/client";

const result = await apiClient.get<MyResponse>("/items", {
  params: { page: 1, limit: 20 },
  timeout: 10_000,
});
```

It supports JSON, `FormData`, query parameters, cancellation, timeouts, and normalized `ApiError` errors. `src/services/example.service.ts` is a replaceable service example.

## Docker

```bash
docker compose up --build
```

The production image uses Next.js standalone output and listens on port `3000`.
