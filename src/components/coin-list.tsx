import type { Coin } from "@/types/coin";
import { CoinCard } from "./coin-card";

type CoinListProps = {
  coins: Coin[];
  favorites: Record<string, boolean>;
  onToggleFavorite?: (coinId: string) => void;
};

export const CoinList = ({
  coins,
  favorites,
  onToggleFavorite,
}: CoinListProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {coins.map((coin) => (
        <CoinCard
          key={coin.id}
          coin={coin}
          isFavorite={favorites[coin.id] === true}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
