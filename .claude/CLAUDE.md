# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + TypeScript + Vite project with React Router for navigation, TanStack Query for server state management, Tailwind CSS for styling, and Vitest for testing. The React Compiler is enabled for optimized component performance.

## Common Commands

### Development

- `pnpm dev` - Start Vite development server with HMR
- `pnpm build` - Build for production (runs TypeScript check + Vite build)
- `pnpm preview` - Preview production build locally

### Testing

- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with interactive UI dashboard
- `pnpm test:coverage` - Generate coverage report
- To run a single test file: `pnpm test:run src/utils/number.test.ts`
- To run tests matching a pattern: `pnpm test -t "add"` (in watch mode)

### Linting & Type Checking

- `pnpm lint` - Run ESLint on all TypeScript/TSX files
- `pnpm build` also runs TypeScript type checking via `tsc -b`

## Project Structure

```
src/
├── main.tsx                     - App entry point; sets up QueryClientProvider
├── router.tsx                   - React Router setup with BrowserRouter
├── index.css                    - Global styles
├── api/                         - API clients and utilities
│   ├── create-api-client.ts     - Axios client factory with interceptors
│   └── coingekco-api.ts         - CoinGecko API endpoints
├── pages/                       - Route page components
│   ├── home.tsx                 - Landing/home page
│   ├── crypto-list.tsx          - Top 50 cryptocurrencies list with search
│   ├── crypto-detail.tsx        - Individual cryptocurrency details page
│   ├── favorites.tsx            - User's favorited cryptocurrencies
│   └── tests/                   - Page component tests
├── components/                  - Reusable UI components
│   ├── layout.tsx               - Main layout wrapper with navigation
│   ├── coin-card.tsx            - Cryptocurrency card component
│   ├── coin-list.tsx            - Grid layout for coin cards
│   ├── search-bar.tsx           - Search input with debounce
│   ├── price-chart.tsx          - SVG price chart visualization
│   ├── loading-spinner.tsx      - Loading state component
│   ├── error-message.tsx        - Error state component
│   ├── empty-state.tsx          - Empty state component
│   ├── async-boundary/          - Suspense + Error Boundary wrapper
│   │   ├── index.tsx            - AsyncBoundary component
│   │   ├── types.ts             - AsyncBoundary type definitions
│   │   └── error-boundary/      - Error boundary implementation
│   │       ├── index.tsx        - Error boundary component
│   │       └── types.ts         - Error boundary type definitions
│   └── tests/                   - Component tests
├── hooks/                       - Custom hooks
│   ├── queries/                 - React Query data fetching hooks
│   │   ├── query-keys.ts        - Query key factory definitions
│   │   ├── use-coins-list.ts    - Fetch top 50 coins
│   │   ├── use-coin-search.ts   - Search coins by query
│   │   ├── use-coin-detail.ts   - Fetch detailed coin info
│   │   ├── use-coin-chart.ts    - Fetch historical price data
│   │   └── tests/               - Query hook tests
│   └── use-favorites/           - Favorites state management
│       ├── index.ts             - useFavorites hook
│       ├── favorites-repository.ts - localStorage operations
│       └── tests/               - Favorites hook tests
├── utils/                       - Utility functions
│   ├── format.ts                - Price/number formatting utilities
│   ├── number.ts                - Numeric computation utilities
│   ├── setup-tests.ts           - Test setup utilities
│   └── tests/                   - Utility function tests
├── types/                       - TypeScript type definitions
│   └── coin.ts                  - Cryptocurrency and API types
├── __mocks__/                   - MSW mock handlers for API testing
│   ├── handlers.ts              - MSW request handlers
│   └── server.ts                - MSW server setup
└── index.css                    - Global Tailwind CSS styles
```

## Key Technologies & Patterns

### React Compiler

The React Compiler is enabled in vite.config.ts via babel-plugin-react-compiler. This automatically optimizes components but impacts dev and build performance. Reference: https://react.dev/learn/react-compiler

### API Client Structure & Conventions

**API Client Factory Pattern**

- `src/api/create-api-client.ts` exports a factory function that creates configured Axios instances
- Supports optional request/response interceptors for customization
- CoinGecko API client is created in `src/api/coingekco-api.ts`
- Example structure:

  ```typescript
  // src/api/create-api-client.ts - Factory
  export const createApiClient = ({ baseURL, interceptors }: CreateApiClientOptions) => {
    const client = axios.create({ baseURL, timeout: 10000 });
    // Apply interceptors if provided
    return client;
  };

  // src/api/coingekco-api.ts - API client instance
  export const coingeckoApi = createApiClient({
    baseURL: COINGECKO_API_BASE_URL,
    interceptors: { /* response interceptors */ },
  });

  // Usage in hooks
  export const getMarketList = async (page = 1) =>
    (await coingeckoApi.get<Coin[]>("/coins/markets", { params: { ... } })).data;
  ```

**Collocated API Functions in Query Hooks**

- API functions are colocated within query hook files for related code organization
- Each hook file contains: helper functions (API calls) → then the hook itself
- Benefits: Single responsibility, easier navigation, related code together
- Example: `src/hooks/queries/use-coins-list.ts` contains both `getMarketList` function and `useCoinsList` hook
- Query functions are called directly without a separate API repository object

**Import Path Convention**

All imports use absolute paths with the `@/` alias (configured in `tsconfig.app.json`):

```typescript
import { useCoinsList } from "@/hooks/queries/use-coins-list";
import type { Coin } from "@/types/coin";
import { formatPrice } from "@/utils/format";
import { coingeckoApi } from "@/api/coingekco-api";
```

- `@/api/` - API client and utilities
- `@/components/` - UI components (layout, coin-card, loading-spinner, error-message, etc.)
- `@/hooks/` - Custom hooks (queries, use-favorites)
- `@/pages/` - Route page components (home, crypto-list, crypto-detail, favorites)
- `@/types/` - TypeScript type definitions
- `@/utils/` - Utility functions (format, number, setup-tests)

### Styling

Tailwind CSS v4 is configured via @tailwindcss/vite plugin. Use Tailwind utility classes directly in JSX; no separate CSS files needed for component styles.

### Testing

- **Framework**: Vitest (Jest-compatible)
- **Environment**: jsdom (browser simulation)
- **Setup**: `src/utils/setup-tests.ts` is automatically loaded (imports jest-dom matchers)
- **Test organization**: Co-located with source code in `tests/` subdirectories
  ```
  src/
  ├── components/tests/        - Tests for src/components/*
  ├── hooks/queries/tests/      - Tests for src/hooks/queries/*
  ├── hooks/use-favorites/tests/ - Tests for src/hooks/use-favorites/*
  ├── pages/tests/              - Tests for src/pages/*
  ├── utils/tests/              - Tests for src/utils/*
  ├── __mocks__/                - MSW mock handlers for API testing
  │   ├── handlers.ts           - MSW request handlers
  │   └── server.ts             - MSW server setup
  ```
- **Test files**: Use `.test.ts` or `.test.tsx` extension
- **Test configuration**: vite.config.ts configured to discover tests in `src/**/*.test.{ts,tsx}`
- **Test patterns**:
  - Basic tests with `describe`/`it`
  - Concurrent tests with `describe.concurrent`
  - Parameterized tests with `it.each`
  - Error/exception testing with `expect().toThrow`
  - To-do tests with `it.todo`
- **Hook testing**: Use `renderHook` from `@testing-library/react` for custom hooks
- **MSW Setup**: Mock server is configured in `src/__mocks__/server.ts` and handlers in `src/__mocks__/handlers.ts`

### Type Checking

Strict mode enabled in tsconfig.app.json with:

- `noUnusedLocals` and `noUnusedParameters` - removes dead code warnings
- `noFallthroughCasesInSwitch` - prevents forgotten case breaks
- `noUncheckedSideEffectImports` - flags potentially problematic side-effect imports

### ESLint

Uses flat config (eslint.config.js). Includes:

- typescript-eslint recommended rules
- react-hooks rules
- react-refresh rules (HMR support)
- TanStack Query plugin rules

## TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext
- **Path resolution**: bundler mode
- **JSX**: react-jsx (automatic runtime)
- TypeScript references split into tsconfig.app.json (source) and tsconfig.node.json (build tools)

## Package Manager

Uses pnpm with workspace-aware lock file (pnpm-lock.yaml). Vite is overridden to use rolldown-vite (faster build tool).
