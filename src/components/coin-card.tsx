import { Link } from "react-router";
import { Heart } from "lucide-react";
import type { Coin } from "@/types/coin";
import { formatPrice, formatPercentage } from "@/utils/format";

type CoinCardProps = {
  coin: Coin;
  isFavorite?: boolean;
  onToggleFavorite?: (coinId: string) => void;
};

export const CoinCard = ({
  coin,
  isFavorite = false,
  onToggleFavorite,
}: CoinCardProps) => {
  const priceChange = coin.price_change_percentage_24h ?? 0;
  const isPositive = priceChange >= 0;

  return (
    <Link
      to={`/crypto/${coin.id}`}
      className="group relative flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header with image and name */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={coin.image} alt={coin.name} className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {coin.name}
            </h3>
            <p className="text-xs text-gray-600 uppercase">{coin.symbol}</p>
          </div>
        </div>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(coin.id);
            }}
            className="shrink-0 transition-colors hover:text-red-500"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        )}
      </div>

      {/* Price and change */}
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">
          {formatPrice(coin.current_price)}
        </p>
        <p
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatPercentage(priceChange)}
        </p>
      </div>

      {/* Market cap rank */}
      {coin.market_cap_rank && (
        <p className="text-xs text-gray-600">Rank #{coin.market_cap_rank}</p>
      )}
    </Link>
  );
};
