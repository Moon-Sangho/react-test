import { describe, it, expect } from "vitest";
import { searchCoins } from "@/hooks/queries/use-coin-search";
import { COINGECKO_API_BASE_URL } from "@/api/coingekco-api";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("useCoinSearch - API Layer", () => {
  it("should search coins by name and return SearchResponse structure", async () => {
    const result = await searchCoins("bitcoin");

    // Verify SearchResponse structure
    expect(result).toHaveProperty("coins");
    expect(result).toHaveProperty("exchanges");
    expect(result).toHaveProperty("icos");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("nfts");

    // Verify coins array
    expect(Array.isArray(result.coins)).toBe(true);
    expect(result.coins.length).toBeGreaterThan(0);

    // Verify coin properties
    result.coins.forEach((coin) => {
      expect(coin).toHaveProperty("id");
      expect(coin).toHaveProperty("name");
      expect(coin).toHaveProperty("symbol");
      expect(typeof coin.id).toBe("string");
      expect(typeof coin.name).toBe("string");
      expect(typeof coin.symbol).toBe("string");
    });
  });

  it("should search coins by symbol", async () => {
    const result = await searchCoins("btc");

    expect(Array.isArray(result.coins)).toBe(true);
    expect(result.coins.length).toBeGreaterThan(0);
  });

  it("should be case-insensitive", async () => {
    const resultLower = await searchCoins("bitcoin");
    const resultUpper = await searchCoins("BITCOIN");

    expect(resultLower.coins.length).toBe(resultUpper.coins.length);
  });

  it("should support partial matching", async () => {
    const result = await searchCoins("bit");

    expect(Array.isArray(result.coins)).toBe(true);
    expect(result.coins.length).toBeGreaterThan(0);
  });

  it("should return empty array for non-existent coins", async () => {
    const result = await searchCoins("nonexistentcoin12345xyz");

    expect(Array.isArray(result.coins)).toBe(true);
    expect(result.coins.length).toBe(0);
  });

  it("should find ethereum by name and symbol", async () => {
    const resultByName = await searchCoins("ethereum");
    const resultBySymbol = await searchCoins("eth");

    // Search by name
    const ethereumByName = resultByName.coins.find((c) => c.symbol === "eth");
    expect(ethereumByName).toBeDefined();

    // Search by symbol
    const ethereumBySymbol = resultBySymbol.coins.find(
      (c) => c.id === "ethereum",
    );
    expect(ethereumBySymbol).toBeDefined();
  });

  it("should handle API errors gracefully", async () => {
    // Override handler to return error
    server.use(
      http.get(`${COINGECKO_API_BASE_URL}/search`, () => HttpResponse.error()),
    );

    await expect(searchCoins("bitcoin")).rejects.toThrow();
  });

  it("should use MSW mock instead of real API", async () => {
    const result = await searchCoins("bitcoin");

    // MSW returns bitcoin and ethereum (from mockCoins in handlers.ts)
    const hasBitcoin = result.coins.some((c) => c.id === "bitcoin");
    expect(hasBitcoin).toBe(true);
  });
});
