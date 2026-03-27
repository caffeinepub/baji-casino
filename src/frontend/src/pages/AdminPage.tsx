import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  MessageCircle,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useApproveRecharge,
  useIsAdmin,
  usePendingRechargeRequests,
  useRejectRecharge,
} from "../hooks/useQueries";
import {
  useGetAllHelpConversations,
  useReplyHelpMessage,
} from "../hooks/useQueries";

interface AdminPageProps {
  onBack?: () => void;
  forceAdmin?: boolean;
}

type AdminTab = "recharge" | "helpdesk";

function HelpDeskPanel({ isAdmin }: { isAdmin: boolean }) {
  const { data: conversations = [] } = useGetAllHelpConversations(isAdmin);
  const replyMutation = useReplyHelpMessage();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleReply = async (conv: {
    userId: { toString(): string };
    messages: unknown[];
  }) => {
    const key = conv.userId.toString();
    const text = replyInputs[key]?.trim();
    if (!text) return;
    await replyMutation.mutateAsync({ userId: conv.userId as any, text });
    setReplyInputs((prev) => ({ ...prev, [key]: "" }));
    toast.success("Reply পাঠানো হয়েছে");
  };

  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 gap-3"
        data-ocid="admin.helpdesk.empty_state"
      >
        <MessageCircle size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground font-medium">
          No help desk messages yet
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {conversations.map((conv, idx) => {
        const convKey = conv.userId.toString();
        const isExpanded = expandedKey === convKey;
        const lastMsg = conv.messages[conv.messages.length - 1];
        return (
          <motion.div
            key={convKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            data-ocid={`admin.helpdesk.item.${idx + 1}`}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.18 0.04 245)",
              border: "1px solid oklch(0.28 0.03 245)",
            }}
          >
            {/* Conversation header */}
            <button
              type="button"
              data-ocid={`admin.helpdesk.item.${idx + 1}.toggle`}
              onClick={() => setExpandedKey(isExpanded ? null : convKey)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.28 0.06 245)" }}
                >
                  <MessageCircle
                    size={16}
                    style={{ color: "oklch(0.65 0.18 140)" }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground font-mono">
                    {convKey.slice(0, 12)}...
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {lastMsg.text}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  style={{
                    background: "oklch(0.45 0.18 160 / 0.2)",
                    color: "oklch(0.65 0.18 140)",
                    border: "1px solid oklch(0.45 0.18 160 / 0.4)",
                  }}
                >
                  {conv.messages.length} msgs
                </Badge>
                <span
                  className="text-muted-foreground text-sm transition-transform inline-block"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▾
                </span>
              </div>
            </button>

            {/* Expanded chat */}
            {isExpanded && (
              <div
                className="border-t px-4 pt-3 pb-4"
                style={{ borderColor: "oklch(0.25 0.03 245)" }}
              >
                {/* Message list */}
                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                  {conv.messages.map((msg) => (
                    <div
                      key={String(msg.id)}
                      className={`flex ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                        style={{
                          background:
                            msg.from === "user"
                              ? "oklch(0.45 0.18 160 / 0.3)"
                              : "oklch(0.26 0.05 245)",
                          color: "oklch(0.88 0.01 245)",
                          borderBottomRightRadius:
                            msg.from === "user" ? "2px" : undefined,
                          borderBottomLeftRadius:
                            msg.from === "support" ? "2px" : undefined,
                        }}
                      >
                        <p
                          className="text-[9px] font-bold mb-0.5"
                          style={{
                            color:
                              msg.from === "user"
                                ? "oklch(0.65 0.18 140)"
                                : "oklch(0.78 0.14 82)",
                          }}
                        >
                          {msg.from === "user" ? "User" : "Support"}
                        </p>
                        {msg.text}
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {new Date(
                            Number(msg.createdAt) / 1_000_000,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="flex gap-2">
                  <Input
                    data-ocid={`admin.helpdesk.item.${idx + 1}.input`}
                    value={replyInputs[convKey] || ""}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({
                        ...prev,
                        [convKey]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleReply(conv)}
                    placeholder="Reply লিখুন..."
                    className="flex-1 h-9 text-sm rounded-xl"
                    style={{
                      background: "oklch(0.22 0.04 245)",
                      border: "1px solid oklch(0.30 0.04 245)",
                      color: "oklch(0.92 0.01 245)",
                    }}
                  />
                  <Button
                    data-ocid={`admin.helpdesk.item.${idx + 1}.submit_button`}
                    onClick={() => handleReply(conv)}
                    disabled={!replyInputs[convKey]?.trim()}
                    className="h-9 px-4 rounded-xl font-bold text-sm"
                    style={{
                      background: "oklch(0.35 0.12 140 / 0.4)",
                      border: "1px solid oklch(0.65 0.18 140)",
                      color: "oklch(0.78 0.18 140)",
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function AdminPage({ onBack, forceAdmin }: AdminPageProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const effectiveAdmin = forceAdmin || !!isAdmin;
  const { data: requests = [], isLoading: reqLoading } =
    usePendingRechargeRequests();
  const approve = useApproveRecharge();
  const reject = useRejectRecharge();
  const [activeTab, setActiveTab] = useState<AdminTab>("recharge");
  const { data: conversations = [] } =
    useGetAllHelpConversations(effectiveAdmin);

  const handleApprove = async (id: bigint) => {
    await approve.mutateAsync(id);
    toast.success("Request approved! TK added to user.");
  };

  const handleReject = async (id: bigint) => {
    await reject.mutateAsync(id);
    toast.error("Request rejected.");
  };

  if (!forceAdmin && adminLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "oklch(0.78 0.14 82)" }}
        />
      </div>
    );
  }

  if (!effectiveAdmin) {
    return (
      <div className="flex-1 flex flex-col">
        {onBack && (
          <div
            className="flex items-center gap-3 px-4 py-4"
            style={{ borderBottom: "1px solid oklch(0.25 0.03 245)" }}
          >
            <button
              type="button"
              data-ocid="admin.back.button"
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.22 0.04 245)" }}
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
            <h2 className="font-bold text-foreground">Admin Panel</h2>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "oklch(0.20 0.08 27 / 0.3)",
              border: "2px solid oklch(0.577 0.245 27)",
            }}
          >
            <ShieldOff size={40} style={{ color: "oklch(0.70 0.20 27)" }} />
          </div>
          <p
            className="text-xl font-black"
            style={{ color: "oklch(0.70 0.20 27)" }}
          >
            Access Denied
          </p>
          <p className="text-sm text-muted-foreground text-center">
            আপনার Admin access নেই।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Back header */}
      <div
        className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{
          background: "oklch(0.16 0.04 245)",
          borderBottom: "1px solid oklch(0.25 0.03 245)",
        }}
      >
        {onBack && (
          <button
            type="button"
            data-ocid="admin.back.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        )}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-foreground"
        >
          Admin Panel
        </motion.h2>
      </div>

      {/* Tab bar */}
      <div
        className="flex flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.25 0.03 245)" }}
      >
        <button
          type="button"
          data-ocid="admin.recharge.tab"
          onClick={() => setActiveTab("recharge")}
          className="flex-1 py-3 text-sm font-bold transition-colors"
          style={{
            color:
              activeTab === "recharge"
                ? "oklch(0.78 0.14 82)"
                : "oklch(0.55 0.02 245)",
            borderBottom:
              activeTab === "recharge"
                ? "2px solid oklch(0.78 0.14 82)"
                : "2px solid transparent",
          }}
        >
          Recharge Requests
          {requests.length > 0 && (
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background: "oklch(0.55 0.22 27 / 0.3)",
                color: "oklch(0.80 0.22 27)",
              }}
            >
              {requests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          data-ocid="admin.helpdesk.tab"
          onClick={() => setActiveTab("helpdesk")}
          className="flex-1 py-3 text-sm font-bold transition-colors"
          style={{
            color:
              activeTab === "helpdesk"
                ? "oklch(0.65 0.18 140)"
                : "oklch(0.55 0.02 245)",
            borderBottom:
              activeTab === "helpdesk"
                ? "2px solid oklch(0.65 0.18 140)"
                : "2px solid transparent",
          }}
        >
          Help Desk
          {conversations.length > 0 && (
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background: "oklch(0.45 0.18 160 / 0.2)",
                color: "oklch(0.65 0.18 140)",
              }}
            >
              {conversations.length}
            </span>
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-4 pb-24">
        {activeTab === "recharge" && (
          <div>
            {reqLoading ? (
              <div
                className="flex items-center justify-center py-12"
                data-ocid="admin.loading_state"
              >
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ color: "oklch(0.78 0.14 82)" }}
                />
              </div>
            ) : requests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
                data-ocid="admin.empty_state"
              >
                <span className="text-4xl">📭</span>
                <p className="text-muted-foreground font-medium">
                  No pending requests
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3 pt-2">
                {requests.map((req, idx) => (
                  <motion.div
                    key={String(req.id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    data-ocid={`admin.item.${idx + 1}`}
                    className="rounded-2xl p-4"
                    style={{
                      background: "oklch(0.18 0.04 245)",
                      border: "1px solid oklch(0.28 0.03 245)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          style={{
                            background:
                              req.method === "bkash"
                                ? "oklch(0.55 0.22 0 / 0.3)"
                                : "oklch(0.65 0.18 55 / 0.3)",
                            color:
                              req.method === "bkash"
                                ? "oklch(0.80 0.22 0)"
                                : "oklch(0.85 0.18 55)",
                            border: `1px solid ${
                              req.method === "bkash"
                                ? "oklch(0.65 0.22 0 / 0.5)"
                                : "oklch(0.75 0.18 55 / 0.5)"
                            }`,
                          }}
                        >
                          {req.method === "bkash" ? "💗 bKash" : "🟠 Nagad"}
                        </Badge>
                        <span
                          className="text-lg font-black"
                          style={{ color: "oklch(0.78 0.14 82)" }}
                        >
                          {Number(req.amount).toLocaleString()} TK
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(
                          Number(req.createdAt) / 1_000_000,
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex gap-2 text-xs">
                        <span className="text-muted-foreground">User:</span>
                        <span className="text-foreground font-mono">
                          {req.userId.toString().slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-muted-foreground">TX ID:</span>
                        <span className="text-foreground font-mono break-all">
                          {req.txId}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        data-ocid={`admin.item.${idx + 1}.confirm_button`}
                        onClick={() => handleApprove(req.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="flex-1 h-10 font-bold rounded-xl text-sm"
                        style={{
                          background: "oklch(0.35 0.12 140 / 0.3)",
                          border: "1px solid oklch(0.65 0.18 140)",
                          color: "oklch(0.78 0.18 140)",
                        }}
                      >
                        {approve.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        data-ocid={`admin.item.${idx + 1}.delete_button`}
                        onClick={() => handleReject(req.id)}
                        disabled={approve.isPending || reject.isPending}
                        className="flex-1 h-10 font-bold rounded-xl text-sm"
                        style={{
                          background: "oklch(0.25 0.10 27 / 0.3)",
                          border: "1px solid oklch(0.577 0.245 27)",
                          color: "oklch(0.70 0.20 27)",
                        }}
                      >
                        {reject.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "helpdesk" && <HelpDeskPanel isAdmin={effectiveAdmin} />}
      </ScrollArea>
    </div>
  );
}
