import { Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { GameDefinition } from "../utils/gameLogic";

interface GameCardProps {
  game: GameDefinition;
  isFavorite: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  index: number;
}

export function GameCard({
  game,
  isFavorite,
  onPlay,
  onToggleFavorite,
  index,
}: GameCardProps) {
  const [playerCount, setPlayerCount] = useState(game.basePlayers);

  useEffect(() => {
    const interval = setInterval(
      () => {
        const delta = Math.floor(Math.random() * 21) - 10; // -10 to +10
        setPlayerCount((prev) => Math.max(10, prev + delta));
      },
      3000 + Math.random() * 1000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      data-ocid={`game.item.${index}`}
      className="rounded-xl overflow-hidden shadow-card cursor-pointer active:scale-95 transition-transform w-full text-left"
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === "Enter") onPlay();
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = game.gradient;
            }
          }}
        />
        {/* LIVE badge with pulsing dot */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400">LIVE</span>
        </div>
        {/* Provider badge */}
        <div
          className="absolute bottom-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full z-10"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "oklch(0.78 0.14 82)",
            border: "1px solid oklch(0.78 0.14 82 / 0.5)",
          }}
        >
          {game.provider}
        </div>
      </div>

      {/* Card footer */}
      <div
        className="px-2.5 py-2"
        style={{ background: "oklch(0.20 0.04 245)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground truncate">
            {game.name}
          </span>
          <button
            type="button"
            data-ocid={`game.toggle.${index}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="ml-2 flex-shrink-0 transition-colors"
            style={{
              color: isFavorite
                ? "oklch(0.78 0.14 82)"
                : "oklch(0.50 0.02 240)",
            }}
          >
            <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Users size={10} className="text-green-400" />
          <span className="text-[10px] text-green-400 font-medium">
            {playerCount.toLocaleString()} playing
          </span>
        </div>
      </div>
    </button>
  );
}
