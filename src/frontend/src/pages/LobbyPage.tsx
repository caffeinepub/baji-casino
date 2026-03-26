import { ChevronUp, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GameCard } from "../components/GameCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useFavorites, useToggleFavorite } from "../hooks/useQueries";
import { GAMES } from "../utils/gameLogic";

const PROVIDERS = ["All", "EVOLUTION", "SEXYBCRT", "PRAGMATIC", "NETENT"];
const BASE_ONLINE = 1247;
const MARQUEE_TEXT =
  "🎰 Baji Win-এ স্বাগতম! • 100% Recharge Bonus পান! • bKash/Nagad-এ Recharge করুন • এখনই খেলুন! 🎲";

const BANNERS = [
  {
    id: "welcome",
    image: "/assets/generated/banner-welcome.dim_800x300.jpg",
    accent: "oklch(0.78 0.14 82)",
  },
  {
    id: "bonus25",
    image: "/assets/generated/banner-25.dim_800x300.jpg",
    accent: "oklch(0.75 0.18 145)",
  },
  {
    id: "bonus30",
    image: "/assets/generated/banner-30.dim_800x300.jpg",
    accent: "oklch(0.72 0.18 200)",
  },
  {
    id: "bonus50",
    image: "/assets/generated/banner-50.dim_800x300.jpg",
    accent: "oklch(0.75 0.2 40)",
  },
  {
    id: "bonus100",
    image: "/assets/generated/banner-100.dim_800x300.jpg",
    accent: "oklch(0.78 0.14 82)",
  },
];

interface LobbyPageProps {
  onPlayGame: (gameId: string) => void;
}

export function LobbyPage({ onPlayGame }: LobbyPageProps) {
  const [activeProvider, setActiveProvider] = useState("All");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: favorites = [] } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [onlineCount, setOnlineCount] = useState(BASE_ONLINE);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 21) - 10;
      setOnlineCount((prev) => Math.max(900, prev + delta));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filteredGames =
    activeProvider === "All"
      ? GAMES
      : GAMES.filter((g) => g.provider === activeProvider);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setShowScrollTop(scrollRef.current.scrollTop > 200);
    }
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleFavorite = (gameId: string) => {
    if (!identity) {
      toast.error("Login to save favorites");
      return;
    }
    toggleFavorite.mutate(gameId);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
        .marquee-track {
          animation: marquee 22s linear infinite;
        }
      `}</style>

      {/* Provider filter tabs */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-2"
        style={{ background: "oklch(0.16 0.045 245)" }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {PROVIDERS.map((p) => (
            <button
              type="button"
              key={p}
              data-ocid={`lobby.${p.toLowerCase()}.tab`}
              onClick={() => setActiveProvider(p)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
                activeProvider === p
                  ? "text-primary-foreground"
                  : "text-muted-foreground border border-border"
              }`}
              style={
                activeProvider === p
                  ? {
                      background: "oklch(0.25 0.04 245)",
                      border: "1px solid oklch(0.78 0.14 82)",
                      color: "oklch(0.78 0.14 82)",
                    }
                  : {}
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Banner Slideshow */}
      <div
        className="flex-shrink-0 mx-4 mt-2 mb-2 rounded-xl overflow-hidden relative"
        style={{ height: "130px" }}
      >
        {BANNERS.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === bannerIndex ? 1 : 0 }}
          >
            <img
              src={banner.image}
              alt={banner.id}
              className="w-full h-full object-cover"
            />
            {/* Dot navigation overlay */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {BANNERS.map((b, di) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBannerIndex(di)}
                  className="rounded-full transition-all"
                  style={{
                    width: di === bannerIndex ? "20px" : "6px",
                    height: "6px",
                    background:
                      di === bannerIndex
                        ? banner.accent
                        : "oklch(0.9 0.0 0 / 0.5)",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advertisement marquee */}
      <div
        className="flex-shrink-0 overflow-hidden py-2"
        style={{
          background: "oklch(0.12 0.05 245)",
          borderTop: "1px solid oklch(0.78 0.14 82 / 0.2)",
          borderBottom: "1px solid oklch(0.78 0.14 82 / 0.2)",
        }}
      >
        <div
          className="marquee-track whitespace-nowrap text-sm font-semibold"
          style={{ color: "oklch(0.82 0.16 82)" }}
        >
          {MARQUEE_TEXT}&nbsp;&nbsp;&nbsp;&nbsp;{MARQUEE_TEXT}
          &nbsp;&nbsp;&nbsp;&nbsp;{MARQUEE_TEXT}
        </div>
      </div>

      {/* Game grid */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3"
      >
        {/* LIVE NOW section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span
              className="text-sm font-bold tracking-wider"
              style={{ color: "oklch(0.78 0.14 82)" }}
            >
              🔴 LIVE NOW
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                {onlineCount.toLocaleString()} online
              </span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.25 0.12 140 / 0.3)",
                border: "1px solid oklch(0.55 0.18 140 / 0.5)",
                color: "oklch(0.65 0.18 140)",
              }}
            >
              {filteredGames.length} Games
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <GameCard
                  game={game}
                  isFavorite={favorites.includes(game.id)}
                  onPlay={() => onPlayGame(game.id)}
                  onToggleFavorite={() => handleToggleFavorite(game.id)}
                  index={index + 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredGames.length === 0 && (
          <div
            data-ocid="lobby.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            No games found for this provider.
          </div>
        )}
      </div>

      {/* Scroll to top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            data-ocid="lobby.scroll_top.button"
            onClick={scrollToTop}
            className="absolute bottom-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-gold z-10"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
              color: "oklch(0.14 0.03 245)",
            }}
          >
            <ChevronUp size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
