import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CrazyTimeWheel } from "../components/CrazyTimeWheel";
import { LiveTicker } from "../components/LiveTicker";
import { GAMES, type GameRoundResult } from "../utils/gameLogic";

const BET_AMOUNTS = [10, 50, 100, 500];

interface GamePageProps {
  gameId: string;
  onBack: () => void;
  isGuest?: boolean;
  localBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export function GamePage({
  gameId,
  onBack,
  localBalance,
  onBalanceUpdate,
}: GamePageProps) {
  const game = GAMES.find((g) => g.id === gameId);

  const [selectedBetOption, setSelectedBetOption] = useState<string | null>(
    null,
  );
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [pendingResult, setPendingResult] = useState<GameRoundResult | null>(
    null,
  );
  const [pendingAmount, setPendingAmount] = useState(0);
  const [wheelResult, setWheelResult] = useState("1x");

  const displayBalance = localBalance;
  const isCrazyTime = gameId === "crazytime";

  // Set default bet option on mount
  useEffect(() => {
    if (game && game.betOptions.length > 0) {
      setSelectedBetOption(game.betOptions[0].value);
    }
  }, [game]);

  const handlePlay = useCallback(async () => {
    if (!game || !selectedBetOption) {
      toast.error("Please select a bet option");
      return;
    }
    if (displayBalance < selectedAmount) {
      toast.error("Insufficient TK! Recharge করুন।");
      return;
    }

    setIsPlaying(true);
    setResult(null);

    const roundResult = game.simulate(selectedBetOption);
    const netAmount = roundResult.won
      ? Math.floor(selectedAmount * roundResult.multiplier - selectedAmount)
      : -selectedAmount;

    if (isCrazyTime) {
      setPendingResult(roundResult);
      setPendingAmount(netAmount);
      setWheelResult(roundResult.won ? `${roundResult.multiplier}x` : "1x");
      setWheelSpinning(true);
    } else {
      await new Promise((r) => setTimeout(r, 2000));
      const newBalance = displayBalance + netAmount;
      setResult(roundResult);
      onBalanceUpdate(newBalance);
      setIsPlaying(false);
    }
  }, [
    game,
    selectedBetOption,
    selectedAmount,
    displayBalance,
    isCrazyTime,
    onBalanceUpdate,
  ]);

  const handleWheelSpinComplete = useCallback(() => {
    if (!pendingResult || !game) return;
    const newBalance = displayBalance + pendingAmount;
    setResult(pendingResult);
    onBalanceUpdate(newBalance);
    setWheelSpinning(false);
    setIsPlaying(false);
    setPendingResult(null);
  }, [pendingResult, pendingAmount, displayBalance, game, onBalanceUpdate]);

  if (!game) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Game header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border"
        style={{ background: "oklch(0.14 0.04 245)" }}
      >
        <button
          type="button"
          data-ocid="game.back.button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="font-bold text-lg text-foreground">{game.name}</h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: "oklch(0.22 0.04 245)",
            border: "1px solid oklch(0.78 0.14 82 / 0.4)",
            color: "oklch(0.78 0.14 82)",
          }}
        >
          <Coins size={14} />
          <span>{displayBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Live ticker */}
      <LiveTicker />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Game visual */}
        {isCrazyTime ? (
          <div
            className="relative flex flex-col py-4"
            style={{
              background:
                "linear-gradient(135deg, #1a0a2e 0%, #0d1b3e 50%, #1a0a2e 100%)",
              minHeight: "340px",
            }}
          >
            {/* Live dealer overlay */}
            <div className="flex items-start gap-3 px-4 mb-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 relative rounded-xl overflow-hidden"
                style={{
                  width: 80,
                  border: "2px solid oklch(0.65 0.22 0 / 0.8)",
                  boxShadow: "0 0 16px oklch(0.65 0.22 0 / 0.5)",
                }}
              >
                <img
                  src="/assets/generated/crazy-time-dealer.dim_300x400.jpg"
                  alt="Live dealer Sofia"
                  className="w-full"
                  style={{
                    height: 100,
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                />
                <motion.div
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                  style={{ background: "oklch(0.65 0.22 0 / 0.2)" }}
                />
                <div
                  className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black"
                  style={{ background: "oklch(0.45 0.22 27)", color: "#fff" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                  LIVE
                </div>
              </motion.div>
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                  />
                  <span className="text-xs font-black text-red-400 tracking-widest">
                    LIVE CRAZY TIME
                  </span>
                </div>
                <p className="text-base font-black text-white">
                  Host: Sofia 🎡
                </p>
                <p className="text-xs" style={{ color: "oklch(0.78 0.14 82)" }}>
                  Spin the wheel of fortune!
                </p>
              </div>
            </div>

            <CrazyTimeWheel
              spinning={wheelSpinning}
              onSpinComplete={handleWheelSpinComplete}
              result={wheelResult}
            />
          </div>
        ) : (
          <div
            className="relative"
            style={{
              background: game.gradient,
              minHeight: "180px",
            }}
          >
            <img
              src={game.image}
              alt={game.name}
              className="w-full object-cover"
              style={{ height: 180, opacity: 0.7 }}
            />
            <div
              className="absolute inset-0 flex flex-col items-start justify-end p-4"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
              }}
            >
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black mb-1"
                style={{ background: "oklch(0.45 0.22 27)", color: "#fff" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                LIVE
              </div>
              <p className="text-lg font-black text-white">{game.name}</p>
              <p className="text-xs text-white/70">{game.description}</p>
            </div>
          </div>
        )}

        {/* Bet section */}
        <div className="px-4 py-5">
          <p
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            CHOOSE YOUR BET
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {game.betOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-ocid={`game.bet.${opt.value}.button`}
                onClick={() => setSelectedBetOption(opt.value)}
                className="rounded-xl py-2.5 px-2 text-center text-sm font-bold transition-all border"
                style={{
                  background:
                    selectedBetOption === opt.value
                      ? "oklch(0.78 0.14 82)"
                      : "oklch(0.20 0.04 245)",
                  color:
                    selectedBetOption === opt.value
                      ? "oklch(0.14 0.03 245)"
                      : "oklch(0.70 0.02 240)",
                  borderColor:
                    selectedBetOption === opt.value
                      ? "oklch(0.78 0.14 82)"
                      : "oklch(0.30 0.04 245)",
                }}
              >
                <span className="block">{opt.label}</span>
                <span className="text-[10px] opacity-70">
                  {opt.multiplier}x
                </span>
              </button>
            ))}
          </div>

          <p
            className="text-xs font-bold tracking-wider mb-3"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            BET AMOUNT
          </p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {BET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                data-ocid={`game.amount.${amt}.button`}
                onClick={() => setSelectedAmount(amt)}
                className="rounded-xl py-2.5 text-sm font-bold transition-all border"
                style={{
                  background:
                    selectedAmount === amt
                      ? "oklch(0.78 0.14 82)"
                      : "oklch(0.20 0.04 245)",
                  color:
                    selectedAmount === amt
                      ? "oklch(0.14 0.03 245)"
                      : "oklch(0.70 0.02 240)",
                  borderColor:
                    selectedAmount === amt
                      ? "oklch(0.78 0.14 82)"
                      : "oklch(0.30 0.04 245)",
                }}
              >
                {amt}
              </button>
            ))}
          </div>

          <Button
            data-ocid="game.play.button"
            onClick={handlePlay}
            disabled={isPlaying || !selectedBetOption}
            className="w-full h-14 text-lg font-black rounded-xl"
            style={{
              background: isPlaying
                ? "oklch(0.40 0.04 245)"
                : "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.60 0.14 82))",
              color: "oklch(0.14 0.03 245)",
            }}
          >
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Playing...
              </span>
            ) : (
              `Place Bet — ${selectedAmount} TK`
            )}
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 mb-5 rounded-2xl p-5 text-center"
              style={{
                background: result.won
                  ? "oklch(0.20 0.06 140 / 0.5)"
                  : "oklch(0.20 0.06 27 / 0.5)",
                border: `1px solid ${
                  result.won
                    ? "oklch(0.65 0.18 140 / 0.5)"
                    : "oklch(0.65 0.20 27 / 0.5)"
                }`,
              }}
            >
              <p className="text-3xl mb-1">{result.won ? "🎉" : "😔"}</p>
              <p
                className="text-xl font-black mb-1"
                style={{
                  color: result.won
                    ? "oklch(0.65 0.18 140)"
                    : "oklch(0.65 0.20 27)",
                }}
              >
                {result.won
                  ? `+${Math.floor(selectedAmount * result.multiplier - selectedAmount)} TK!`
                  : `-${selectedAmount} TK`}
              </p>
              <p className="text-sm text-foreground font-semibold">
                {result.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.details}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
