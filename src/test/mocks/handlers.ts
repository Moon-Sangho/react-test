import { http, HttpResponse } from "msw";
import type {
  Coin,
  CoinDetail,
  SearchResponse,
  ChartData,
} from "../../types/coin";
import { COINGECKO_API_BASE_URL } from "@/api/coingekco-api";

// Mock data for testing
const mockCoins: Coin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 42000,
    market_cap: 823000000000,
    market_cap_rank: 1,
    fully_diluted_valuation: 883000000000,
    total_volume: 28000000000,
    high_24h: 43000,
    low_24h: 41000,
    price_change_24h: 1200,
    price_change_percentage_24h: 2.94,
    market_cap_change_24h: 24500000000,
    market_cap_change_percentage_24h: 3.07,
    circulating_supply: 21000000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    atl: 67,
    ath_change_percentage: -39.13,
    atl_change_percentage: 62687.57,
    ath_date: "2021-11-10T14:24:11.849Z",
    atl_date: "2013-07-06T00:00:00.000Z",
    roi: null,
    last_updated: "2024-01-15T10:00:00Z",
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 2300,
    market_cap: 276500000000,
    market_cap_rank: 2,
    fully_diluted_valuation: 276500000000,
    total_volume: 13500000000,
    high_24h: 2350,
    low_24h: 2250,
    price_change_24h: 25,
    price_change_percentage_24h: 1.1,
    market_cap_change_24h: 3000000000,
    market_cap_change_percentage_24h: 1.1,
    circulating_supply: 120200000,
    total_supply: 120200000,
    max_supply: null,
    ath: 4800,
    atl: 0.432979,
    ath_change_percentage: -52.02,
    atl_change_percentage: 530873.23,
    ath_date: "2021-11-16T20:47:26.788Z",
    atl_date: "2015-10-20T00:00:00.000Z",
    roi: null,
    last_updated: "2024-01-15T10:00:00Z",
  },
];

export const handlers = [
  http.get(`${COINGECKO_API_BASE_URL}/coins/markets`, () => {
    return HttpResponse.json(mockCoins);
  }),

  http.get(`${COINGECKO_API_BASE_URL}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.toLowerCase() || "";

    const filtered = mockCoins
      .filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query),
      )
      .map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        market_cap_rank: coin.market_cap_rank,
        thumb: coin.image,
        small: coin.image,
        large: coin.image,
      }));

    const response: SearchResponse = {
      coins: filtered,
      exchanges: [],
      icos: [],
      categories: [],
      nfts: [],
    };

    return HttpResponse.json(response);
  }),

  http.get(`${COINGECKO_API_BASE_URL}/coins/:coinId`, ({ params }) => {
    const coin = mockCoins.find((c) => c.id === params.coinId);

    if (!coin) {
      return HttpResponse.json(
        { status: { error_code: 1006, error_message: "coin not found" } },
        { status: 404 },
      );
    }

    const detail: CoinDetail = {
      ...coin,
      description: {
        en: `${coin.name} is a leading cryptocurrency. Description placeholder.`,
      },
      links: {
        homepage: ["https://example.com"],
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
      },
      categories: ["Layer 1"],
      sentiment_votes_up_percentage: 75,
      sentiment_votes_down_percentage: 25,
    };

    return HttpResponse.json(detail);
  }),

  http.get(`${COINGECKO_API_BASE_URL}/coins/:coinId/market_chart`, () => {
    const chartData: ChartData = {
      prices: Array.from({ length: 365 }, (_, i) => [
        new Date(2023, 0, 1 + i).getTime(),
        30000 + Math.sin(i / 50) * 5000 + Math.random() * 2000,
      ]),
      market_caps: [],
      volumes: [],
    };

    return HttpResponse.json(chartData);
  }),
];
