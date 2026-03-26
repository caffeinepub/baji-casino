import { ArrowLeft, Gift, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface PromotionsPageProps {
  onBack?: () => void;
}

export function PromotionsPage({ onBack }: PromotionsPageProps) {
  const promos = [
    {
      icon: Gift,
      title: "Welcome Package",
      desc: "Recharge করুন এবং game খেলা শুরু করুন — bKash বা Nagad দিয়ে সহজে!",
      badge: "NEW MEMBER",
      color: "oklch(0.65 0.20 25)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.08 25), oklch(0.18 0.04 245))",
    },
    {
      icon: Trophy,
      title: "Weekend Cashback",
      desc: "Get 20% cashback on your weekend losses — every Saturday and Sunday!",
      badge: "WEEKEND",
      color: "oklch(0.65 0.18 160)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.07 160), oklch(0.18 0.04 245))",
    },
    {
      icon: Star,
      title: "Refer a Friend",
      desc: "Invite friends and earn 500 TK for every friend who signs up.",
      badge: "REFERRAL",
      color: "oklch(0.65 0.18 270)",
      gradient:
        "linear-gradient(135deg, oklch(0.22 0.07 270), oklch(0.18 0.04 245))",
    },
  ];

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
            data-ocid="promotions.back.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.22 0.04 245)" }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
        )}
        <h2 className="font-bold text-foreground">Promotions & Bonuses</h2>
      </div>

      <div className="px-4 pt-4 pb-24">
        <div className="space-y-4">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: promo.gradient,
                border: `1px solid ${promo.color}30`,
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${promo.color}20` }}
                  >
                    <promo.icon size={20} style={{ color: promo.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">
                        {promo.title}
                      </h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${promo.color}25`,
                          color: promo.color,
                        }}
                      >
                        {promo.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {promo.desc}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
