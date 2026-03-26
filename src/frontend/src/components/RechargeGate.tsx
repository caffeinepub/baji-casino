import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, LogIn, Zap } from "lucide-react";
import { motion } from "motion/react";

interface RechargeGateProps {
  open: boolean;
  balance: number;
  isGuest?: boolean;
  onPlayNow: () => void;
  onRecharge: () => void;
  onClose: () => void;
  gameName?: string;
}

export function RechargeGate({
  open,
  balance,
  isGuest,
  onPlayNow,
  onRecharge,
  onClose,
  gameName,
}: RechargeGateProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-xs w-full rounded-2xl border-0 p-0 overflow-hidden"
        style={{ background: "oklch(0.14 0.04 245)" }}
      >
        <div
          className="px-5 pt-5 pb-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.18 0.06 245), oklch(0.14 0.04 245))",
            borderBottom: "1px solid oklch(0.78 0.14 82 / 0.2)",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-center text-lg font-black tracking-wide"
              style={{ color: "oklch(0.78 0.14 82)" }}
            >
              {gameName ? gameName : "Game Access"}
            </DialogTitle>
          </DialogHeader>

          {/* Balance display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 mb-3 flex flex-col items-center gap-1"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-1"
              style={{
                background: "oklch(0.22 0.06 82 / 0.3)",
                border: "2px solid oklch(0.78 0.14 82 / 0.5)",
              }}
            >
              <Coins size={28} style={{ color: "oklch(0.78 0.14 82)" }} />
            </div>
            <p className="text-xs text-muted-foreground">আপনার Balance</p>
            <p
              className="text-3xl font-black"
              style={{ color: "oklch(0.78 0.14 82)" }}
            >
              {balance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">TK</p>
          </motion.div>
        </div>

        <div className="px-5 pb-5 pt-4 flex flex-col gap-3">
          {/* 100% bonus notice */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "oklch(0.20 0.06 82 / 0.2)",
              border: "1px solid oklch(0.78 0.14 82 / 0.3)",
            }}
          >
            <Zap
              size={16}
              style={{ color: "oklch(0.78 0.14 82)", flexShrink: 0 }}
            />
            <p className="text-xs" style={{ color: "oklch(0.85 0.08 82)" }}>
              <span className="font-black">100% Recharge Bonus</span> — Double
              TK on every recharge!
            </p>
          </div>

          {isGuest ? (
            <>
              <p className="text-xs text-muted-foreground text-center">
                Game খেলতে হলে আগে Login করুন ও Recharge করুন
              </p>
              <Button
                data-ocid="recharge_gate.recharge.button"
                onClick={onRecharge}
                className="w-full h-11 font-bold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
                  color: "oklch(0.14 0.03 245)",
                }}
              >
                <LogIn size={16} className="mr-2" />
                Login & Recharge
              </Button>
            </>
          ) : balance > 0 ? (
            <>
              <Button
                data-ocid="recharge_gate.play.button"
                onClick={onPlayNow}
                className="w-full h-11 font-bold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.18 140), oklch(0.50 0.18 140))",
                  color: "#fff",
                }}
              >
                ▶ Play Now
              </Button>
              <Button
                data-ocid="recharge_gate.recharge.button"
                onClick={onRecharge}
                variant="outline"
                className="w-full h-11 font-bold rounded-xl border-0"
                style={{
                  background: "oklch(0.22 0.04 245)",
                  color: "oklch(0.78 0.14 82)",
                }}
              >
                <Zap size={15} className="mr-2" />
                Recharge করুন
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground text-center">
                Balance নেই! Recharge করুন game খেলতে
              </p>
              <Button
                data-ocid="recharge_gate.recharge.button"
                onClick={onRecharge}
                className="w-full h-11 font-bold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
                  color: "oklch(0.14 0.03 245)",
                }}
              >
                <Zap size={16} className="mr-2" />
                Recharge করুন
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
