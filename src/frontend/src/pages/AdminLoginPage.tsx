import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function AdminLoginPage({ onSuccess, onBack }: AdminLoginPageProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (phone === "01318079765" && password === "admin123") {
        onSuccess();
      } else {
        toast.error("ভুল phone number বা password");
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "oklch(0.14 0.04 245)" }}
    >
      {/* Back button */}
      <div className="px-4 pt-6">
        <button
          type="button"
          data-ocid="admin_login.back.button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.22 0.04 245)" }}
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-8 px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 flex items-center justify-center mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.60 0.14 82))",
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
        <h1
          className="text-3xl font-bold tracking-widest mb-1"
          style={{ color: "oklch(0.78 0.14 82)" }}
        >
          BAJI WIN
        </h1>
        <p className="text-muted-foreground text-sm">Admin Login</p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 space-y-4"
      >
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: "oklch(0.18 0.04 245)",
            border: "1px solid oklch(0.28 0.03 245)",
          }}
        >
          <p
            className="text-center font-bold text-lg mb-2"
            style={{ color: "oklch(0.78 0.14 82)" }}
          >
            Admin Panel Access
          </p>
          <Input
            data-ocid="admin_login.phone.input"
            placeholder="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            autoComplete="tel"
          />
          <Input
            data-ocid="admin_login.password.input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12"
            autoComplete="current-password"
          />
        </div>

        <Button
          data-ocid="admin_login.submit.button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-12 text-base font-bold tracking-wide rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.14 82), oklch(0.65 0.14 82))",
            color: "oklch(0.14 0.03 245)",
          }}
        >
          {isLoading ? "Checking..." : "Login to Admin Panel"}
        </Button>
      </motion.div>
    </div>
  );
}
