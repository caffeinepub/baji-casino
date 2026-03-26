export type BetOption = { label: string; value: string; multiplier: number };

export interface GameDefinition {
  id: string;
  name: string;
  provider: "EVOLUTION" | "SEXYBCRT" | "PRAGMATIC" | "NETENT";
  gradient: string;
  accentColor: string;
  description: string;
  betOptions: BetOption[];
  image: string;
  basePlayers: number;
  simulate: (bet: string) => GameRoundResult;
}

export interface GameRoundResult {
  won: boolean;
  multiplier: number;
  description: string;
  details: string;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const GAMES: GameDefinition[] = [
  {
    id: "roulette",
    name: "Roulette",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #8b0000 40%, #1a0a0a 100%)",
    accentColor: "#dc2626",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Bet on Red, Black, Green or a number 0-36",
    basePlayers: 312,
    betOptions: [
      { label: "Red", value: "red", multiplier: 2 },
      { label: "Black", value: "black", multiplier: 2 },
      { label: "Green (0)", value: "green", multiplier: 14 },
      { label: "Number 7", value: "7", multiplier: 36 },
      { label: "Number 17", value: "17", multiplier: 36 },
      { label: "Number 23", value: "23", multiplier: 36 },
    ],
    simulate(bet: string): GameRoundResult {
      const spin = rand(0, 36);
      const isGreen = spin === 0;
      const isRed =
        !isGreen &&
        [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ].includes(spin);
      const isBlack = !isGreen && !isRed;
      let won = false;
      let multiplier = 0;
      if (bet === "green" && isGreen) {
        won = true;
        multiplier = 14;
      } else if (bet === "red" && isRed) {
        won = true;
        multiplier = 2;
      } else if (bet === "black" && isBlack) {
        won = true;
        multiplier = 2;
      } else if (!Number.isNaN(Number(bet)) && Number(bet) === spin) {
        won = true;
        multiplier = 36;
      }
      return {
        won,
        multiplier,
        description: `Ball landed on ${spin} (${isGreen ? "Green" : isRed ? "Red" : "Black"})`,
        details: won ? `You won ${multiplier}x!` : "Better luck next spin!",
      };
    },
  },
  {
    id: "baccarat",
    name: "Baccarat",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #ca8a04 100%)",
    accentColor: "#10b981",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "Player vs Banker — closest to 9 wins",
    basePlayers: 521,
    betOptions: [
      { label: "Player", value: "player", multiplier: 2 },
      { label: "Banker", value: "banker", multiplier: 1.95 },
      { label: "Tie", value: "tie", multiplier: 8 },
      { label: "Player Pair", value: "ppair", multiplier: 11 },
      { label: "Banker Pair", value: "bpair", multiplier: 11 },
    ],
    simulate(bet: string): GameRoundResult {
      const cardVal = () => Math.min(rand(1, 13), 10) % 10;
      const p = (cardVal() + cardVal()) % 10;
      const b = (cardVal() + cardVal()) % 10;
      const outcome = p > b ? "player" : b > p ? "banker" : "tie";
      const ppair = rand(1, 13) > 12;
      const bpair = rand(1, 13) > 12;
      let won = false;
      let multiplier = 0;
      if (bet === "player" && outcome === "player") {
        won = true;
        multiplier = 2;
      } else if (bet === "banker" && outcome === "banker") {
        won = true;
        multiplier = 1.95;
      } else if (bet === "tie" && outcome === "tie") {
        won = true;
        multiplier = 8;
      } else if (bet === "ppair" && ppair) {
        won = true;
        multiplier = 11;
      } else if (bet === "bpair" && bpair) {
        won = true;
        multiplier = 11;
      }
      return {
        won,
        multiplier,
        description: `Player: ${p} | Banker: ${b}`,
        details:
          outcome === "tie"
            ? "Tie!"
            : `${outcome.charAt(0).toUpperCase()}${outcome.slice(1)} wins!`,
      };
    },
  },
  {
    id: "blackjack",
    name: "Blackjack",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    accentColor: "#22c55e",
    image: "/assets/generated/game-blackjack.dim_400x300.jpg",
    description: "Beat the dealer — get closer to 21 without busting!",
    basePlayers: 387,
    betOptions: [
      { label: "Win", value: "win", multiplier: 2 },
      { label: "Blackjack!", value: "blackjack", multiplier: 2.5 },
      { label: "Dealer Bust", value: "bust", multiplier: 2 },
    ],
    simulate(bet: string): GameRoundResult {
      const card = () => Math.min(rand(1, 13), 10);
      const playerTotal = card() + card();
      const dealerTotal = card() + card();
      const isBlackjack = playerTotal === 21;
      const dealerBust =
        dealerTotal > 21 || (dealerTotal < 17 && rand(1, 6) > 4);
      const playerWin = !dealerBust
        ? playerTotal <= 21 && playerTotal > dealerTotal
        : true;
      let won = false;
      let multiplier = 0;
      if (bet === "blackjack" && isBlackjack) {
        won = true;
        multiplier = 2.5;
      } else if (bet === "bust" && dealerBust) {
        won = true;
        multiplier = 2;
      } else if (bet === "win" && playerWin && !isBlackjack) {
        won = true;
        multiplier = 2;
      }
      return {
        won,
        multiplier,
        description: `Your: ${playerTotal} | Dealer: ${dealerBust ? "Bust" : dealerTotal}`,
        details: isBlackjack
          ? "Blackjack!"
          : playerWin
            ? "You win!"
            : "Dealer wins!",
      };
    },
  },
  {
    id: "crazytime",
    name: "Crazy Time",
    provider: "EVOLUTION",
    gradient:
      "linear-gradient(135deg, #ffd700 0%, #ff6b35 30%, #e91e8c 60%, #7c3aed 100%)",
    accentColor: "#f59e0b",
    image: "/assets/generated/game-crazytime.dim_400x300.jpg",
    description: "Spin the mega wheel — pick your multiplier segment!",
    basePlayers: 448,
    betOptions: [
      { label: "1x (Most likely)", value: "1x", multiplier: 1 },
      { label: "2x", value: "2x", multiplier: 2 },
      { label: "5x", value: "5x", multiplier: 5 },
      { label: "10x", value: "10x", multiplier: 10 },
      { label: "Crazy Time!", value: "crazy", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const wheel = [
        "1x",
        "1x",
        "1x",
        "1x",
        "1x",
        "1x",
        "1x",
        "1x",
        "2x",
        "2x",
        "2x",
        "2x",
        "5x",
        "5x",
        "10x",
        "CRAZY!",
      ];
      const result = wheel[rand(0, wheel.length - 1)];
      const betLabel = bet === "crazy" ? "CRAZY!" : bet;
      const won = betLabel === result;
      const multMap: Record<string, number> = {
        "1x": 1,
        "2x": 2,
        "5x": 5,
        "10x": 10,
        "CRAZY!": 20,
      };
      return {
        won,
        multiplier: won ? multMap[result] : 0,
        description: result,
        details: won ? "Amazing! You hit it!" : "The wheel spins again!",
      };
    },
  },
  {
    id: "teenpatti",
    name: "Teen Patti",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 40%, #d97706 100%)",
    accentColor: "#f97316",
    image: "/assets/generated/game-teenpatti.dim_400x300.jpg",
    description: "Indian 3-card poker — Andar vs Bahar, best hand wins!",
    basePlayers: 634,
    betOptions: [
      { label: "Andar (Player A)", value: "andar", multiplier: 2 },
      { label: "Bahar (Player B)", value: "bahar", multiplier: 2 },
      { label: "Pair+", value: "pair", multiplier: 5 },
      { label: "Tie", value: "tie", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const handRank = () => rand(1, 100);
      const a = handRank();
      const b = handRank();
      const isTie = Math.abs(a - b) < 5;
      const outcome = isTie ? "tie" : a > b ? "andar" : "bahar";
      const isPair = rand(1, 10) > 7;
      let won = false;
      let multiplier = 0;
      if (bet === "pair" && isPair) {
        won = true;
        multiplier = 5;
      } else if (bet === "tie" && isTie) {
        won = true;
        multiplier = 10;
      } else if ((bet === "andar" || bet === "bahar") && bet === outcome) {
        won = true;
        multiplier = 2;
      }
      return {
        won,
        multiplier,
        description: `Andar: ${a} | Bahar: ${b}`,
        details: isTie
          ? "Tie!"
          : `${outcome.charAt(0).toUpperCase()}${outcome.slice(1)} wins!`,
      };
    },
  },
  {
    id: "andarbahar",
    name: "Andar Bahar",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #f59e0b 100%)",
    accentColor: "#a78bfa",
    image: "/assets/generated/game-andarbahar.dim_400x300.jpg",
    description: "Pick Andar or Bahar — matching card side wins!",
    basePlayers: 412,
    betOptions: [
      { label: "Andar", value: "andar", multiplier: 1.9 },
      { label: "Bahar", value: "bahar", multiplier: 2 },
      { label: "1st card Andar", value: "first_andar", multiplier: 3.5 },
    ],
    simulate(bet: string): GameRoundResult {
      const outcome = rand(0, 1) === 0 ? "andar" : "bahar";
      const firstAndar = rand(0, 1) === 0;
      let won = false;
      let multiplier = 0;
      if (bet === "andar" && outcome === "andar") {
        won = true;
        multiplier = 1.9;
      } else if (bet === "bahar" && outcome === "bahar") {
        won = true;
        multiplier = 2;
      } else if (bet === "first_andar" && firstAndar) {
        won = true;
        multiplier = 3.5;
      }
      return {
        won,
        multiplier,
        description: `Matching card fell on: ${outcome.charAt(0).toUpperCase()}${outcome.slice(1)}`,
        details: won ? "Correct side!" : "Wrong side this time!",
      };
    },
  },
  {
    id: "dragontiger",
    name: "Dragon Tiger",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 40%, #b45309 100%)",
    accentColor: "#ef4444",
    image: "/assets/generated/game-dragontiger.dim_400x300.jpg",
    description: "Dragon vs Tiger — highest card wins. Simple and fast!",
    basePlayers: 203,
    betOptions: [
      { label: "🐉 Dragon", value: "dragon", multiplier: 2 },
      { label: "🐯 Tiger", value: "tiger", multiplier: 2 },
      { label: "Tie", value: "tie", multiplier: 11 },
    ],
    simulate(bet: string): GameRoundResult {
      const cards = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
      ];
      const dIdx = rand(0, 12);
      const tIdx = rand(0, 12);
      const outcome = dIdx > tIdx ? "dragon" : tIdx > dIdx ? "tiger" : "tie";
      const won = bet === outcome;
      const mult = bet === "tie" ? 11 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Dragon: ${cards[dIdx]} | Tiger: ${cards[tIdx]}`,
        details:
          outcome === "tie"
            ? "It's a tie!"
            : `${outcome.charAt(0).toUpperCase()}${outcome.slice(1)} wins!`,
      };
    },
  },
  {
    id: "monopoly",
    name: "Monopoly Live",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #dc2626 100%)",
    accentColor: "#3b82f6",
    image: "/assets/generated/game-monopoly.dim_400x300.jpg",
    description: "Spin the wheel, land on Mr Monopoly bonus rounds!",
    basePlayers: 589,
    betOptions: [
      { label: "1 (Most likely)", value: "1", multiplier: 1 },
      { label: "2", value: "2", multiplier: 2 },
      { label: "4", value: "4", multiplier: 4 },
      { label: "Chance", value: "chance", multiplier: 6 },
      { label: "2 Rolls", value: "2rolls", multiplier: 10 },
      { label: "4 Rolls", value: "4rolls", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const wheel = [
        "1",
        "1",
        "1",
        "1",
        "2",
        "2",
        "2",
        "4",
        "4",
        "chance",
        "chance",
        "2rolls",
        "4rolls",
      ];
      const result = wheel[rand(0, wheel.length - 1)];
      const won = bet === result;
      const multMap: Record<string, number> = {
        "1": 1,
        "2": 2,
        "4": 4,
        chance: 6,
        "2rolls": 10,
        "4rolls": 20,
      };
      return {
        won,
        multiplier: won ? (multMap[result] ?? 1) : 0,
        description: `Wheel landed on: ${result.toUpperCase()}`,
        details: won ? "Collect your rent!" : "Pass Go and try again!",
      };
    },
  },
  {
    id: "dreamcatcher",
    name: "Dream Catcher",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 50%, #7c3aed 100%)",
    accentColor: "#818cf8",
    image: "/assets/generated/game-dreamcatcher.dim_400x300.jpg",
    description: "Big money wheel — bet on 1, 2, 5, 10, 20 or 40!",
    basePlayers: 276,
    betOptions: [
      { label: "1 (×1)", value: "1", multiplier: 1 },
      { label: "2 (×2)", value: "2", multiplier: 2 },
      { label: "5 (×5)", value: "5", multiplier: 5 },
      { label: "10 (×10)", value: "10", multiplier: 10 },
      { label: "20 (×20)", value: "20", multiplier: 20 },
      { label: "40 (×40)", value: "40", multiplier: 40 },
    ],
    simulate(bet: string): GameRoundResult {
      const wheel = [
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "2",
        "2",
        "2",
        "2",
        "5",
        "5",
        "5",
        "10",
        "10",
        "20",
        "40",
      ];
      const result = wheel[rand(0, wheel.length - 1)];
      const won = bet === result;
      return {
        won,
        multiplier: won ? Number(result) : 0,
        description: `Wheel stopped on ${result}x`,
        details: won ? `${result}x multiplier!` : "Not this time!",
      };
    },
  },
  {
    id: "lightningdice",
    name: "Lightning Dice",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0c1445 0%, #1e40af 50%, #7c3aed 100%)",
    accentColor: "#60a5fa",
    image: "/assets/generated/game-lightningdice.dim_400x300.jpg",
    description: "3 dice drop — lightning strikes random totals for mega wins!",
    basePlayers: 198,
    betOptions: [
      { label: "Small (3-10)", value: "small", multiplier: 2 },
      { label: "Big (11-18)", value: "big", multiplier: 2 },
      { label: "Total 7", value: "7", multiplier: 6 },
      { label: "Total 10", value: "10", multiplier: 6 },
      { label: "Triple (Lightning!)", value: "triple", multiplier: 50 },
    ],
    simulate(bet: string): GameRoundResult {
      const d1 = rand(1, 6);
      const d2 = rand(1, 6);
      const d3 = rand(1, 6);
      const total = d1 + d2 + d3;
      const isTriple = d1 === d2 && d2 === d3;
      const isSmall = total <= 10;
      let won = false;
      let multiplier = 0;
      if (bet === "triple" && isTriple) {
        won = true;
        multiplier = 50;
      } else if (bet === "small" && isSmall && !isTriple) {
        won = true;
        multiplier = 2;
      } else if (bet === "big" && !isSmall && !isTriple) {
        won = true;
        multiplier = 2;
      } else if (bet === String(total) && !isTriple) {
        won = true;
        multiplier = 6;
      }
      return {
        won,
        multiplier,
        description: `⚡ ${d1} + ${d2} + ${d3} = ${total}${isTriple ? " ⚡ LIGHTNING!" : ""}`,
        details: isTriple
          ? "Lightning Triple!"
          : won
            ? "Correct prediction!"
            : `Total was ${total}`,
      };
    },
  },
  {
    id: "speedbaccarat",
    name: "Speed Baccarat",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #14532d 0%, #166534 50%, #ca8a04 100%)",
    accentColor: "#4ade80",
    image: "/assets/generated/game-speedbaccarat.dim_400x300.jpg",
    description: "Fast-paced Baccarat — results in under 30 seconds!",
    basePlayers: 445,
    betOptions: [
      { label: "Player", value: "player", multiplier: 2 },
      { label: "Banker", value: "banker", multiplier: 1.95 },
      { label: "Tie", value: "tie", multiplier: 8 },
    ],
    simulate(bet: string): GameRoundResult {
      const cardVal = () => Math.min(rand(1, 13), 10) % 10;
      const p = (cardVal() + cardVal()) % 10;
      const b = (cardVal() + cardVal()) % 10;
      const outcome = p > b ? "player" : b > p ? "banker" : "tie";
      const won = bet === outcome;
      const mult = bet === "tie" ? 8 : bet === "banker" ? 1.95 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Player: ${p} | Banker: ${b}`,
        details:
          outcome === "tie"
            ? "Tie!"
            : `${outcome.charAt(0).toUpperCase()}${outcome.slice(1)} wins!`,
      };
    },
  },
  {
    id: "poker",
    name: "Casino Hold'em",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #065f46 100%)",
    accentColor: "#6366f1",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "Texas Hold'em style — beat the dealer's hand!",
    basePlayers: 267,
    betOptions: [
      { label: "Call & Win", value: "win", multiplier: 2 },
      { label: "Flush Bonus", value: "flush", multiplier: 8 },
      { label: "Full House", value: "fullhouse", multiplier: 15 },
      { label: "4 of a Kind", value: "quads", multiplier: 25 },
    ],
    simulate(bet: string): GameRoundResult {
      const handStrength = rand(1, 100);
      const dealerStrength = rand(1, 100);
      const playerWins = handStrength > dealerStrength;
      const isFlush = rand(1, 10) > 8;
      const isFullHouse = rand(1, 20) > 18;
      const isQuads = rand(1, 50) > 48;
      let won = false;
      let multiplier = 0;
      if (bet === "win" && playerWins) {
        won = true;
        multiplier = 2;
      } else if (bet === "flush" && isFlush) {
        won = true;
        multiplier = 8;
      } else if (bet === "fullhouse" && isFullHouse) {
        won = true;
        multiplier = 15;
      } else if (bet === "quads" && isQuads) {
        won = true;
        multiplier = 25;
      }
      return {
        won,
        multiplier,
        description: `Your hand strength: ${handStrength} | Dealer: ${dealerStrength}`,
        details: playerWins
          ? "You beat the dealer!"
          : "Dealer wins this round!",
      };
    },
  },
  {
    id: "wheeloffortune",
    name: "Wheel of Fortune",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #713f12 0%, #d97706 50%, #dc2626 100%)",
    accentColor: "#fbbf24",
    image: "/assets/generated/game-wheeloffortune.dim_400x300.jpg",
    description: "Spin the lucky wheel — massive jackpots await!",
    basePlayers: 334,
    betOptions: [
      { label: "2x Lucky", value: "2x", multiplier: 2 },
      { label: "5x Lucky", value: "5x", multiplier: 5 },
      { label: "10x Gold", value: "10x", multiplier: 10 },
      { label: "25x Jackpot", value: "25x", multiplier: 25 },
      { label: "100x Mega!", value: "100x", multiplier: 100 },
    ],
    simulate(bet: string): GameRoundResult {
      const wheel = [
        "2x",
        "2x",
        "2x",
        "2x",
        "2x",
        "5x",
        "5x",
        "5x",
        "10x",
        "10x",
        "25x",
        "100x",
      ];
      const result = wheel[rand(0, wheel.length - 1)];
      const won = bet === result;
      const multMap: Record<string, number> = {
        "2x": 2,
        "5x": 5,
        "10x": 10,
        "25x": 25,
        "100x": 100,
      };
      return {
        won,
        multiplier: won ? multMap[result] : 0,
        description: `🎡 Wheel landed on ${result}!`,
        details: won
          ? `JACKPOT! ${result} multiplier!`
          : "Spin again for bigger wins!",
      };
    },
  },
  {
    id: "megaball",
    name: "Mega Ball",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #0e7490 100%)",
    accentColor: "#38bdf8",
    image: "/assets/generated/game-megaball.dim_400x300.jpg",
    description: "Lottery-style game — match numbers, hit the Mega Ball!",
    basePlayers: 892,
    betOptions: [
      { label: "3 Match", value: "3match", multiplier: 5 },
      { label: "4 Match", value: "4match", multiplier: 25 },
      { label: "5 Match", value: "5match", multiplier: 100 },
      { label: "Mega Ball!", value: "mega", multiplier: 200 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let outcome = "none";
      if (roll > 99) outcome = "mega";
      else if (roll > 95) outcome = "5match";
      else if (roll > 80) outcome = "4match";
      else if (roll > 55) outcome = "3match";
      const won = bet === outcome;
      const multMap: Record<string, number> = {
        "3match": 5,
        "4match": 25,
        "5match": 100,
        mega: 200,
      };
      return {
        won,
        multiplier: won ? (multMap[bet] ?? 0) : 0,
        description:
          outcome === "none"
            ? "No match this round"
            : `${outcome.toUpperCase()} hit!`,
        details: won
          ? `Incredible! ${multMap[bet]}x win!`
          : "Better luck on the next draw!",
      };
    },
  },
  {
    id: "infiniteblackjack",
    name: "Infinite Blackjack",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 50%, #064e3b 100%)",
    accentColor: "#34d399",
    image: "/assets/generated/game-infiniteblackjack.dim_400x300.jpg",
    description: "Unlimited seats Blackjack — everyone plays simultaneously!",
    basePlayers: 1204,
    betOptions: [
      { label: "Win", value: "win", multiplier: 2 },
      { label: "Blackjack!", value: "blackjack", multiplier: 2.5 },
      { label: "21+3 Bonus", value: "bonus", multiplier: 9 },
    ],
    simulate(bet: string): GameRoundResult {
      const card = () => Math.min(rand(1, 13), 10);
      const playerTotal = card() + card();
      const dealerCard = card();
      const isBlackjack = playerTotal === 21;
      const hasBonus = rand(1, 12) > 10;
      const playerWin =
        playerTotal <= 21 && playerTotal > dealerCard + rand(3, 9);
      let won = false;
      let multiplier = 0;
      if (bet === "blackjack" && isBlackjack) {
        won = true;
        multiplier = 2.5;
      } else if (bet === "bonus" && hasBonus) {
        won = true;
        multiplier = 9;
      } else if (bet === "win" && playerWin && !isBlackjack) {
        won = true;
        multiplier = 2;
      }
      return {
        won,
        multiplier,
        description: `Your total: ${playerTotal} | Dealer showing: ${dealerCard}`,
        details: isBlackjack
          ? "Blackjack!"
          : playerWin
            ? "You win!"
            : "Dealer wins!",
      };
    },
  },
  {
    id: "bacbo",
    name: "Bac Bo",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 40%, #c6940d 100%)",
    accentColor: "#3b82f6",
    image: "/assets/generated/game-bacbo.dim_400x300.jpg",
    description: "Player vs Banker — two dice each. Highest total wins",
    basePlayers: 189,
    betOptions: [
      { label: "Player Wins", value: "player", multiplier: 2 },
      { label: "Banker Wins", value: "banker", multiplier: 2 },
      { label: "Tie", value: "tie", multiplier: 8 },
    ],
    simulate(bet: string): GameRoundResult {
      const p = rand(1, 6) + rand(1, 6);
      const b = rand(1, 6) + rand(1, 6);
      const outcome = p > b ? "player" : b > p ? "banker" : "tie";
      const won = bet === outcome;
      const multiplier = bet === "tie" ? 8 : 2;
      return {
        won,
        multiplier: won ? multiplier : 0,
        description: `Player: ${p} | Banker: ${b}`,
        details: `${outcome === "tie" ? "Tie!" : `${outcome.charAt(0).toUpperCase()}${outcome.slice(1)} wins!`}`,
      };
    },
  },
  {
    id: "sicbo",
    name: "Super Sic Bo",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #4c1d95 50%, #065f46 100%)",
    accentColor: "#7c3aed",
    image: "/assets/generated/game-sicbo.dim_400x300.jpg",
    description: "Bet on the total of 3 dice — Small (4-10) or Big (11-17)",
    basePlayers: 247,
    betOptions: [
      { label: "Small (4-10)", value: "small", multiplier: 2 },
      { label: "Big (11-17)", value: "big", multiplier: 2 },
      { label: "Triple (any)", value: "triple", multiplier: 24 },
    ],
    simulate(bet: string): GameRoundResult {
      const d1 = rand(1, 6);
      const d2 = rand(1, 6);
      const d3 = rand(1, 6);
      const total = d1 + d2 + d3;
      const isTriple = d1 === d2 && d2 === d3;
      const isSmall = total >= 4 && total <= 10 && !isTriple;
      let won = false;
      if (bet === "small" && isSmall) won = true;
      else if (bet === "big" && !isSmall && !isTriple) won = true;
      else if (bet === "triple" && isTriple) won = true;
      const mult = bet === "triple" ? 24 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Dice: ${d1} + ${d2} + ${d3} = ${total}`,
        details: isTriple ? `Triple ${d1}s!` : isSmall ? "Small!" : "Big!",
      };
    },
  },
  {
    id: "funkytime",
    name: "Funky Time",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #ff0099 0%, #ff6600 50%, #ffcc00 100%)",
    accentColor: "#ec4899",
    image: "/assets/generated/game-funkytime.dim_400x300.jpg",
    description: "Pick a funky color — win big on the retro wheel!",
    basePlayers: 156,
    betOptions: [
      { label: "🔴 Red", value: "red", multiplier: 3 },
      { label: "🟡 Yellow", value: "yellow", multiplier: 4 },
      { label: "🔵 Blue", value: "blue", multiplier: 5 },
      { label: "🟢 Green", value: "green", multiplier: 6 },
    ],
    simulate(bet: string): GameRoundResult {
      const colors = [
        "red",
        "red",
        "red",
        "yellow",
        "yellow",
        "blue",
        "blue",
        "green",
      ];
      const result = colors[rand(0, colors.length - 1)];
      const won = bet === result;
      const multMap: Record<string, number> = {
        red: 3,
        yellow: 4,
        blue: 5,
        green: 6,
      };
      return {
        won,
        multiplier: won ? multMap[result] : 0,
        description: `It's ${result.toUpperCase()}!`,
        details: won ? "Funky winner!" : "Keep on grooving!",
      };
    },
  },
  {
    id: "fantan",
    name: "Fan Tan",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #b45309 100%)",
    accentColor: "#10b981",
    image: "/assets/generated/game-fantan.dim_400x300.jpg",
    description: "Bet on the remainder 1-4 after dividing bead count by 4",
    basePlayers: 98,
    betOptions: [
      { label: "1", value: "1", multiplier: 4 },
      { label: "2", value: "2", multiplier: 4 },
      { label: "3", value: "3", multiplier: 4 },
      { label: "4", value: "4", multiplier: 4 },
    ],
    simulate(bet: string): GameRoundResult {
      const beads = rand(1, 200);
      const remainder = beads % 4 === 0 ? 4 : beads % 4;
      const won = Number(bet) === remainder;
      return {
        won,
        multiplier: won ? 4 : 0,
        description: `${beads} beads ÷ 4, remainder: ${remainder}`,
        details: won ? "Perfect prediction!" : `Result was ${remainder}`,
      };
    },
  },
  {
    id: "thaihilo",
    name: "Thai Hi-Lo",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #06b6d4 100%)",
    accentColor: "#06b6d4",
    image: "/assets/generated/game-thaihilo.dim_400x300.jpg",
    description: "Two dice — bet on Hi (8-12), Lo (2-6), or Tie (7)",
    basePlayers: 134,
    betOptions: [
      { label: "Hi (8-12)", value: "hi", multiplier: 2 },
      { label: "Lo (2-6)", value: "lo", multiplier: 2 },
      { label: "Tie (7)", value: "tie", multiplier: 6 },
    ],
    simulate(bet: string): GameRoundResult {
      const d1 = rand(1, 6);
      const d2 = rand(1, 6);
      const total = d1 + d2;
      const outcome = total >= 8 ? "hi" : total <= 6 ? "lo" : "tie";
      const won = bet === outcome;
      const mult = bet === "tie" ? 6 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Dice: ${d1} + ${d2} = ${total}`,
        details:
          outcome === "hi"
            ? "High roll!"
            : outcome === "lo"
              ? "Low roll!"
              : "Lucky 7!",
      };
    },
  },
  {
    id: "slots",
    name: "Slots",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #6d1a6d 50%, #1a0a2e 100%)",
    accentColor: "#a855f7",
    image: "/assets/generated/game-slots.dim_400x300.jpg",
    description: "3 reels — Cherry, Bar, 7, Jackpot!",
    basePlayers: 845,
    betOptions: [
      { label: "Cherry", value: "cherry", multiplier: 3 },
      { label: "Bar", value: "bar", multiplier: 5 },
      { label: "Lucky 7", value: "seven", multiplier: 7 },
      { label: "Jackpot", value: "jackpot", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const symbols = [
        "cherry",
        "bar",
        "seven",
        "jackpot",
        "cherry",
        "cherry",
        "bar",
        "bar",
        "seven",
      ];
      const r1 = symbols[rand(0, symbols.length - 1)];
      const r2 = symbols[rand(0, symbols.length - 1)];
      const r3 = symbols[rand(0, symbols.length - 1)];
      const allMatch = r1 === r2 && r2 === r3;
      const won = allMatch && r1 === bet;
      const partial = (r1 === bet || r2 === bet || r3 === bet) && !allMatch;
      const multiplier = won
        ? bet === "jackpot"
          ? 20
          : bet === "seven"
            ? 7
            : bet === "bar"
              ? 5
              : 3
        : 0;
      return {
        won: won || partial,
        multiplier: partial ? 1.5 : multiplier,
        description: `${r1} | ${r2} | ${r3}`,
        details:
          allMatch && won
            ? "JACKPOT! Perfect match!"
            : partial
              ? "Partial match!"
              : "No match this time",
      };
    },
  },
  {
    id: "keno",
    name: "Keno",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
    accentColor: "#38bdf8",
    image: "/assets/generated/game-keno.dim_400x300.jpg",
    description: "Pick numbers 1-10, match to win big!",
    basePlayers: 234,
    betOptions: [
      { label: "1-3", value: "low", multiplier: 2 },
      { label: "4-6", value: "mid", multiplier: 4 },
      { label: "7-10", value: "high", multiplier: 6 },
      { label: "Exact 5", value: "five", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const drawn = rand(1, 10);
      const won =
        (bet === "low" && drawn <= 3) ||
        (bet === "mid" && drawn >= 4 && drawn <= 6) ||
        (bet === "high" && drawn >= 7) ||
        (bet === "five" && drawn === 5);
      const mult =
        bet === "five" ? 10 : bet === "high" ? 6 : bet === "mid" ? 4 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Drawn number: ${drawn}`,
        details: won
          ? `Correct! ${mult}x win!`
          : `You picked ${bet}, got ${drawn}`,
      };
    },
  },
  {
    id: "plinko",
    name: "Plinko",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
    accentColor: "#22c55e",
    image: "/assets/generated/game-plinko.dim_400x300.jpg",
    description: "Drop the ball — Low, Medium, or High risk!",
    basePlayers: 412,
    betOptions: [
      { label: "Low Risk", value: "low", multiplier: 1.5 },
      { label: "Medium Risk", value: "medium", multiplier: 3 },
      { label: "High Risk", value: "high", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let won = false;
      let multiplier = 0;
      if (bet === "low" && roll <= 55) {
        won = true;
        multiplier = 1.5;
      } else if (bet === "medium" && roll <= 35) {
        won = true;
        multiplier = 3;
      } else if (bet === "high" && roll <= 12) {
        won = true;
        multiplier = 10;
      }
      const slot = ["0.2x", "0.5x", "1x", "2x", "5x", "10x"][rand(0, 5)];
      return {
        won,
        multiplier,
        description: `Ball landed on ${slot} slot`,
        details: won ? `${bet} risk paid off!` : "Better luck next drop!",
      };
    },
  },
  {
    id: "mines",
    name: "Mines",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)",
    accentColor: "#f59e0b",
    image: "/assets/generated/game-mines.dim_400x300.jpg",
    description: "Pick tiles — find gems, avoid mines!",
    basePlayers: 389,
    betOptions: [
      { label: "1 Mine (Safe)", value: "1mine", multiplier: 1.3 },
      { label: "3 Mines", value: "3mine", multiplier: 2 },
      { label: "5 Mines (Risk)", value: "5mine", multiplier: 5 },
    ],
    simulate(bet: string): GameRoundResult {
      const mineCount = bet === "1mine" ? 1 : bet === "3mine" ? 3 : 5;
      const totalTiles = 25;
      const safeProb = (totalTiles - mineCount) / totalTiles;
      const won = Math.random() < safeProb;
      const mult = bet === "1mine" ? 1.3 : bet === "3mine" ? 2 : 5;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Found a diamond gem!" : "BOOM! Hit a mine!",
        details: won
          ? `Safe tile! ${mult}x win!`
          : `${mineCount} mines hidden in 25 tiles`,
      };
    },
  },
  {
    id: "crash",
    name: "Crash",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a2e1a 50%, #0a1a0a 100%)",
    accentColor: "#4ade80",
    image: "/assets/generated/game-crash.dim_400x300.jpg",
    description: "Cash out before the rocket crashes!",
    basePlayers: 621,
    betOptions: [
      { label: "Cash at 1.5x", value: "1.5", multiplier: 1.5 },
      { label: "Cash at 2x", value: "2", multiplier: 2 },
      { label: "Cash at 5x", value: "5", multiplier: 5 },
      { label: "Cash at 10x", value: "10", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const target = Number(bet);
      const crashPoint = Math.max(1, 1 / (Math.random() * 0.8 + 0.1));
      const won = crashPoint >= target;
      return {
        won,
        multiplier: won ? target : 0,
        description: `Rocket crashed at ${crashPoint.toFixed(2)}x`,
        details: won
          ? `You cashed out at ${target}x!`
          : `Crashed before ${target}x`,
      };
    },
  },
  {
    id: "fish",
    name: "Fish Shooting",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #06b6d4 100%)",
    accentColor: "#06b6d4",
    image: "/assets/generated/game-fish.dim_400x300.jpg",
    description: "Shoot fish to earn golden coins!",
    basePlayers: 290,
    betOptions: [
      { label: "Small Fish", value: "small", multiplier: 2 },
      { label: "Medium Fish", value: "medium", multiplier: 4 },
      { label: "Big Fish", value: "big", multiplier: 8 },
      { label: "Dragon Fish", value: "dragon", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const hitChance =
        bet === "small"
          ? 0.65
          : bet === "medium"
            ? 0.45
            : bet === "big"
              ? 0.3
              : 0.12;
      const won = Math.random() < hitChance;
      const mult =
        bet === "small" ? 2 : bet === "medium" ? 4 : bet === "big" ? 8 : 20;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? `${bet} fish caught!` : `${bet} fish escaped!`,
        details: won ? `${mult}x coins earned!` : "Better aim next time!",
      };
    },
  },
  {
    id: "jhandimunda",
    name: "Jhandi Munda",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)",
    accentColor: "#f87171",
    image: "/assets/generated/game-jhandimunda.dim_400x300.jpg",
    description: "6-symbol dice game — bet on your symbol!",
    basePlayers: 178,
    betOptions: [
      { label: "Heart", value: "heart", multiplier: 6 },
      { label: "Diamond", value: "diamond", multiplier: 6 },
      { label: "Club", value: "club", multiplier: 6 },
      { label: "Spade", value: "spade", multiplier: 6 },
      { label: "Flag", value: "flag", multiplier: 6 },
      { label: "Face", value: "face", multiplier: 6 },
    ],
    simulate(bet: string): GameRoundResult {
      const symbols = ["heart", "diamond", "club", "spade", "flag", "face"];
      const dice = [0, 1, 2, 3, 4, 5].map(() => symbols[rand(0, 5)]);
      const matchCount = dice.filter((d) => d === bet).length;
      const won = matchCount > 0;
      return {
        won,
        multiplier: won ? matchCount * 6 : 0,
        description: `Dice: ${dice.join(", ")}`,
        details: won
          ? `${matchCount} match(es)! ${matchCount * 6}x win!`
          : `No ${bet}s rolled`,
      };
    },
  },
  {
    id: "hilo",
    name: "Hi-Lo",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
    accentColor: "#818cf8",
    image: "/assets/generated/game-hilo.dim_400x300.jpg",
    description: "Predict if next card is Higher or Lower!",
    basePlayers: 256,
    betOptions: [
      { label: "Higher", value: "higher", multiplier: 2 },
      { label: "Lower", value: "lower", multiplier: 2 },
      { label: "Equal", value: "equal", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const current = rand(1, 13);
      const next = rand(1, 13);
      const result =
        next > current ? "higher" : next < current ? "lower" : "equal";
      const won = bet === result;
      const mult = bet === "equal" ? 10 : 2;
      const cardNames = [
        "",
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ];
      return {
        won,
        multiplier: won ? mult : 0,
        description: `${cardNames[current]} to ${cardNames[next]}`,
        details: won
          ? `Correct! Next was ${result}`
          : `Next card was ${result}`,
      };
    },
  },
  {
    id: "threecardpoker",
    name: "3-Card Poker",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #ca8a04 100%)",
    accentColor: "#10b981",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "3-card hand — Pair Plus or Ante Play!",
    basePlayers: 198,
    betOptions: [
      { label: "Ante Play", value: "ante", multiplier: 2 },
      { label: "Pair Plus", value: "pair", multiplier: 4 },
      { label: "Straight", value: "straight", multiplier: 6 },
      { label: "Three of Kind", value: "trips", multiplier: 30 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let won = false;
      let mult = 0;
      if (bet === "ante" && roll <= 55) {
        won = true;
        mult = 2;
      } else if (bet === "pair" && roll <= 25) {
        won = true;
        mult = 4;
      } else if (bet === "straight" && roll <= 10) {
        won = true;
        mult = 6;
      } else if (bet === "trips" && roll <= 3) {
        won = true;
        mult = 30;
      }
      const hands = [
        "High Card",
        "One Pair",
        "Flush",
        "Straight",
        "Three of a Kind",
      ];
      const hand = hands[rand(0, 4)];
      return {
        won,
        multiplier: mult,
        description: `Your hand: ${hand}`,
        details: won ? `${mult}x payout!` : "Dealer wins this round",
      };
    },
  },
  {
    id: "speedroulette",
    name: "Speed Roulette",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1a0a0a 0%, #8b0000 40%, #1a0a0a 100%)",
    accentColor: "#dc2626",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Ultra-fast roulette — results in 25 seconds!",
    basePlayers: 534,
    betOptions: [
      { label: "Red", value: "red", multiplier: 2 },
      { label: "Black", value: "black", multiplier: 2 },
      { label: "Odd", value: "odd", multiplier: 2 },
      { label: "Even", value: "even", multiplier: 2 },
      { label: "1-18", value: "low", multiplier: 2 },
      { label: "19-36", value: "high", multiplier: 2 },
    ],
    simulate(bet: string): GameRoundResult {
      const spin = rand(0, 36);
      const isGreen = spin === 0;
      const redNums = [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
      ];
      const isRed = !isGreen && redNums.includes(spin);
      const won =
        (bet === "red" && isRed) ||
        (bet === "black" && !isRed && !isGreen) ||
        (bet === "odd" && !isGreen && spin % 2 === 1) ||
        (bet === "even" && !isGreen && spin % 2 === 0) ||
        (bet === "low" && spin >= 1 && spin <= 18) ||
        (bet === "high" && spin >= 19 && spin <= 36);
      return {
        won,
        multiplier: won ? 2 : 0,
        description: `Ball: ${spin} (${isGreen ? "Green" : isRed ? "Red" : "Black"})`,
        details: won ? "2x payout! Speed win!" : "Try again — next spin in 25s",
      };
    },
  },

  {
    id: "superandarbahar",
    name: "Super Andar Bahar",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #ca8a04 100%)",
    accentColor: "#f59e0b",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "Double the excitement of Andar Bahar!",
    basePlayers: 287,
    betOptions: [
      { label: "Andar", value: "andar", multiplier: 2 },
      { label: "Bahar", value: "bahar", multiplier: 2 },
      { label: "Super Andar", value: "super_andar", multiplier: 3 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won = roll <= 48;
      const mult = bet === "super_andar" ? 3 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Match!" : "No match",
        details: won ? `${mult}x win!` : "Try again!",
      };
    },
  },
  {
    id: "32cards",
    name: "32 Cards",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #4a1d96 40%, #7c3aed 100%)",
    accentColor: "#a78bfa",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "Pick a player, win big with 32 cards!",
    basePlayers: 321,
    betOptions: [
      { label: "Player 8", value: "p8", multiplier: 2 },
      { label: "Player 9", value: "p9", multiplier: 2 },
      { label: "Player 10", value: "p10", multiplier: 2 },
      { label: "Player J", value: "pj", multiplier: 2 },
    ],
    simulate(bet: string): GameRoundResult {
      const players = ["p8", "p9", "p10", "pj"];
      const winner = players[rand(0, 3)];
      const won = bet === winner;
      return {
        won,
        multiplier: won ? 2 : 0,
        description: `Winner: ${winner.toUpperCase()}`,
        details: won ? "2x payout!" : "Better luck!",
      };
    },
  },
  {
    id: "muflisTeenPatti",
    name: "Muflis Teen Patti",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #0c1a0c 0%, #14532d 40%, #f59e0b 100%)",
    accentColor: "#4ade80",
    image: "/assets/generated/game-blackjack.dim_400x300.jpg",
    description: "Lowest hand wins in Muflis rules!",
    basePlayers: 445,
    betOptions: [
      { label: "Play", value: "play", multiplier: 2 },
      { label: "Side Bet", value: "side", multiplier: 5 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won = roll <= 45;
      const mult = bet === "side" ? 5 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Low hand wins!" : "High hand wins",
        details: won ? `${mult}x!` : "Dealer wins",
      };
    },
  },
  {
    id: "ak47teenpatti",
    name: "AK47 Teen Patti",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #1c0a0a 0%, #7f1d1d 40%, #fbbf24 100%)",
    accentColor: "#fbbf24",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "A, K, 4, 7 are wildcards! Huge wins await!",
    basePlayers: 512,
    betOptions: [
      { label: "Boot", value: "boot", multiplier: 2 },
      { label: "Wild Hand", value: "wild", multiplier: 6 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won = bet === "wild" ? roll <= 20 : roll <= 50;
      const mult = bet === "wild" ? 6 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Wild win!" : "No wilds",
        details: won ? `${mult}x!` : "Try again!",
      };
    },
  },
  {
    id: "baccaratsqueeze",
    name: "Baccarat Squeeze",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1e3a8a 40%, #1e40af 100%)",
    accentColor: "#60a5fa",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "Feel the suspense as cards are squeezed!",
    basePlayers: 398,
    betOptions: [
      { label: "Player", value: "player", multiplier: 2 },
      { label: "Banker", value: "banker", multiplier: 1.95 },
      { label: "Tie", value: "tie", multiplier: 8 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let won = false;
      let mult = 0;
      if (bet === "player" && roll <= 44) {
        won = true;
        mult = 2;
      } else if (bet === "banker" && roll > 44 && roll <= 90) {
        won = true;
        mult = 1.95;
      } else if (bet === "tie" && roll > 90) {
        won = true;
        mult = 8;
      }
      return {
        won,
        multiplier: mult,
        description:
          roll <= 44 ? "Player wins!" : roll <= 90 ? "Banker wins!" : "Tie!",
        details: won ? `${mult}x!` : "Better luck!",
      };
    },
  },
  {
    id: "goldenwealth",
    name: "Golden Wealth Baccarat",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1a1200 0%, #78350f 40%, #fbbf24 100%)",
    accentColor: "#fbbf24",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "Extra multipliers on winning hands!",
    basePlayers: 276,
    betOptions: [
      { label: "Player", value: "player", multiplier: 2 },
      { label: "Banker", value: "banker", multiplier: 2 },
      { label: "Golden Tie", value: "golden", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let won = false;
      let mult = 0;
      if (bet === "player" && roll <= 44) {
        won = true;
        mult = 2;
      } else if (bet === "banker" && roll > 44 && roll <= 90) {
        won = true;
        mult = 2;
      } else if (bet === "golden" && roll > 90) {
        won = true;
        mult = 20;
      }
      return {
        won,
        multiplier: mult,
        description: "Golden Wealth result",
        details: won ? `${mult}x Golden win!` : "No luck this round",
      };
    },
  },
  {
    id: "fantan",
    name: "Fan Tan",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0a1a0a 0%, #166534 40%, #fbbf24 100%)",
    accentColor: "#4ade80",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Ancient Chinese game — pick 1, 2, 3 or 4!",
    basePlayers: 189,
    betOptions: [
      { label: "1", value: "1", multiplier: 3.8 },
      { label: "2", value: "2", multiplier: 3.8 },
      { label: "3", value: "3", multiplier: 3.8 },
      { label: "4", value: "4", multiplier: 3.8 },
    ],
    simulate(bet: string): GameRoundResult {
      const result = String(rand(1, 4));
      const won = bet === result;
      return {
        won,
        multiplier: won ? 3.8 : 0,
        description: `Result: ${result}`,
        details: won ? "3.8x win!" : "Try another number!",
      };
    },
  },
  {
    id: "craps",
    name: "Craps",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0d0d1a 0%, #1e1b4b 40%, #6366f1 100%)",
    accentColor: "#818cf8",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Roll the dice — Pass Line or Don't Pass!",
    basePlayers: 234,
    betOptions: [
      { label: "Pass Line", value: "pass", multiplier: 2 },
      { label: "Don't Pass", value: "dont", multiplier: 2 },
      { label: "Any 7", value: "any7", multiplier: 5 },
    ],
    simulate(bet: string): GameRoundResult {
      const d1 = rand(1, 6);
      const d2 = rand(1, 6);
      const total = d1 + d2;
      let won = false;
      let mult = 0;
      if (bet === "pass" && (total === 7 || total === 11)) {
        won = true;
        mult = 2;
      } else if (bet === "dont" && (total === 2 || total === 3)) {
        won = true;
        mult = 2;
      } else if (bet === "any7" && total === 7) {
        won = true;
        mult = 5;
      }
      return {
        won,
        multiplier: mult,
        description: `Dice: ${d1}+${d2}=${total}`,
        details: won ? `${mult}x payout!` : "No win this roll",
      };
    },
  },
  {
    id: "caribbeanstud",
    name: "Caribbean Stud Poker",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #001a0a 0%, #064e3b 40%, #10b981 100%)",
    accentColor: "#34d399",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "Beat the dealer with your best poker hand!",
    basePlayers: 167,
    betOptions: [
      { label: "Ante", value: "ante", multiplier: 2 },
      { label: "Call", value: "call", multiplier: 3 },
      { label: "Progressive", value: "prog", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won = bet === "prog" ? roll <= 10 : roll <= 50;
      const mult = bet === "prog" ? 10 : bet === "call" ? 3 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Beat dealer!" : "Dealer wins",
        details: won ? `${mult}x!` : "Try again!",
      };
    },
  },
  {
    id: "paigow",
    name: "Pai Gow Poker",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #1a0a1a 0%, #6b21a8 40%, #a855f7 100%)",
    accentColor: "#c084fc",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "Split 7 cards into two winning hands!",
    basePlayers: 143,
    betOptions: [
      { label: "Main Bet", value: "main", multiplier: 2 },
      { label: "Fortune", value: "fortune", multiplier: 5 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won = bet === "fortune" ? roll <= 20 : roll <= 45;
      const mult = bet === "fortune" ? 5 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: won ? "Both hands win!" : "Push or lose",
        details: won ? `${mult}x!` : "No win",
      };
    },
  },
  {
    id: "reddog",
    name: "Red Dog",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #1a0000 0%, #991b1b 40%, #ef4444 100%)",
    accentColor: "#f87171",
    image: "/assets/generated/game-blackjack.dim_400x300.jpg",
    description: "Will the 3rd card be between the first two?",
    basePlayers: 198,
    betOptions: [
      { label: "Bet", value: "bet", multiplier: 2 },
      { label: "Raise", value: "raise", multiplier: 3 },
    ],
    simulate(bet: string): GameRoundResult {
      const c1 = rand(1, 13);
      const c2 = rand(1, 13);
      const spread = Math.abs(c1 - c2) - 1;
      const c3 = rand(1, 13);
      const won = spread > 0 && c3 > Math.min(c1, c2) && c3 < Math.max(c1, c2);
      const mult = bet === "raise" ? 3 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Cards: ${c1}, ${c2}, ${c3}`,
        details: won ? "In between! Win!" : "Outside range",
      };
    },
  },
  {
    id: "casinowar",
    name: "Casino War",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #374151 40%, #6b7280 100%)",
    accentColor: "#9ca3af",
    image: "/assets/generated/game-poker.dim_400x300.jpg",
    description: "Go to War — highest card wins!",
    basePlayers: 221,
    betOptions: [
      { label: "Win", value: "win", multiplier: 2 },
      { label: "Go to War", value: "war", multiplier: 2 },
      { label: "Surrender", value: "surrender", multiplier: 0.5 },
    ],
    simulate(_bet: string): GameRoundResult {
      const player = rand(1, 13);
      const dealer = rand(1, 13);
      const won = player > dealer;
      return {
        won,
        multiplier: won ? 2 : 0,
        description: `You: ${player}, Dealer: ${dealer}`,
        details: won ? "You win!" : "Dealer wins",
      };
    },
  },
  {
    id: "super6",
    name: "Super 6",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #0a1a1a 0%, #164e63 40%, #06b6d4 100%)",
    accentColor: "#22d3ee",
    image: "/assets/generated/game-baccarat.dim_400x300.jpg",
    description: "Banker wins with 6 — Super 6 jackpot!",
    basePlayers: 312,
    betOptions: [
      { label: "Player", value: "player", multiplier: 2 },
      { label: "Banker", value: "banker", multiplier: 1.95 },
      { label: "Super 6", value: "super6", multiplier: 12 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      let won = false;
      let mult = 0;
      if (bet === "player" && roll <= 44) {
        won = true;
        mult = 2;
      } else if (bet === "banker" && roll > 44 && roll <= 88) {
        won = true;
        mult = 1.95;
      } else if (bet === "super6" && roll > 88 && roll <= 98) {
        won = true;
        mult = 12;
      }
      return {
        won,
        multiplier: mult,
        description: "Super 6 result",
        details: won ? `${mult}x!` : "No win",
      };
    },
  },
  {
    id: "thaiHiLo",
    name: "Thai Hi-Lo",
    provider: "SEXYBCRT",
    gradient: "linear-gradient(135deg, #0f0a1a 0%, #4c1d95 40%, #7c3aed 100%)",
    accentColor: "#a78bfa",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "3 dice Thai style — High, Low or Specific!",
    basePlayers: 445,
    betOptions: [
      { label: "High (11-17)", value: "high", multiplier: 2 },
      { label: "Low (4-10)", value: "low", multiplier: 2 },
      { label: "Triple", value: "triple", multiplier: 30 },
    ],
    simulate(bet: string): GameRoundResult {
      const total = rand(1, 6) + rand(1, 6) + rand(1, 6);
      const isHigh = total >= 11;
      const won =
        (bet === "high" && isHigh) ||
        (bet === "low" && !isHigh) ||
        (bet === "triple" && [3, 6, 9, 12, 15, 18].includes(total));
      const mult = bet === "triple" ? 30 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: `Dice total: ${total}`,
        details: won ? `${mult}x!` : "Try again!",
      };
    },
  },
  {
    id: "pachinko",
    name: "Pachinko",
    provider: "EVOLUTION",
    gradient: "linear-gradient(135deg, #1a0a1a 0%, #831843 40%, #ec4899 100%)",
    accentColor: "#f472b6",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Ball drop with multipliers!",
    basePlayers: 567,
    betOptions: [
      { label: "x1 Zone", value: "x1", multiplier: 1.5 },
      { label: "x10 Zone", value: "x10", multiplier: 10 },
      { label: "x100 Zone", value: "x100", multiplier: 100 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won =
        bet === "x100" ? roll <= 3 : bet === "x10" ? roll <= 15 : roll <= 60;
      const mult = bet === "x100" ? 100 : bet === "x10" ? 10 : 1.5;
      return {
        won,
        multiplier: won ? mult : 0,
        description: "Ball dropped!",
        details: won ? `${mult}x zone!` : "Miss!",
      };
    },
  },
  {
    id: "aviator",
    name: "Aviator",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1e3a5f 40%, #3b82f6 100%)",
    accentColor: "#60a5fa",
    image: "/assets/generated/game-crash.dim_400x300.jpg",
    description: "Cash out before the plane flies away!",
    basePlayers: 1245,
    betOptions: [
      { label: "1.5x", value: "1.5", multiplier: 1.5 },
      { label: "2x", value: "2", multiplier: 2 },
      { label: "5x", value: "5", multiplier: 5 },
      { label: "10x", value: "10", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const crashAt = (Math.random() * 9 + 1).toFixed(2);
      const target = Number.parseFloat(bet);
      const won = Number.parseFloat(crashAt) >= target;
      return {
        won,
        multiplier: won ? target : 0,
        description: `Plane crashed at ${crashAt}x`,
        details: won ? `Cashed out at ${target}x!` : "Flew away!",
      };
    },
  },
  {
    id: "jetx",
    name: "JetX",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #0a1a0a 0%, #052e16 40%, #22c55e 100%)",
    accentColor: "#4ade80",
    image: "/assets/generated/game-crash.dim_400x300.jpg",
    description: "Jet multiplier — cash out at the right time!",
    basePlayers: 876,
    betOptions: [
      { label: "2x", value: "2", multiplier: 2 },
      { label: "3x", value: "3", multiplier: 3 },
      { label: "5x", value: "5", multiplier: 5 },
      { label: "Moon", value: "10", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const crashAt = (Math.random() * 12 + 1).toFixed(2);
      const target = Number.parseFloat(bet);
      const won = Number.parseFloat(crashAt) >= target;
      return {
        won,
        multiplier: won ? target : 0,
        description: `JetX: ${crashAt}x`,
        details: won ? `${target}x win!` : "Crashed early!",
      };
    },
  },
  {
    id: "spaceman",
    name: "Spaceman",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #000010 0%, #0f0c29 40%, #302b63 100%)",
    accentColor: "#a78bfa",
    image: "/assets/generated/game-crash.dim_400x300.jpg",
    description: "Space adventure multiplier game!",
    basePlayers: 934,
    betOptions: [
      { label: "1.5x", value: "1.5", multiplier: 1.5 },
      { label: "3x", value: "3", multiplier: 3 },
      { label: "7x", value: "7", multiplier: 7 },
      { label: "20x", value: "20", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const crashAt = (Math.random() * 15 + 1).toFixed(2);
      const target = Number.parseFloat(bet);
      const won = Number.parseFloat(crashAt) >= target;
      return {
        won,
        multiplier: won ? target : 0,
        description: `Spaceman: ${crashAt}x`,
        details: won ? `${target}x orbit!` : "Lost in space!",
      };
    },
  },
  {
    id: "sweetbonanza",
    name: "Sweet Bonanza",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #1a001a 0%, #86198f 40%, #e879f9 100%)",
    accentColor: "#f0abfc",
    image: "/assets/generated/game-slots.dim_400x300.jpg",
    description: "Candy slot with multiplier tumbles!",
    basePlayers: 1123,
    betOptions: [
      { label: "Normal", value: "normal", multiplier: 3 },
      { label: "Free Spins", value: "free", multiplier: 5 },
      { label: "Big Bet", value: "big", multiplier: 10 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won =
        bet === "big" ? roll <= 25 : bet === "free" ? roll <= 35 : roll <= 45;
      const mult = bet === "big" ? 10 : bet === "free" ? 5 : 3;
      return {
        won,
        multiplier: won ? mult : 0,
        description: "🍬 Candy tumble!",
        details: won ? `${mult}x candy win!` : "No match",
      };
    },
  },
  {
    id: "gatesofolympus",
    name: "Gates of Olympus",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #312e81 40%, #6366f1 100%)",
    accentColor: "#fbbf24",
    image: "/assets/generated/game-slots.dim_400x300.jpg",
    description: "Zeus drops multipliers from the heavens!",
    basePlayers: 1456,
    betOptions: [
      { label: "Spin", value: "spin", multiplier: 3 },
      { label: "Bonus Buy", value: "bonus", multiplier: 8 },
      { label: "Zeus Bet", value: "zeus", multiplier: 15 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won =
        bet === "zeus" ? roll <= 20 : bet === "bonus" ? roll <= 30 : roll <= 40;
      const mult = bet === "zeus" ? 15 : bet === "bonus" ? 8 : 3;
      return {
        won,
        multiplier: won ? mult : 0,
        description: "⚡ Zeus blessing!",
        details: won ? `${mult}x divine win!` : "Zeus is sleeping",
      };
    },
  },
  {
    id: "bigbasssplash",
    name: "Big Bass Splash",
    provider: "PRAGMATIC",
    gradient: "linear-gradient(135deg, #001a2e 0%, #0369a1 40%, #38bdf8 100%)",
    accentColor: "#7dd3fc",
    image: "/assets/generated/game-fish.dim_400x300.jpg",
    description: "Fishing-themed slot with big multipliers!",
    basePlayers: 678,
    betOptions: [
      { label: "Cast", value: "cast", multiplier: 3 },
      { label: "Trophy Fish", value: "trophy", multiplier: 8 },
      { label: "Golden Fish", value: "golden", multiplier: 20 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won =
        bet === "golden"
          ? roll <= 15
          : bet === "trophy"
            ? roll <= 30
            : roll <= 45;
      const mult = bet === "golden" ? 20 : bet === "trophy" ? 8 : 3;
      return {
        won,
        multiplier: won ? mult : 0,
        description: "🎣 Fishing result!",
        details: won ? `${mult}x big catch!` : "Fish got away",
      };
    },
  },
  {
    id: "ballblast",
    name: "Ball Blast",
    provider: "NETENT",
    gradient: "linear-gradient(135deg, #0a1a1a 0%, #134e4a 40%, #14b8a6 100%)",
    accentColor: "#2dd4bf",
    image: "/assets/generated/game-roulette.dim_400x300.jpg",
    description: "Shoot balls and hit multiplier targets!",
    basePlayers: 543,
    betOptions: [
      { label: "Small Blast", value: "small", multiplier: 2 },
      { label: "Big Blast", value: "big", multiplier: 5 },
      { label: "Mega Blast", value: "mega", multiplier: 15 },
    ],
    simulate(bet: string): GameRoundResult {
      const roll = rand(1, 100);
      const won =
        bet === "mega" ? roll <= 15 : bet === "big" ? roll <= 30 : roll <= 55;
      const mult = bet === "mega" ? 15 : bet === "big" ? 5 : 2;
      return {
        won,
        multiplier: won ? mult : 0,
        description: "💥 Ball blasted!",
        details: won ? `${mult}x blast!` : "Missed!",
      };
    },
  },
];
