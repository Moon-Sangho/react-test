import { describe, it, expect } from "vitest";
import { getCoinChart } from "@/hooks/queries/use-coin-chart";
import { COINGECKO_API_BASE_URL } from "@/api/coingekco-api";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("getCoinChart - API Layer", () => {
  it("should fetch chart data with default days parameter (365)", async () => {
    const chartData = await getCoinChart("bitcoin");

    expect(chartData).toHaveProperty("prices");
    expect(Array.isArray(chartData.prices)).toBe(true);
    expect(chartData.prices.length).toBeGreaterThan(0);
  });

  it("should fetch chart data with custom days parameter", async () => {
    const chartData = await getCoinChart("bitcoin", 7);

    expect(Array.isArray(chartData.prices)).toBe(true);
    expect(chartData.prices.length).toBeGreaterThan(0);
  });

  it("should return ChartData with prices, market_caps, and volumes arrays", async () => {
    const chartData = await getCoinChart("bitcoin", 7);

    expect(Array.isArray(chartData.prices)).toBe(true);
    expect(Array.isArray(chartData.market_caps)).toBe(true);
    expect(Array.isArray(chartData.volumes)).toBe(true);
  });

  it("should return prices with valid [timestamp, price] tuples", async () => {
    const chartData = await getCoinChart("bitcoin", 7);

    expect(chartData.prices.length).toBeGreaterThan(0);

    // Verify structure of each price point
    chartData.prices.forEach((dataPoint) => {
      expect(Array.isArray(dataPoint)).toBe(true);
      expect(dataPoint.length).toBe(2);
      expect(typeof dataPoint[0]).toBe("number"); // timestamp
      expect(typeof dataPoint[1]).toBe("number"); // price
      expect(dataPoint[0]).toBeGreaterThan(0); // timestamp should be valid
      expect(dataPoint[1]).toBeGreaterThan(0); // price should be positive
    });
  });

  it("should fetch chart data for different coins", async () => {
    const btcChart = await getCoinChart("bitcoin", 30);
    const ethChart = await getCoinChart("ethereum", 30);

    expect(Array.isArray(btcChart.prices)).toBe(true);
    expect(btcChart.prices.length).toBeGreaterThan(0);

    expect(Array.isArray(ethChart.prices)).toBe(true);
    expect(ethChart.prices.length).toBeGreaterThan(0);
  });

  it("should handle API errors gracefully", async () => {
    // Override handler to return error
    server.use(
      http.get(`${COINGECKO_API_BASE_URL}/coins/:coinId/market_chart`, () =>
        HttpResponse.error(),
      ),
    );

    await expect(getCoinChart("bitcoin")).rejects.toThrow();
  });

  it("should use MSW mock instead of real API", async () => {
    const chartData = await getCoinChart("bitcoin");

    // Verify we're getting mock data (has prices from mock)
    expect(Array.isArray(chartData.prices)).toBe(true);
    expect(chartData.prices.length).toBeGreaterThan(0);
    expect(chartData.prices[0][0]).toBeGreaterThan(0); // timestamp
    expect(chartData.prices[0][1]).toBeGreaterThan(0); // price
  });
});
