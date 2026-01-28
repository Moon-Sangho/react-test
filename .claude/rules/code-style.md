# Code Style Guide

This document outlines code style conventions and patterns used in this project.

## Server State Management

TanStack Query is configured at the application entry point. Use the `QueryClient` for managing async server state. React Query DevTools are enabled in development.

**Query Key Factory Pattern**

- Query keys are centralized in `src/hooks/queries/query-keys.ts` using the factory pattern
- Example structure:
  ```typescript
  export const queryKeys = {
    coins: {
      all: ["coins"] as const,
      lists: () => [...queryKeys.coins.all, "list"] as const,
      list: (page: number) => [...queryKeys.coins.lists(), { page }] as const,
      details: () => [...queryKeys.coins.all, "detail"] as const,
      detail: (id: string) => [...queryKeys.coins.details(), id] as const,
      charts: () => [...queryKeys.coins.all, "chart"] as const,
      chart: (id: string, days: number) =>
        [...queryKeys.coins.charts(), id, days] as const,
    },
  };
  ```

## Hook Organization

- **Query hooks**: Located in `src/hooks/queries/` using `useSuspenseQuery` pattern
  - Each hook uses the query key factory
  - Returns full `useSuspenseQuery` result object (not just data)
  - Example: `useCoinsList()` returns `UseQueryResult` with `{ data: Coin[], ... }`
  - Consumers destructure data: `const { data: coins } = useCoinsList()`
  - Suspense handles loading, Error Boundary handles errors
  - Colocated tests with `.test.ts` extension
- **Mutation hooks**: Would be located in `src/hooks/mutations/` if needed for mutations
- **Normal hooks**: Located in `src/hooks/` for non-query logic
  - Example: `useFavorites()` manages localStorage state and syncs across tabs
- Each hook file contains a single custom hook that encapsulates logic

## Suspense & Error Boundary Pattern

- Use `AsyncBoundary` component to wrap components that use `useSuspenseQuery`
- `AsyncBoundary` combines `Suspense` (for loading) and Error Boundary (for errors)
- Always provide `pendingFallback` (loading state) and `RejectedFallbackComponent` (error state)
- Example:

  ```typescript
  const CryptoListContent = () => {
    const { data: coins } = useCoinsList(); // Destructure from query result
    // No loading/error handling needed - AsyncBoundary handles it
    return <CoinList coins={coins} />;
  };

  const CryptoList = () => (
    <AsyncBoundary
      pendingFallback={<LoadingSpinner size="lg" message="Loading cryptocurrencies..." />}
      RejectedFallbackComponent={ErrorMessage}
    >
      <CryptoListContent />
    </AsyncBoundary>
  );
  ```

## Type Definitions

- Prefer `type` over `interface` for all type definitions
- Use `type` for unions, intersections, and complex shape definitions
- Example:

  ```typescript
  // Prefer type
  export type Coin = {
    id: string;
    name: string;
    price: number;
  };

  // Over interface
  export interface Coin {
    id: string;
    name: string;
    price: number;
  }
  ```

- Rationale: `type` is more flexible and consistent across the codebase
