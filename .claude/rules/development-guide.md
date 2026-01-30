# Development Guide

This guide covers debugging, performance optimization, troubleshooting, and common development patterns for the crypto-tracker project.

## Debugging

### Browser DevTools

**React DevTools Extension** (Required)
- Install from Chrome Web Store or Firefox Add-ons
- Components tab: Inspect component tree, props, state
- Profiler tab: Identify slow rendering components
- Settings: Enable "Highlight updates when components render"

**React Query DevTools**
- Available in development via floating badge in bottom corner
- Inspect query state, cache, history
- Manually trigger refetch/invalidation
- View query lifecycle and timing

**VS Code Debugger**
- Breakpoints: Click line number or press F9
- Launch configuration: `.vscode/launch.json` (create if needed)
- Conditional breakpoints: Right-click → Add Conditional Breakpoint
- Logpoints: Right-click → Add Logpoint (logs without pausing)

Example `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vite",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### Network Debugging

- Chrome DevTools Network tab: Inspect API calls, timing, payload
- Filter by XHR/Fetch for API requests
- Axios interceptors in `src/api/axios-instance.ts` log requests/responses

### Console Logging

- Minimal logging in production code (use DevTools instead)
- Log API responses in axios interceptor for debugging
- Use query keys to understand data flow: `console.log(queryKey)`

## Performance Optimization

### React Compiler Benefits

The React Compiler (babel-plugin-react-compiler) automatically optimizes:
- Eliminates unnecessary re-renders between state changes
- Memoizes expensive computations
- Optimizes closure captures

Enabled in vite.config.ts. Use React DevTools Profiler to see impact.

### React Query Caching

Query stale times and cache times are configured in each hook:
- `staleTime: 1000 * 60` - Data is fresh for 1 minute
- `gcTime: 1000 * 60 * 5` - Cached data kept for 5 minutes after disuse
- Adjust based on data update frequency (cryptocurrencies update frequently)

For real-time data, consider:
- Reducing `staleTime` (e.g., `staleTime: 1000 * 30` for 30 seconds)
- Using `refetchInterval` for periodic updates
- WebSocket integration for live updates

### Code Splitting

Currently all code is bundled together. For large apps:
- Use React Router's `lazy()` for route-based splitting
- Lazy load heavy components with `React.lazy()`
- Analyze bundle with `npm run build` and review size

### Avoiding Re-renders

- `useSuspenseQuery` already optimizes query updates
- SearchBar uses `useCallback` to stabilize callbacks (avoid unnecessary re-renders)
- Price chart memoizes normalized data calculations
- Use `useMemo` only for expensive computations, not simple data

### Memory Leaks

Common patterns to avoid:
- Don't forget cleanup in `useEffect` (not applicable here - using Query hooks)
- Event listeners: Always remove in cleanup function
- Timers: Always clear in cleanup function
- Subscriptions: Always unsubscribe in cleanup function

## Troubleshooting

### ESLint Errors

**Error: "Cannot find module '@tanstack/eslint-plugin-query'"**
- Likely cause: npm/yarn used instead of pnpm
- Fix: `pnpm install` to restore pnpm lockfile

**ESLint not running**
- Run `pnpm lint` to see specific error
- Check eslint.config.js for syntax errors
- Try: `pnpm lint --reset-cache`

### Tests Failing Unexpectedly

**"Cannot find module" errors**
- Ensure path aliases are correct (`@/` prefix)
- Verify files exist at import paths
- Check tsconfig.app.json paths configuration

**API mock not working**
- Verify handler exists in `src/test/mocks/handlers.ts`
- Check MSW is properly set up in `src/test/setup.ts`
- Run `pnpm test:ui` to inspect mock matching

**Async/await test timeouts**
- Wrap async operations in `vi.waitFor()` or `screen.findBy*`
- Use `renderHook(..., { wrapper: QueryClientProvider })`
- Check that promises are properly awaited

### Build Failures

**"Cannot find declaration file"**
- Install missing types: `pnpm add -D @types/package-name`
- Update tsconfig.app.json if custom types needed
- Run `pnpm build` to verify

**Build size too large (> 500KB gzipped)**
- Analyze with `npm run build -- --ssrManifest`
- Check for missing tree-shaking (unused exports)
- Consider route-based code splitting with React Router lazy

### API Errors

**404 Not Found on CoinGecko**
- Verify coin ID is lowercase (e.g., "bitcoin" not "Bitcoin")
- Check API endpoint exists in coingeckoAPI
- CoinGecko free tier has rate limits (~10 req/sec)

**CORS Errors**
- CoinGecko API allows CORS on free tier
- If CORS fails, API may be temporarily blocked
- Check network tab to see actual response

**Rate Limiting**
- Axios interceptor in axios-instance.ts handles rate limit headers
- Query staleness reduces unnecessary requests
- Stagger requests if needed: adjust `refetchInterval`

### Performance Issues

**App feels slow on load**
- Check React DevTools Profiler for slow components
- Verify Network tab shows reasonable API response times
- Check if all data dependencies are optimized with Query

**Search/Filter is laggy**
- SearchBar has 300ms debounce to reduce query spam
- Use React DevTools Profiler during typing
- Check if SearchResults re-render unnecessarily

**Chart rendering is slow**
- SVG calculations in price-chart.tsx may be expensive with many data points
- Consider downsampling historical data (e.g., every 5th point)
- Use React DevTools Profiler to measure chart rendering time

## Common Development Patterns

### Adding a New Query Hook

1. Create file: `src/hooks/queries/use-resource.ts`
2. Add to `src/hooks/queries/query-keys.ts`:
   ```typescript
   resource: {
     all: ["resource"] as const,
     detail: (id: string) => [...queryKeys.resource.all, id] as const,
   }
   ```
3. Implement hook with `useSuspenseQuery`:
   ```typescript
   export const useResource = (id: string) =>
     useSuspenseQuery({
       queryKey: queryKeys.resource.detail(id),
       queryFn: () => fetchResource(id),
     });
   ```
4. Wrap consumer in `AsyncBoundary` with loading/error states

### Updating API Responses

When API response structure changes:
1. Update type in `src/types/coin.ts`
2. Update transformation function in `src/api/*/utils.ts`
3. Update MSW handler in `src/test/mocks/handlers.ts`
4. Run tests to verify: `pnpm test:run`

### Adding Component Tests

1. Create file: `src/test/components/component-name.test.tsx`
2. Follow AAA pattern (Arrange, Act, Assert):
   ```typescript
   it("renders coin card with name", () => {
     // Arrange
     const coin = { id: "bitcoin", name: "Bitcoin", ... };

     // Act
     render(<CoinCard coin={coin} />);

     // Assert
     expect(screen.getByText("Bitcoin")).toBeInTheDocument();
   });
   ```
3. For query hooks, wrap with QueryClientProvider

### Adding a New Component

1. Create file: `src/components/component-name.tsx`
2. Follow component structure:
   ```typescript
   import type { ComponentProps } from "react";

   type ComponentNameProps = {
     // Define props here
   };

   export const ComponentName = ({ ...props }: ComponentNameProps) => {
     return (
       <div>
         {/* Component content */}
       </div>
     );
   };
   ```
3. Use Tailwind for styling (no separate CSS files)
4. Export from parent index if creating subdirectory
5. Add tests in `src/test/components/`

### Adding a New Page/Route

1. Create file: `src/pages/page-name.tsx`
2. Implement with query hooks and AsyncBoundary:
   ```typescript
   const PageContent = () => {
     const { data } = useQuery();
     return <div>{/* Page content */}</div>;
   };

   export const Page = () => (
     <AsyncBoundary
       pendingFallback={<LoadingSpinner />}
       RejectedFallbackComponent={ErrorMessage}
     >
       <PageContent />
     </AsyncBoundary>
   );
   ```
3. Add route to `src/router.tsx`
4. Add navigation link in `src/components/layout.tsx` if needed

### Working with localStorage

Use the repository pattern like `favoritesRepository`:
```typescript
// Create src/hooks/use-resource/resource-repository.ts
export const resourceRepository = {
  RESOURCE_KEY: "resource",

  get(id: string) {
    try {
      const stored = localStorage.getItem(`${this.RESOURCE_KEY}:${id}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      console.error("Failed to read from localStorage");
      return null;
    }
  },

  set(id: string, value: unknown) {
    try {
      localStorage.setItem(`${this.RESOURCE_KEY}:${id}`, JSON.stringify(value));
    } catch {
      console.error("Failed to write to localStorage");
    }
  },
};

// Use in hook:
export const useResource = (id: string) => {
  const [resource, setResource] = useState(() => resourceRepository.get(id));

  return { resource, setResource };
};
```

Benefits:
- Encapsulates localStorage details
- Easy to test and mock
- Consistent error handling
- Single responsibility
