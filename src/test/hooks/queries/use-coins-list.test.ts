import { describe, it, expect } from "vitest";
import { getMarketList } from "@/hooks/queries/use-coins-list";
import { COINGECKO_API_BASE_URL } from "@/api/coingekco-api";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("useCoinsList - API Layer", () => {
  it("should fetch top 50 coins with correct structure", async () => {
    const coins = await getMarketList();

    expect(Array.isArray(coins)).toBe(true);
    expect(coins.length).toBeGreaterThan(0);

    // Verify all coins have required properties
    coins.forEach((coin) => {
      expect(coin).toHaveProperty("id");
      expect(coin).toHaveProperty("symbol");
      expect(coin).toHaveProperty("name");
      expect(coin).toHaveProperty("current_price");
      expect(coin).toHaveProperty("market_cap");
      expect(coin).toHaveProperty("market_cap_rank");
      expect(coin).toHaveProperty("last_updated");

      // Verify types
      expect(typeof coin.id).toBe("string");
      expect(typeof coin.symbol).toBe("string");
      expect(typeof coin.name).toBe("string");
      expect(typeof coin.current_price).toBe("number");
    });
  });

  it("should support pagination with different pages", async () => {
    const page1 = await getMarketList(1);
    const page2 = await getMarketList(2);

    // Both should return arrays of coins
    expect(Array.isArray(page1)).toBe(true);
    expect(Array.isArray(page2)).toBe(true);
    expect(page1.length).toBeGreaterThan(0);
    expect(page2.length).toBeGreaterThan(0);
  });

  it("should handle API errors gracefully", async () => {
    // Override handler to return error
    server.use(
      http.get(`${COINGECKO_API_BASE_URL}/coins/markets`, () =>
        HttpResponse.error(),
      ),
    );

    await expect(getMarketList()).rejects.toThrow();
  });

  it("should use MSW mock instead of real API", async () => {
    const coins = await getMarketList();

    // MSW returns bitcoin and ethereum (from mockCoins in handlers.ts)
    const hasBitcoin = coins.some((c) => c.id === "bitcoin");
    const hasEthereum = coins.some((c) => c.id === "ethereum");

    expect(hasBitcoin).toBe(true);
    expect(hasEthereum).toBe(true);
  });
});
