import { useEffect, useRef } from "react";

const MESSAGES = [
  { id: "m1", text: "🎰 Player_7823 won 2,500 TK on Crazy Time!" },
  { id: "m2", text: "🔥 Player_4521 hit 10x on Roulette!" },
  { id: "m3", text: "💰 Player_1129 won 8,400 TK on Super Sic Bo!" },
  { id: "m4", text: "🎯 Player_9934 hit CRAZY TIME bonus!" },
  { id: "m5", text: "⚡ Player_3302 won 1,800 TK on Dragon Tiger!" },
  { id: "m6", text: "🏆 Player_5678 hit 24x Triple on Sic Bo!" },
  { id: "m7", text: "🎲 Player_2211 won 3,600 TK on Bac Bo!" },
  { id: "m8", text: "🌟 Player_8847 hit 20x on Crazy Time!" },
  { id: "m9", text: "💎 Player_6613 won 5,500 TK on Fan Tan!" },
  { id: "m10", text: "🔴 Player_4409 hit Lucky 7 on Thai Hi-Lo!" },
  { id: "m11", text: "🎉 Player_7751 won 900 TK on Funky Time!" },
  { id: "m12", text: "⭐ Player_3318 hit 36x number bet on Roulette!" },
];

export function LiveTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Clone children for seamless loop
    const original = Array.from(track.children);
    for (const child of original) {
      track.appendChild(child.cloneNode(true));
    }

    const totalWidth = track.scrollWidth / 2;

    function tick() {
      posRef.current += 0.6;
      if (posRef.current >= totalWidth) {
        posRef.current = 0;
      }
      if (track) {
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className="flex-shrink-0 overflow-hidden"
      style={{
        background: "oklch(0.12 0.04 245)",
        borderBottom: "1px solid oklch(0.78 0.14 82 / 0.25)",
        height: "34px",
      }}
    >
      <div className="flex items-center h-full">
        {/* Label */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full text-xs font-bold tracking-widest z-10"
          style={{
            background: "oklch(0.78 0.14 82)",
            color: "oklch(0.14 0.03 245)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          LIVE
        </div>
        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={trackRef}
            className="flex items-center whitespace-nowrap will-change-transform"
          >
            {MESSAGES.map((msg) => (
              <span
                key={msg.id}
                className="inline-block px-6 text-xs font-medium"
                style={{ color: "oklch(0.78 0.14 82)" }}
              >
                {msg.text}
                <span className="mx-4 opacity-40">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
