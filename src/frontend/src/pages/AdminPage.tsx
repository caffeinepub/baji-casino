import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShieldOff,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  useApproveRecharge,
  useIsAdmin,
  usePendingRechargeRequests,
  useRejectRecharge,
} from "../hooks/useQueries";

function shortPrincipal(p: { toString(): string }) {
  const s = p.toString();
  if (s.length <= 12) return s;
  return `${s.slice(0, 5)}...${s.slice(-5)}`;
}

function formatTime(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

interface AdminPageProps {
  onBack?: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: requests = [], isLoading: reqLoading } =
    usePendingRechargeRequests();
  const approve = useApproveRecharge();
  const reject = useRejectRecharge();

  const handleApprove = async (id: bigint) => {
    await approve.mutateAsync(id);
    toast.success("Request approved! TK added to user.");
  };

  const handleReject = async (id: bigint) => {
    await reject.mutateAsync(id);
    toast.error("Request rejected.");
  };

  if (adminLoading) {
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

  if (!isAdmin) {
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
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-foreground"
          >
            Admin Panel
          </motion.h2>
          <p className="text-xs text-muted-foreground">
            Pending Recharge Requests
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-24">
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
                        border: `1px solid ${req.method === "bkash" ? "oklch(0.65 0.22 0 / 0.5)" : "oklch(0.75 0.18 55 / 0.5)"}`,
                      }}
                    >
                      {req.method === "bkash" ? "🩷 bKash" : "🟠 Nagad"}
                    </Badge>
                    <span
                      className="text-lg font-black"
                      style={{ color: "oklch(0.78 0.14 82)" }}
                    >
                      {Number(req.amount).toLocaleString()} TK
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(req.createdAt)}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex gap-2 text-xs">
                    <span className="text-muted-foreground">User:</span>
                    <span className="text-foreground font-mono">
                      {shortPrincipal(req.userId)}
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
      </ScrollArea>
    </div>
  );
}
