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
├── main.tsx              - App entry point; sets up QueryClientProvider
├── router.tsx            - React Router setup with BrowserRouter
├── index.css             - Global styles
├── api/                  - API clients and endpoints
│   ├── axios-instance.ts - Axios configuration with interceptors
│   └── coingecko/        - CoinGecko API repository
│       ├── index.ts      - CoinGecko API methods (coingeckoAPI object)
│       └── utils.ts      - API response transformation helpers
├── pages/                - Route components
│   ├── crypto-list.tsx   - Top 50 cryptocurrencies list with search
│   ├── crypto-detail.tsx - Individual cryptocurrency details page
│   └── favorites.tsx     - User's favorited cryptocurrencies
├── components/           - Reusable UI components
│   ├── layout.tsx        - Main layout wrapper with navigation
│   ├── coin-card.tsx     - Cryptocurrency card component
│   ├── coin-list.tsx     - Grid layout for coin cards
│   ├── search-bar.tsx    - Search input with debounce
│   ├── price-chart.tsx   - SVG price chart visualization
│   ├── loading-spinner.tsx - Loading state component
│   ├── error-message.tsx - Error state component
│   ├── empty-state.tsx   - Empty state component
│   └── async-boundary/   - Suspense + Error Boundary wrapper
│       ├── index.tsx     - AsyncBoundary component
│       └── error-boundary/ - Error boundary implementation
├── hooks/                - Custom hooks (state management, side effects)
│   ├── use-favorites.ts  - localStorage persistence for favorite coins
│   └── queries/          - React Query data fetching hooks
│       ├── query-keys.ts - Query key factory definitions
│       ├── use-coins-list.ts - Fetch top 50 coins
│       ├── use-coin-search.ts - Search coins by query
│       ├── use-coin-detail.ts - Fetch detailed coin info
│       └── use-coin-chart.ts - Fetch historical price data
├── utils/                - Utility functions
│   ├── format.ts         - Price/number formatting utilities
│   └── storage.ts        - Favorites repository object
├── types/                - TypeScript types and definitions
│   └── coin.ts           - Cryptocurrency and API types
├── assets/               - Static assets
└── test/
    ├── setup.ts          - Vitest setup (imports jest-dom matchers)
    ├── mocks/            - MSW mock handlers for API testing
    ├── utils/            - Tests for utility functions
    ├── components/       - Tests for components
    ├── hooks/            - Tests for custom hooks
    └── pages/            - Tests for page components
```

## Key Technologies & Patterns

### React Compiler

The React Compiler is enabled in vite.config.ts via babel-plugin-react-compiler. This automatically optimizes components but impacts dev and build performance. Reference: https://react.dev/learn/react-compiler

### API Client Structure & Conventions

**Repository Pattern**

- API clients and utilities are organized as singleton objects (repositories)
- Each repository encapsulates related functions under a single object
- Examples:
  - `coingeckoAPI` (`src/api/coingecko/`): CoinGecko API methods with utility functions
  - `favoritesRepository`: localStorage operations for managing favorite coins
- Benefits: Better code organization, scoped helper functions, consistent interface
- Structure:

  ```typescript
  // src/api/coingecko/utils.ts - Helper functions
  export const transformCoinDetailResponse = (data: CoinGeckoDetail): CoinDetail => { ... };

  // src/api/coingecko/index.ts - API repository
  export const coingeckoAPI = {
    async getMarketList(page = 1) { ... },
    async getCoinDetail(coinId: string) {
      const response = await apiClient.get(...);
      return transformCoinDetailResponse(response.data); // Uses utility function
    },
    async getCoinChart(coinId: string, days: number) { ... },
    async getCoinsPrice(ids: string[]) { ... },
  };

  // Usage
  const coin = await coingeckoAPI.getCoinDetail("bitcoin");
  ```

**API Response Transformation**

- API responses are transformed to match application types at the API layer
- Example: CoinGecko's `/coins/{id}` endpoint returns nested `market_data` structure
- `transformCoinDetailResponse` flattens the response to match `CoinDetail` type
- Rationale: Decouples application logic from API structure changes

**Import Path Convention**
All imports use absolute paths with the `@/` alias (configured in `tsconfig.app.json`):

```typescript
import { useCoinsList } from "@/hooks/queries/use-coins-list";
import type { Coin } from "@/types/coin";
import { formatPrice } from "@/utils/format";
import { coingeckoAPI } from "@/api/coingecko"; // or use transformCoinDetailResponse from @/api/coingecko/utils
```

- `@/api/` - API clients
- `@/components/` - UI components
- `@/hooks/` - Custom hooks
- `@/pages/` - Route components
- `@/types/` - TypeScript types
- `@/utils/` - Utility functions

### Styling

Tailwind CSS v4 is configured via @tailwindcss/vite plugin. Use Tailwind utility classes directly in JSX; no separate CSS files needed for component styles.

### Testing

- **Framework**: Vitest (Jest-compatible)
- **Environment**: jsdom (browser simulation)
- **Setup**: src/test/setup.ts is automatically loaded
- **Test organization**: Centralized in `src/test/` with same structure as source
  ```
  src/test/
  ├── utils/         - Tests for src/utils/*
  ├── components/    - Tests for src/components/*
  ├── hooks/         - Tests for src/hooks/*
  ├── pages/         - Tests for src/pages/*
  └── mocks/         - MSW mock handlers for API testing
  ```
- **Test files**: Use `.test.ts` or `.test.tsx` extension
- **Test configuration**: vite.config.ts configured to discover tests in `src/test/**/*.test.{ts,tsx}`
- **Test patterns**:
  - Basic tests with `describe`/`it`
  - Concurrent tests with `describe.concurrent`
  - Parameterized tests with `it.each`
  - Error/exception testing with `expect().toThrow`
  - To-do tests with `it.todo`
- **Hook testing**: Use `renderHook` from `@testing-library/react` for custom hooks

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
