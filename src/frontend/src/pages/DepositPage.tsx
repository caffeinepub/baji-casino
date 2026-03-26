import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  Loader2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useSubmitRecharge } from "../hooks/useQueries";
import { addRechargeRecord } from "../utils/localAuth";

const AMOUNT_PRESETS = [500, 1000, 2000, 5000, 10000, 25000];
const PAYMENT_NUMBER = "01318079765";
const MAX_RECHARGE = 25000;

type Method = "bkash" | "nagad";

interface DepositPageProps {
  onGoToLobby?: () => void;
  onBack?: () => void;
}

export function DepositPage({ onGoToLobby, onBack }: DepositPageProps) {
  const { user } = useLocalAuth();
  const submitRecharge = useSubmitRecharge();

  const [method, setMethod] = useState<Method>("bkash");
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState<number | "">(1000);
  const [submitted, setSubmitted] = useState(false);

  const fallbackCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy");
      toast.success("Number copied!");
    } catch {
      toast.error(`Copy করা যায়নি। নম্বরটি: ${text}`);
    }
    document.body.removeChild(el);
  };

  const handleCopy = () => {
    const num = PAYMENT_NUMBER;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(num)
        .then(() => {
          toast.success("Number copied!");
        })
        .catch(() => {
          fallbackCopy(num);
        });
    } else {
      fallbackCopy(num);
    }
  };

  const handleSubmit = async () => {
    if (!txId.trim()) {
      toast.error("Transaction ID দিন");
      return;
    }
    if (!amount || Number(amount) < 100) {
      toast.error("Minimum amount 100");
      return;
    }
    if (Number(amount) > MAX_RECHARGE) {
      toast.error("Maximum recharge limit 25,000 TK");
      return;
    }
    try {
      await submitRecharge.mutateAsync({
        txId: txId.trim(),
        amount: Number(amount),
        method,
      });
    } catch {
      // Backend may fail for non-II users; still save locally
    }
    if (user) {
      addRechargeRecord(user.phone, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        amount: Number(amount),
        method,
        txId: txId.trim(),
        status: "pending",
        createdAt: Date.now(),
      });
    }
    setSubmitted(true);
    toast.success("Request submit হয়েছে! Admin approve করলে 2x TK যোগ হবে।");
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col">
        {onBack && (
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{ borderBottom: "1px solid oklch(0.25 0.03 245)" }}
          >
            <button
              type="button"
              data-ocid="deposit.back.button"
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.22 0.04 245)" }}
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h2 className="font-bold text-foreground">Recharge</h2>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <span className="text-3xl">🔒</span>
          </div>
          <p className="text-lg font-bold text-foreground text-center">
            Login করুন
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Recharge করতে হলে আগে Login করতে হবে।
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col">
        {onBack && (
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{ borderBottom: "1px solid oklch(0.25 0.03 245)" }}
          >
            <button
              type="button"
              data-ocid="deposit.back.button"
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.22 0.04 245)" }}
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h2 className="font-bold text-foreground">Recharge</h2>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.25 0.08 140 / 0.3)",
              border: "2px solid oklch(0.65 0.18 140)",
            }}
          >
            <CheckCircle size={40} style={{ color: "oklch(0.65 0.18 140)" }} />
          </motion.div>
          <p
            className="text-xl font-black"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            Request Submitted!
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl w-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.25 0.12 82 / 0.3), oklch(0.20 0.04 245))",
              border: "1px solid oklch(0.78 0.14 82 / 0.5)",
            }}
          >
            <Zap
              size={18}
              style={{ color: "oklch(0.78 0.14 82)", flexShrink: 0 }}
            />
            <div>
              <p
                className="text-sm font-black"
                style={{ color: "oklch(0.78 0.14 82)" }}
              >
                100% Recharge Bonus!
              </p>
              <p className="text-xs text-muted-foreground">
                Approve হলে double TK পাবেন —{" "}
                {amount
                  ? `${Number(amount).toLocaleString()} টাকায় ${(Number(amount) * 2).toLocaleString()} TK!`
                  : "2x TK!"}
              </p>
            </div>
          </motion.div>
          <p className="text-sm text-muted-foreground text-center">
            Admin আপনার request review করবেন। Approved হলে TK যোগ হবে।
          </p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: "oklch(0.20 0.04 245)" }}
          >
            <Clock size={16} style={{ color: "oklch(0.78 0.14 82)" }} />
            <p className="text-sm text-muted-foreground">
              সাধারণত ৫-১৫ মিনিটের মধ্যে approve হয়
            </p>
          </div>
          {onGoToLobby && (
            <Button
              data-ocid="deposit.lobby.button"
              onClick={onGoToLobby}
              className="w-full h-12 font-bold rounded-xl mt-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
                color: "oklch(0.14 0.03 245)",
              }}
            >
              Lobby-তে যান
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {/* Back header */}
      <div
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.16 0.04 245)",
          borderBottom: "1px solid oklch(0.25 0.03 245)",
        }}
      >
        {onBack && (
          <button
            type="button"
            data-ocid="deposit.back.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        )}
        <h2 className="font-bold text-foreground">Recharge</h2>
      </div>

      <div className="px-4 pt-4 pb-24">
        <p className="text-sm text-muted-foreground mb-5">
          নিচের নম্বরে টাকা পাঠান, তারপর Transaction ID দিন।
        </p>

        {/* 100% bonus banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.25 0.12 82 / 0.4), oklch(0.18 0.04 245))",
            border: "1px solid oklch(0.78 0.14 82 / 0.5)",
          }}
        >
          <Zap size={22} style={{ color: "oklch(0.78 0.14 82)" }} />
          <div>
            <p className="font-black" style={{ color: "oklch(0.78 0.14 82)" }}>
              100% Recharge Bonus!
            </p>
            <p className="text-xs text-muted-foreground">
              1,000 টাকা পাঠালে 2,000 TK পাবেন
            </p>
          </div>
        </motion.div>

        {/* Method selector */}
        <div
          className="flex rounded-xl p-1 mb-4"
          style={{ background: "oklch(0.20 0.04 245)" }}
        >
          {(["bkash", "nagad"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              data-ocid={`deposit.${m}.tab`}
              onClick={() => setMethod(m)}
              className="flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
              style={
                method === m
                  ? {
                      background: "oklch(0.78 0.14 82)",
                      color: "oklch(0.14 0.03 245)",
                    }
                  : { color: "oklch(0.60 0.02 240)" }
              }
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: m === "bkash" ? "#e2136e" : "#f26522",
                  color: "#fff",
                }}
              >
                {m === "bkash" ? "b" : "N"}
              </span>
              {m === "bkash" ? "bKash" : "Nagad"}
            </button>
          ))}
        </div>

        {/* Payment number */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "oklch(0.18 0.04 245)",
            border: "1px solid oklch(0.78 0.14 82 / 0.3)",
          }}
        >
          <p className="text-xs text-muted-foreground mb-1">
            {method === "bkash" ? "bKash" : "Nagad"} নম্বর
          </p>
          <div className="flex items-center gap-2">
            <p
              className="text-xl font-black flex-1 tracking-widest"
              style={{ color: "oklch(0.78 0.14 82)" }}
            >
              <span style={{ color: "oklch(0.78 0.14 82)" }}>013</span>
              <span
                style={{
                  color: "oklch(0.55 0.10 82)",
                  letterSpacing: "0.15em",
                }}
              >
                ******
              </span>
              <span style={{ color: "oklch(0.78 0.14 82)" }}>65</span>
            </p>
            <Button
              data-ocid="deposit.copy.button"
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="rounded-lg border-border gap-1"
            >
              <Copy size={14} /> Copy
            </Button>
          </div>
          <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.06 245)" }}>
            Copy করুন — আসল নম্বর clipboard-এ যাবে
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Send Money করুন, তারপর TX ID নিচে দিন
          </p>
        </div>

        {/* Amount presets */}
        <div className="flex items-center justify-between mb-2">
          <p
            className="text-xs font-bold tracking-wider"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            AMOUNT (টাকা)
          </p>
          <p className="text-xs" style={{ color: "oklch(0.55 0.06 245)" }}>
            সর্বোচ্চ ২৫,০০০ টাকা
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              data-ocid={`deposit.amount.${preset}.button`}
              onClick={() => setAmount(preset)}
              className="rounded-xl py-3 text-sm font-bold border transition-all"
              style={{
                background:
                  amount === preset
                    ? "oklch(0.78 0.14 82)"
                    : "oklch(0.20 0.04 245)",
                color:
                  amount === preset
                    ? "oklch(0.14 0.03 245)"
                    : "oklch(0.70 0.02 240)",
                borderColor:
                  amount === preset
                    ? "oklch(0.78 0.14 82)"
                    : "oklch(0.30 0.04 245)",
              }}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <Input
          data-ocid="deposit.amount.input"
          type="number"
          placeholder="Custom amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="bg-card border-border text-foreground h-12 mb-1"
        />
        <p className="text-xs text-muted-foreground mb-4">
          সর্বনিম্ন ১০০ — সর্বোচ্চ ২৫,০০০ টাকা
        </p>

        {/* TX ID */}
        <p
          className="text-xs font-bold tracking-wider mb-2"
          style={{ color: "oklch(0.78 0.14 82)" }}
        >
          TRANSACTION ID
        </p>
        <Input
          data-ocid="deposit.txid.input"
          placeholder="Transaction ID দিন"
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          className="bg-card border-border text-foreground h-12 mb-5"
        />

        <Button
          data-ocid="deposit.submit.button"
          onClick={handleSubmit}
          disabled={submitRecharge.isPending}
          className="w-full h-14 text-base font-black rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
            color: "oklch(0.14 0.03 245)",
          }}
        >
          {submitRecharge.isPending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </div>
    </div>
  );
}
