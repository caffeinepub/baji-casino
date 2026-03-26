import { Gift, Home, Shield, User, Wallet } from "lucide-react";

export type Page = "lobby" | "promotions" | "deposit" | "account" | "admin";

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin?: boolean;
}

export function BottomNav({
  currentPage,
  onNavigate,
  isAdmin,
}: BottomNavProps) {
  const items: {
    id: Page;
    label: string;
    icon: React.ElementType;
    ocid: string;
  }[] = [
    { id: "lobby", label: "Home", icon: Home, ocid: "nav.home.link" },
    {
      id: "promotions",
      label: "Promotions",
      icon: Gift,
      ocid: "nav.promotions.link",
    },
    {
      id: "deposit",
      label: "Recharge",
      icon: Wallet,
      ocid: "nav.deposit.link",
    },
    { id: "account", label: "Account", icon: User, ocid: "nav.account.link" },
    ...(isAdmin
      ? [
          {
            id: "admin" as Page,
            label: "Admin",
            icon: Shield,
            ocid: "nav.admin.link",
          },
        ]
      : []),
  ];

  return (
    <nav
      className="flex-shrink-0 border-t border-border"
      style={{ background: "oklch(0.14 0.04 245)" }}
    >
      <div className="flex">
        {items.map(({ id, label, icon: Icon, ocid }) => {
          const isActive = currentPage === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={ocid}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center flex-1 py-3 gap-1 transition-all relative ${
                isActive ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-0 w-8 h-0.5 rounded-full"
                  style={{ background: "oklch(0.78 0.14 82)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
