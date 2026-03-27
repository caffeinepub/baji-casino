import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
import type { Page } from "./components/BottomNav";
import { Header } from "./components/Header";
import { RechargeGate } from "./components/RechargeGate";
import { useLocalAuth } from "./hooks/useLocalAuth";
import { useIsAdmin } from "./hooks/useQueries";
import { AccountPage } from "./pages/AccountPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { DepositPage } from "./pages/DepositPage";
import { GamePage } from "./pages/GamePage";
import { LobbyPage } from "./pages/LobbyPage";
import { PromotionsPage } from "./pages/PromotionsPage";
import { GAMES } from "./utils/gameLogic";
import { updateBalance } from "./utils/localAuth";

type MainPage = Page;

const GUEST_BALANCE_KEY = "banabo_guest_balance";

export default function App() {
  const [mainPage, setMainPage] = useState<MainPage>("lobby");
  const [playingGame, setPlayingGame] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const { user, isLoggedIn, isInitializing, refreshUser } = useLocalAuth();
  const { data: isAdmin } = useIsAdmin();

  const [rechargeGateGame, setRechargeGateGame] = useState<string | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  const isAuthenticated = isLoggedIn || isGuest;

  const localBalance = user?.balance ?? 0;
  const guestBalance = (() => {
    const s = localStorage.getItem(GUEST_BALANCE_KEY);
    return s !== null ? Number(s) : 0;
  })();
  const displayBalance = isGuest ? guestBalance : localBalance;

  const handlePlayGame = (gameId: string) => {
    setRechargeGateGame(gameId);
  };

  const handlePlayNow = () => {
    const gameId = rechargeGateGame;
    setRechargeGateGame(null);
    if (gameId) setPlayingGame(gameId);
  };

  const handleRechargeFromGate = () => {
    setRechargeGateGame(null);
    setMainPage("deposit");
  };

  const handleGoToLobby = () => {
    refreshUser();
    setMainPage("lobby");
  };

  const handleBalanceUpdate = (newBalance: number) => {
    if (user) {
      updateBalance(user.phone, newBalance);
      refreshUser();
    } else if (isGuest) {
      localStorage.setItem(GUEST_BALANCE_KEY, String(newBalance));
    }
  };

  const handleLogout = () => {
    setIsGuest(false);
    setMainPage("lobby");
    refreshUser();
  };

  if (isInitializing) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "oklch(0.14 0.04 245)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.60 0.14 82))",
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{ color: "oklch(0.78 0.14 82)" }}
            className="font-bold tracking-widest"
          >
            BAJI WIN
          </p>
        </div>
      </div>
    );
  }

  // Admin authenticated via separate login
  if (adminAuthenticated) {
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <AdminPage forceAdmin onBack={() => setAdminAuthenticated(false)} />
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (!isAuthenticated) {
    if (showAdminLogin) {
      return (
        <>
          <div className="flex-1 overflow-y-auto">
            <AdminLoginPage
              onSuccess={() => {
                setAdminAuthenticated(true);
                setShowAdminLogin(false);
              }}
              onBack={() => setShowAdminLogin(false)}
            />
          </div>
          <Toaster position="top-center" />
        </>
      );
    }

    return (
      <>
        <div className="flex-1 overflow-y-auto">
          <AuthPage
            onGuestPlay={() => setIsGuest(true)}
            onLoggedIn={refreshUser}
            onAdminLogin={() => setShowAdminLogin(true)}
          />
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  if (playingGame) {
    return (
      <>
        <div className="flex flex-col flex-1 min-h-0">
          <GamePage
            gameId={playingGame}
            onBack={() => setPlayingGame(null)}
            isGuest={isGuest}
            localBalance={displayBalance}
            onBalanceUpdate={handleBalanceUpdate}
          />
        </div>
        <Toaster position="top-center" />
      </>
    );
  }

  const gateGame = rechargeGateGame
    ? GAMES.find((g) => g.id === rechargeGateGame)
    : null;

  return (
    <>
      <Header balance={BigInt(displayBalance)} />
      <main className="flex flex-col flex-1 min-h-0">
        {mainPage === "lobby" && <LobbyPage onPlayGame={handlePlayGame} />}
        {mainPage === "promotions" && (
          <PromotionsPage onBack={() => setMainPage("lobby")} />
        )}
        {mainPage === "deposit" && (
          <DepositPage
            onGoToLobby={handleGoToLobby}
            onBack={() => setMainPage("lobby")}
          />
        )}
        {mainPage === "account" && (
          <AccountPage
            onNavigate={setMainPage}
            onBack={() => setMainPage("lobby")}
            onLogout={handleLogout}
          />
        )}
        {mainPage === "admin" && (
          <AdminPage onBack={() => setMainPage("lobby")} />
        )}
      </main>
      <BottomNav
        currentPage={mainPage}
        onNavigate={setMainPage}
        isAdmin={!!isAdmin}
      />
      <RechargeGate
        open={!!rechargeGateGame}
        balance={displayBalance}
        isGuest={isGuest}
        onPlayNow={handlePlayNow}
        onRecharge={handleRechargeFromGate}
        onClose={() => setRechargeGateGame(null)}
        gameName={gateGame?.name}
      />
      <Toaster position="top-center" />
    </>
  );
}
