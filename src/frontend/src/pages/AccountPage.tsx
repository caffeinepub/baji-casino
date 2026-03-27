import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  History,
  LogOut,
  MessageCircle,
  RefreshCw,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../components/BottomNav";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  type HelpDeskMessage,
  getUserMessages,
  sendUserMessage,
} from "../utils/localHelpDesk";

interface AccountPageProps {
  onNavigate?: (page: Page) => void;
  onBack?: () => void;
  onLogout?: () => void;
}

type SubSection =
  | null
  | "notifications"
  | "personal"
  | "transactions"
  | "helpdesk";

export function AccountPage({
  onNavigate,
  onBack,
  onLogout,
}: AccountPageProps) {
  const { user, logout, updateName, refreshUser } = useLocalAuth();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [subSection, setSubSection] = useState<SubSection>(null);
  const [copied, setCopied] = useState(false);

  // Help Desk chat state
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [helpMessages, setHelpMessages] = useState<HelpDeskMessage[]>([]);

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!user) return;
    const load = () => setHelpMessages(getUserMessages(user.phone));
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [helpMessages.length]);

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text || !user) return;
    setChatInput("");
    sendUserMessage(user.phone, text);
    setHelpMessages(getUserMessages(user.phone));
  };

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

  const handleLogout = () => {
    logout();
    onLogout?.();
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
    const isHelpdesk = subSection === "helpdesk";
    return (
      <div
        className={
          isHelpdesk
            ? "flex-1 flex flex-col overflow-hidden h-screen"
            : "flex-1 overflow-y-auto scrollbar-hide"
        }
      >
        <div
          className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10 flex-shrink-0"
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
            {subSection === "transactions" && "Transaction Records"}
            {subSection === "helpdesk" && "Help Desk"}
          </h2>
        </div>

        <div
          className={
            isHelpdesk
              ? "flex-1 overflow-hidden flex flex-col px-4 pt-0"
              : "px-4 pt-4 pb-24"
          }
        >
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
                              {item.amount.toLocaleString()} TK
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.txId}
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

          {subSection === "helpdesk" && (
            <>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pb-4 pt-4">
                {helpMessages.length === 0 && (
                  <div className="flex justify-start">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                      style={{ background: "oklch(0.30 0.08 245)" }}
                    >
                      <MessageCircle
                        size={14}
                        style={{ color: "oklch(0.65 0.18 140)" }}
                      />
                    </div>
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: "oklch(0.22 0.04 245)",
                        color: "oklch(0.92 0.01 245)",
                        borderBottomLeftRadius: "4px",
                      }}
                    >
                      <p
                        className="text-[10px] font-bold mb-1"
                        style={{ color: "oklch(0.65 0.18 140)" }}
                      >
                        Support
                      </p>
                      স্বাগতম! Baji Win Support-এ আপনাকে স্বাগতম। কীভাবে সাহায্য করতে
                      পারি?
                    </div>
                  </div>
                )}
                {helpMessages.map((msg) => (
                  <div
                    key={String(msg.id)}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.from === "support" && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                        style={{ background: "oklch(0.30 0.08 245)" }}
                      >
                        <MessageCircle
                          size={14}
                          style={{ color: "oklch(0.65 0.18 140)" }}
                        />
                      </div>
                    )}
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background:
                          msg.from === "user"
                            ? "oklch(0.45 0.18 160)"
                            : "oklch(0.22 0.04 245)",
                        color: "oklch(0.92 0.01 245)",
                        borderBottomRightRadius:
                          msg.from === "user" ? "4px" : undefined,
                        borderBottomLeftRadius:
                          msg.from === "support" ? "4px" : undefined,
                      }}
                    >
                      {msg.from === "support" && (
                        <p
                          className="text-[10px] font-bold mb-1"
                          style={{ color: "oklch(0.65 0.18 140)" }}
                        >
                          Support
                        </p>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input — fixed at bottom, never moves */}
              <div
                className="flex items-center gap-2 pt-3 flex-shrink-0"
                style={{
                  borderTop: "1px solid oklch(0.25 0.03 245)",
                  paddingBottom: "env(safe-area-inset-bottom, 16px)",
                }}
              >
                <Input
                  data-ocid="helpdesk.input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message লিখুন..."
                  className="flex-1 h-10 text-sm rounded-xl"
                  style={{
                    background: "oklch(0.22 0.04 245)",
                    border: "1px solid oklch(0.30 0.04 245)",
                    color: "oklch(0.92 0.01 245)",
                  }}
                />
                <button
                  type="button"
                  data-ocid="helpdesk.submit_button"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                  style={{ background: "oklch(0.45 0.18 160)" }}
                >
                  <Send size={16} style={{ color: "#fff" }} />
                </button>
              </div>
            </>
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
        <h1 className="font-bold text-foreground text-base">My Account</h1>
        <button
          type="button"
          data-ocid="account.logout.button"
          onClick={handleLogout}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.22 0.04 245)" }}
        >
          <LogOut size={16} className="text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.18 160), oklch(0.35 0.15 245))",
              color: "#fff",
            }}
          >
            {initials}
          </div>
          <div className="text-center">
            <p className="font-bold text-foreground text-lg">
              {user?.displayName || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {signUpDate}
            </p>
          </div>
        </div>

        {/* Balance card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 245), oklch(0.18 0.04 245))",
            border: "1px solid oklch(0.30 0.04 245)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Wallet Balance</p>
            <button
              type="button"
              onClick={() => setBalanceVisible((v) => !v)}
              className="text-muted-foreground"
            >
              {balanceVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            {balanceVisible
              ? `${(user?.balance ?? 0).toLocaleString()} TK`
              : "••••• TK"}
          </p>
          <div className="flex gap-2 mt-3">
            {onNavigate && (
              <>
                <Button
                  data-ocid="account.deposit.button"
                  size="sm"
                  onClick={() => onNavigate("deposit")}
                  className="flex-1 h-9 rounded-xl text-xs font-bold"
                  style={{
                    background: "oklch(0.45 0.18 160)",
                    color: "#fff",
                  }}
                >
                  Deposit
                </Button>
                <Button
                  data-ocid="account.withdraw.button"
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Withdrawal আসছে শীঘ্রই")}
                  className="flex-1 h-9 rounded-xl text-xs font-bold border-border"
                >
                  Withdraw
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Phone */}
        {user && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{ background: "oklch(0.20 0.04 245)" }}
          >
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-semibold text-foreground">
                {user.phone}
              </p>
            </div>
            <button
              type="button"
              data-ocid="account.copy.button"
              onClick={handleCopyPhone}
              className="text-muted-foreground"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        )}

        <Separator style={{ background: "oklch(0.25 0.03 245)" }} />

        {/* 4-icon menu */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Bell,
              label: "Notifications",
              section: "notifications" as SubSection,
              ocid: "account.notifications.button",
            },
            {
              icon: User,
              label: "Personal Info",
              section: "personal" as SubSection,
              ocid: "account.personal.button",
            },
            {
              icon: History,
              label: "Transactions",
              section: "transactions" as SubSection,
              ocid: "account.transactions.button",
            },
            {
              icon: MessageCircle,
              label: "Help Desk",
              section: "helpdesk" as SubSection,
              ocid: "account.helpdesk.button",
            },
          ].map(({ icon: Icon, label, section, ocid }) => (
            <button
              key={label}
              type="button"
              data-ocid={ocid}
              onClick={() => setSubSection(section)}
              className="flex flex-col items-center gap-2 rounded-2xl py-4 transition-all active:scale-95"
              style={{
                background: "oklch(0.20 0.04 245)",
                border: "1px solid oklch(0.28 0.03 245)",
              }}
            >
              <Icon size={22} style={{ color: "oklch(0.65 0.18 140)" }} />
              <span className="text-xs font-semibold text-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Refresh balance */}
        <button
          type="button"
          data-ocid="account.refresh.button"
          onClick={() => {
            refreshUser();
            toast.success("Balance refresh হয়েছে");
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 transition-all"
          style={{
            background: "oklch(0.20 0.04 245)",
            border: "1px solid oklch(0.28 0.03 245)",
          }}
        >
          <RefreshCw size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Refresh Balance</span>
        </button>
      </div>
    </div>
  );
}
