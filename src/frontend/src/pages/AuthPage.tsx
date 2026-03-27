import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useRegisterUserProfile } from "../hooks/useQueries";

interface AuthPageProps {
  onGuestPlay: () => void;
  onLoggedIn?: () => void;
  onAdminLogin?: () => void;
}

export function AuthPage({
  onGuestPlay,
  onLoggedIn,
  onAdminLogin,
}: AuthPageProps) {
  const { login, register } = useLocalAuth();
  const registerProfile = useRegisterUserProfile();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = "Phone number দিন";
    else if (!/^01[3-9]\d{8}$/.test(phone.replace(/\s/g, "")))
      errs.phone = "Valid phone number দিন (01XXXXXXXXX)";
    if (!password) errs.password = "Password দিন";
    else if (password.length < 4) errs.password = "কমপক্ষে 4 character দিন";
    if (tab === "register" && password !== confirmPassword)
      errs.confirmPassword = "Password match করেনি";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      if (tab === "login") {
        const result = login(phone.trim(), password);
        if (!result.success) {
          toast.error(result.error || "Login failed");
        } else {
          toast.success("Welcome back!");
          onLoggedIn?.();
        }
      } else {
        const resolvedName =
          displayName.trim() || `Player${phone.trim().slice(-4)}`;
        const result = register(phone.trim(), password, resolvedName);
        if (!result.success) {
          toast.error(result.error || "Registration failed");
        } else {
          // Save profile to backend so admin can see all users
          registerProfile.mutate({
            phone: phone.trim(),
            displayName: resolvedName,
          });
          toast.success("Account তৈরি হয়েছে! Recharge করুন game খেলতে");
          onLoggedIn?.();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "oklch(0.14 0.04 245)" }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center pt-12 pb-8 px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 flex items-center justify-center mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.60 0.14 82))",
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-widest mb-1"
          style={{ color: "oklch(0.78 0.14 82)" }}
        >
          BAJI WIN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-sm"
        >
          Your Premier Live Casino
        </motion.p>
      </div>

      {/* Welcome bonus */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-6 mb-6 rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.04 245), oklch(0.18 0.04 245))",
          border: "1px solid oklch(0.78 0.14 82 / 0.3)",
        }}
      >
        <p className="font-bold text-foreground">100% Recharge Bonus</p>
        <p className="text-sm text-muted-foreground">
          1,000 টাকা পাঠালে 2,000 TK পাবেন!
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-6"
      >
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: "oklch(0.20 0.04 245)" }}
        >
          <button
            type="button"
            data-ocid="auth.login.tab"
            onClick={() => {
              setTab("login");
              setErrors({});
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={
              tab === "login"
                ? {
                    background: "oklch(0.78 0.14 82)",
                    color: "oklch(0.14 0.03 245)",
                  }
                : { color: "oklch(0.60 0.02 240)" }
            }
          >
            Login
          </button>
          <button
            type="button"
            data-ocid="auth.register.tab"
            onClick={() => {
              setTab("register");
              setErrors({});
            }}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={
              tab === "register"
                ? {
                    background: "oklch(0.78 0.14 82)",
                    color: "oklch(0.14 0.03 245)",
                  }
                : { color: "oklch(0.60 0.02 240)" }
            }
          >
            Register
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <Input
              data-ocid="auth.phone.input"
              type="tel"
              placeholder="Phone Number (01XXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            />
            {errors.phone && (
              <p
                data-ocid="auth.phone.error_state"
                className="text-xs text-destructive mt-1 px-1"
              >
                {errors.phone}
              </p>
            )}
          </div>
          {tab === "register" && (
            <Input
              data-ocid="auth.displayname.input"
              placeholder="Display Name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            />
          )}
          <div>
            <Input
              data-ocid="auth.password.input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            />
            {errors.password && (
              <p
                data-ocid="auth.password.error_state"
                className="text-xs text-destructive mt-1 px-1"
              >
                {errors.password}
              </p>
            )}
          </div>
          {tab === "register" && (
            <div>
              <Input
                data-ocid="auth.confirm_password.input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              {errors.confirmPassword && (
                <p
                  data-ocid="auth.confirm_password.error_state"
                  className="text-xs text-destructive mt-1 px-1"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
        </div>

        <Button
          data-ocid="auth.submit.button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-12 text-base font-bold tracking-wide rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
            color: "oklch(0.14 0.03 245)",
          }}
        >
          {isLoading ? (
            "Loading..."
          ) : tab === "login" ? (
            <>
              <LogIn size={18} className="mr-2" /> Login
            </>
          ) : (
            <>
              <UserPlus size={18} className="mr-2" /> Create Account
            </>
          )}
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          data-ocid="auth.guest.button"
          onClick={onGuestPlay}
          variant="outline"
          className="w-full h-12 text-sm font-semibold rounded-xl border-border text-muted-foreground hover:text-foreground"
        >
          Continue as Guest
        </Button>

        {onAdminLogin && (
          <div className="text-center mt-4">
            <button
              type="button"
              data-ocid="auth.admin_login.button"
              onClick={onAdminLogin}
              className="text-xs transition-colors hover:underline"
              style={{ color: "oklch(0.45 0.03 245)" }}
            >
              Admin
            </button>
          </div>
        )}
      </motion.div>

      <div className="mt-auto py-6 text-center">
        <p className="text-xs text-muted-foreground">
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
