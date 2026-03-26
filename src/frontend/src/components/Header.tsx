import { Coins, Menu } from "lucide-react";

interface HeaderProps {
  balance?: bigint;
  onMenuClick?: () => void;
}

export function Header({ balance, onMenuClick }: HeaderProps) {
  const displayBalance =
    balance !== undefined ? Number(balance).toLocaleString() : "--";

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border"
      style={{ background: "oklch(0.14 0.04 245)" }}
    >
      <button
        type="button"
        data-ocid="header.menu.button"
        onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.60 0.14 82))",
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
        <span
          className="text-xl font-bold tracking-widest"
          style={{ color: "oklch(0.78 0.14 82)" }}
        >
          BAJI WIN
        </span>
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
        <span>{displayBalance}</span>
      </div>
    </header>
  );
}
