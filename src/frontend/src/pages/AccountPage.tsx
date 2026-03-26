import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  History,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  User,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../components/BottomNav";
import { useLocalAuth } from "../hooks/useLocalAuth";

interface AccountPageProps {
  onNavigate?: (page: Page) => void;
  onBack?: () => void;
}

type SubSection =
  | null
  | "notifications"
  | "personal"
  | "security"
  | "transactions";

export function AccountPage({ onNavigate, onBack }: AccountPageProps) {
  const { user, logout, updateName, refreshUser } = useLocalAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [subSection, setSubSection] = useState<SubSection>(null);
  const [copied, setCopied] = useState(false);

  const handleEditName = () => {
    setNameInput(user?.displayName || "");
    setEditingName(true);
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) {
      toast.error("Name খালি রাখা যাবে না");
      return;
    }
    updateName(nameInput.trim());
    setEditingName(false);
    refreshUser();
    toast.success("Name update হয়েছে");
  };

  const handleCopyPhone = () => {
    if (user?.phone) {
      navigator.clipboard.writeText(user.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const initials = user
    ? user.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  const history = user?.rechargeHistory || [];
  const signUpDate = user ? new Date().toISOString().split("T")[0] : "—";

  // Sub-section render
  if (subSection) {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div
          className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
          style={{
            background: "oklch(0.16 0.04 245)",
            borderBottom: "1px solid oklch(0.25 0.03 245)",
          }}
        >
          <button
            type="button"
            data-ocid="account.back.button"
            onClick={() => setSubSection(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h2 className="font-bold text-foreground">
            {subSection === "notifications" && "Notifications"}
            {subSection === "personal" && "Personal Info"}
            {subSection === "security" && "Login & Security"}
            {subSection === "transactions" && "Transaction Records"}
          </h2>
        </div>

        <div className="px-4 pt-4 pb-24">
          {subSection === "notifications" && (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "oklch(0.20 0.04 245)" }}
            >
              <Bell size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-semibold">
                No new notifications
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                আপনার কোনো notification নেই।
              </p>
            </div>
          )}

          {subSection === "personal" && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.20 0.04 245)" }}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  Phone Number
                </p>
                <p className="font-semibold text-foreground">
                  {user?.phone || "—"}
                </p>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{ background: "oklch(0.20 0.04 245)" }}
              >
                <p className="text-xs text-muted-foreground mb-2">
                  Display Name
                </p>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      data-ocid="account.displayname.input"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="h-9 text-sm bg-card border-border"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="text-green-400"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingName(false)}
                      className="text-muted-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      {user?.displayName || "Guest"}
                    </p>
                    {user && (
                      <Button
                        data-ocid="account.edit_button"
                        size="sm"
                        variant="outline"
                        onClick={handleEditName}
                        className="h-8 rounded-lg text-xs"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {subSection === "security" && (
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: "oklch(0.20 0.04 245)" }}
            >
              <Shield
                size={32}
                className="mx-auto mb-3"
                style={{ color: "oklch(0.65 0.18 140)" }}
              />
              <p className="text-foreground font-semibold">Login & Security</p>
              <p className="text-sm text-muted-foreground mt-1">
                Phone number দিয়ে login করা হয়।
              </p>
            </div>
          )}

          {subSection === "transactions" && (
            <div>
              {history.length === 0 ? (
                <div
                  data-ocid="account.history.empty_state"
                  className="rounded-2xl p-6 text-center"
                  style={{ background: "oklch(0.20 0.04 245)" }}
                >
                  <History
                    size={28}
                    className="mx-auto mb-3 text-muted-foreground"
                  />
                  <p className="text-muted-foreground text-sm">
                    এখনো কোনো transaction নেই।
                  </p>
                  {onNavigate && (
                    <button
                      type="button"
                      data-ocid="account.recharge.button"
                      onClick={() => onNavigate("deposit")}
                      className="mt-2 text-sm font-semibold"
                      style={{ color: "oklch(0.65 0.18 140)" }}
                    >
                      Recharge করুন →
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, i) => {
                    const ocidIdx = i + 1;
                    const StatusIcon =
                      item.status === "approved"
                        ? CheckCircle
                        : item.status === "rejected"
                          ? XCircle
                          : Clock;
                    const statusColor =
                      item.status === "approved"
                        ? "oklch(0.65 0.18 140)"
                        : item.status === "rejected"
                          ? "oklch(0.65 0.20 27)"
                          : "oklch(0.78 0.14 82)";
                    return (
                      <motion.div
                        key={item.id}
                        data-ocid={`account.history.item.${ocidIdx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: "oklch(0.20 0.04 245)" }}
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon
                            size={18}
                            style={{ color: statusColor }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.method.toUpperCase()} —{" "}
                              {item.amount.toLocaleString()} টাকা
                            </p>
                            <p className="text-xs text-muted-foreground">
                              TX: {item.txId.slice(0, 12)}
                              {item.txId.length > 12 ? "..." : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xs font-semibold capitalize"
                            style={{ color: statusColor }}
                          >
                            {item.status}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +{(item.amount * 2).toLocaleString()} TK
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main profile page
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.16 0.04 245)",
          borderBottom: "1px solid oklch(0.25 0.03 245)",
        }}
      >
        {onBack ? (
          <button
            type="button"
            data-ocid="account.back.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <h1 className="font-bold text-foreground text-base">Profile</h1>
        <button
          type="button"
          data-ocid="account.close.button"
          onClick={onBack || (() => {})}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.22 0.04 245)" }}
        >
          <X size={18} className="text-foreground" />
        </button>
      </div>

      <div className="px-4 pt-5 pb-24">
        {/* User info row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-3"
        >
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.18 140), oklch(0.45 0.18 140))",
            }}
          >
            <span className="text-xl font-black" style={{ color: "#fff" }}>
              {initials}
            </span>
          </div>

          {/* Name + phone columns */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Full name */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  Full name
                </p>
                <p className="font-bold text-foreground text-sm truncate">
                  {user?.displayName || "Guest"}
                </p>
              </div>
              {/* Separator */}
              <div
                className="w-px h-8 self-center"
                style={{ background: "oklch(0.30 0.03 245)" }}
              />
              {/* Username / phone */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  Username
                </p>
                <div className="flex items-center gap-1">
                  <p className="font-bold text-foreground text-sm truncate">
                    {user?.phone || "—"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="flex-shrink-0"
                    style={{
                      color: copied
                        ? "oklch(0.65 0.18 140)"
                        : "oklch(0.50 0.03 245)",
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground mb-4">
          Sign up date: {signUpDate}
        </p>

        {/* Withdrawal / Deposit buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            data-ocid="account.withdrawal.button"
            onClick={() => onNavigate?.("lobby")}
            className="h-11 rounded-xl font-bold text-sm transition-all"
            style={{
              background: "oklch(0.20 0.04 245)",
              border: "1px solid oklch(0.35 0.04 245)",
              color: "oklch(0.75 0.02 245)",
            }}
          >
            Withdrawal
          </button>
          <button
            type="button"
            data-ocid="account.deposit.button"
            onClick={() => onNavigate?.("deposit")}
            className="h-11 rounded-xl font-bold text-sm transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.18 160), oklch(0.42 0.18 160))",
              color: "#fff",
            }}
          >
            Deposit
          </button>
        </div>

        {/* Main wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 mb-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.05 245), oklch(0.18 0.04 245))",
            border: "1px solid oklch(0.30 0.04 245)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground font-medium">
              Main Wallet
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="account.balance_toggle.button"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                type="button"
                data-ocid="account.balance_refresh.button"
                onClick={() => {
                  refreshUser();
                  toast.success("Balance refreshed");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
          <p
            className="text-2xl font-black mb-3"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            {balanceVisible
              ? `${(user?.balance ?? 0).toLocaleString()} TK`
              : "••••••"}
          </p>
          <Separator style={{ background: "oklch(0.28 0.03 245)" }} />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">VIP Points</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.78 0.14 82 / 0.15)",
                color: "oklch(0.78 0.14 82)",
              }}
            >
              Member
            </span>
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "oklch(0.20 0.04 245)" }}
        >
          {[
            {
              id: "notifications" as SubSection,
              icon: Bell,
              label: "Notifications",
            },
            {
              id: "personal" as SubSection,
              icon: User,
              label: "Personal Info",
            },
            {
              id: "security" as SubSection,
              icon: Lock,
              label: "Login & Security",
            },
            {
              id: "transactions" as SubSection,
              icon: History,
              label: "Transaction Records",
            },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <button
                type="button"
                data-ocid={`account.${item.id?.replace("_", "") || ""}.button`}
                onClick={() => {
                  setSubSection(item.id);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 active:bg-white/10"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.26 0.05 245)" }}
                >
                  <item.icon
                    size={16}
                    style={{ color: "oklch(0.65 0.18 140)" }}
                  />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
              {i < arr.length - 1 && (
                <div
                  className="mx-4"
                  style={{ height: "1px", background: "oklch(0.26 0.03 245)" }}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Logout */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <button
              type="button"
              data-ocid="account.logout.button"
              onClick={logout}
              className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: "oklch(0.20 0.04 245)",
                border: "1px solid oklch(0.577 0.245 27 / 0.4)",
                color: "oklch(0.70 0.20 27)",
              }}
            >
              <LogOut size={16} />
              Log Out
            </button>
          </motion.div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
