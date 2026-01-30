import { createApiClient } from "./create-api-client";

export const COINGECKO_API_BASE_URL = "https://api.coingecko.com/api/v3";

export const coingeckoApi = createApiClient({
  baseURL: COINGECKO_API_BASE_URL,
  interceptors: {
    response: {
      onFulfilled: (response) => response,
      onRejected: (error) => {
        if (error.response?.status === 429) {
          console.warn("Rate limited by CoinGecko API");
        }
        return Promise.reject(error);
      },
    },
  },
});
