import { describe, it, expect } from "vitest";
import {
  getCoinDetail,
  transformCoinDetailResponse,
} from "@/hooks/queries/use-coin-detail";
import type { CoinGeckoDetail } from "@/types/coin";
import { COINGECKO_API_BASE_URL } from "@/api/coingekco-api";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("transformCoinDetailResponse", () => {
  const createMockCoinGeckoDetail = (
    overrides: Partial<CoinGeckoDetail> = {},
  ): CoinGeckoDetail => ({
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: {
      large: "https://example.com/bitcoin-large.png",
      small: "https://example.com/bitcoin-small.png",
      thumb: "https://example.com/bitcoin-thumb.png",
    },
    market_data: {
      current_price: { usd: 42000 },
      market_cap: { usd: 823000000000 },
      fully_diluted_valuation: { usd: 883000000000 },
      total_volume: { usd: 28000000000 },
      high_24h: { usd: 43000 },
      low_24h: { usd: 41000 },
      price_change_24h: 1200,
      price_change_percentage_24h: 2.94,
      market_cap_change_24h: { usd: 24500000000 },
      market_cap_change_percentage_24h: 3.07,
      circulating_supply: 21000000,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: { usd: 69000 },
      atl: { usd: 67 },
      ath_change_percentage: { usd: -39.13 },
      atl_change_percentage: { usd: 62687.57 },
      ath_date: { usd: "2021-11-10T14:24:11.849Z" },
      atl_date: { usd: "2013-07-06T00:00:00.000Z" },
    },
    market_cap_rank: 1,
    roi: null,
    last_updated: "2024-01-15T10:00:00Z",
    description: {
      en: "Bitcoin is the first and most well-known cryptocurrency.",
    },
    links: {
      homepage: ["https://bitcoin.org"],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: "bitcoin",
      facebook_username: "",
      bitcointalk_thread_id: null,
      telegram_channel_identifier: "",
      subreddit_url: "https://reddit.com/r/bitcoin",
      repos_url: {
        github: ["https://github.com/bitcoin/bitcoin"],
        bitbucket: [],
      },
    },
    categories: ["Layer 1", "Cryptocurrency"],
    sentiment_votes_up_percentage: 75,
    sentiment_votes_down_percentage: 25,
    ...overrides,
  });

  it("should transform complete CoinGecko data to CoinDetail", () => {
    const mockData = createMockCoinGeckoDetail();
    const result = transformCoinDetailResponse(mockData);

    expect(result).toHaveProperty("id", "bitcoin");
    expect(result).toHaveProperty("symbol", "btc");
    expect(result).toHaveProperty("name", "Bitcoin");
    expect(result).toHaveProperty(
      "image",
      "https://example.com/bitcoin-large.png",
    );
    expect(result).toHaveProperty("current_price", 42000);
    expect(result).toHaveProperty("market_cap", 823000000000);
    expect(result).toHaveProperty("market_cap_rank", 1);
  });

  it("should flatten nested market_data structure", () => {
    const mockData = createMockCoinGeckoDetail();
    const result = transformCoinDetailResponse(mockData);

    expect(result.current_price).toBe(mockData.market_data?.current_price?.usd);
    expect(result.market_cap).toBe(mockData.market_data?.market_cap?.usd);
    expect(result.high_24h).toBe(mockData.market_data?.high_24h?.usd);
    expect(result.low_24h).toBe(mockData.market_data?.low_24h?.usd);
    expect(result.ath).toBe(mockData.market_data?.ath?.usd);
    expect(result.atl).toBe(mockData.market_data?.atl?.usd);
  });

  it("should use large image when available", () => {
    const mockData = createMockCoinGeckoDetail({
      image: {
        large: "https://example.com/large.png",
        small: "https://example.com/small.png",
      },
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.image).toBe("https://example.com/large.png");
  });

  it("should fallback to small image when large is missing", () => {
    const mockData = createMockCoinGeckoDetail({
      image: {
        small: "https://example.com/small.png",
      },
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.image).toBe("https://example.com/small.png");
  });

  it("should use empty string when no image available", () => {
    const mockData = createMockCoinGeckoDetail({
      image: undefined,
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.image).toBe("");
  });

  it("should default current_price to 0 when market_data is missing", () => {
    const mockData = createMockCoinGeckoDetail({
      market_data: undefined,
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.current_price).toBe(0);
  });

  it("should default market_cap to null when market_data is missing", () => {
    const mockData = createMockCoinGeckoDetail({
      market_data: undefined,
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.market_cap).toBeNull();
  });

  it("should handle null values in market_data fields", () => {
    const mockData = createMockCoinGeckoDetail({
      market_data: {
        current_price: { usd: 42000 },
        market_cap: { usd: null },
        high_24h: { usd: null },
      },
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.market_cap).toBeNull();
    expect(result.high_24h).toBeNull();
  });

  it("should transform description and provide defaults", () => {
    const mockData = createMockCoinGeckoDetail({
      description: { en: "Bitcoin is a cryptocurrency." },
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.description).toEqual({ en: "Bitcoin is a cryptocurrency." });
  });

  it("should provide default links structure when missing", () => {
    const mockData = createMockCoinGeckoDetail({
      links: undefined,
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.links).toEqual({
      homepage: [],
      blockchain_site: [],
      official_forum_url: [],
      chat_url: [],
      announcement_url: [],
      twitter_screen_name: "",
      facebook_username: "",
      bitcointalk_thread_id: null,
      telegram_channel_identifier: "",
      subreddit_url: "",
      repos_url: {
        github: [],
        bitbucket: [],
      },
    });
  });

  it("should default categories to empty array when missing", () => {
    const mockData = createMockCoinGeckoDetail({
      categories: undefined,
    });
    const result = transformCoinDetailResponse(mockData);

    expect(result.categories).toEqual([]);
  });

  it("should return CoinDetail type with all required properties", () => {
    const mockData = createMockCoinGeckoDetail();
    const result = transformCoinDetailResponse(mockData);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("symbol");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("image");
    expect(result).toHaveProperty("current_price");
    expect(result).toHaveProperty("market_cap");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("links");
    expect(result).toHaveProperty("categories");
  });
});

describe("getCoinDetail - API Layer", () => {
  it("should fetch detailed information for bitcoin", async () => {
    const coin = await getCoinDetail("bitcoin");

    expect(coin).toHaveProperty("id", "bitcoin");
    expect(coin).toHaveProperty("symbol", "btc");
    expect(coin).toHaveProperty("name", "Bitcoin");
    expect(coin).toHaveProperty("current_price");
    expect(coin).toHaveProperty("market_cap");
  });

  it("should fetch detailed information for ethereum", async () => {
    const coin = await getCoinDetail("ethereum");

    expect(coin).toHaveProperty("id", "ethereum");
    expect(coin).toHaveProperty("symbol", "eth");
    expect(coin).toHaveProperty("name", "Ethereum");
  });

  it("should return CoinDetail with all required properties", async () => {
    const coin = await getCoinDetail("bitcoin");

    // Verify all essential properties are present
    expect(coin).toHaveProperty("id");
    expect(coin).toHaveProperty("symbol");
    expect(coin).toHaveProperty("name");
    expect(coin).toHaveProperty("image");
    expect(coin).toHaveProperty("current_price");
    expect(coin).toHaveProperty("market_cap");
    expect(coin).toHaveProperty("market_cap_rank");
    expect(coin).toHaveProperty("description");
    expect(coin).toHaveProperty("links");
    expect(coin).toHaveProperty("categories");

    // Verify structure of nested properties
    expect(coin.description).toHaveProperty("en");
    expect(coin.links).toHaveProperty("homepage");
    expect(coin.links).toHaveProperty("blockchain_site");
    expect(Array.isArray(coin.categories)).toBe(true);
  });

  it("should apply response transformation (flatten market_data)", async () => {
    const coin = await getCoinDetail("bitcoin");

    // Verify data is transformed (not nested in market_data)
    expect(typeof coin.current_price).toBe("number");
    // market_cap can be number or null, so check it's not an object from API response
    expect(
      coin.market_cap === null || typeof coin.market_cap === "number",
    ).toBe(true);
    // high_24h can also be null
    expect(coin.high_24h === null || typeof coin.high_24h === "number").toBe(
      true,
    );
  });

  it("should throw error for non-existent coin", async () => {
    await expect(getCoinDetail("nonexistentcoin")).rejects.toThrow();
  });

  it("should handle API errors gracefully", async () => {
    // Override handler to return error
    server.use(
      http.get(`${COINGECKO_API_BASE_URL}/coins/:coinId`, () =>
        HttpResponse.error(),
      ),
    );

    await expect(getCoinDetail("bitcoin")).rejects.toThrow();
  });

  it("should use MSW mock instead of real API", async () => {
    const coin = await getCoinDetail("bitcoin");

    // Verify we're getting mock data (not real API)
    expect(coin.id).toBe("bitcoin");
    expect(coin.name).toBe("Bitcoin");
  });
});
