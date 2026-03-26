import { useCallback, useEffect, useState } from "react";
import {
  type LocalUser,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  setCurrentUser,
  updateDisplayName as updateDisplayNameUtil,
} from "../utils/localAuth";

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setIsInitializing(false);
  }, []);

  const login = useCallback(
    (phone: string, password: string): { success: boolean; error?: string } => {
      const result = loginUser(phone, password);
      if (result.success && result.user) {
        setCurrentUser(phone);
        setUser(result.user);
      }
      return { success: result.success, error: result.error };
    },
    [],
  );

  const register = useCallback(
    (
      phone: string,
      password: string,
      name?: string,
    ): { success: boolean; error?: string } => {
      const result = registerUser(phone, password, name);
      if (result.success) {
        const loginResult = loginUser(phone, password);
        if (loginResult.success && loginResult.user) {
          setCurrentUser(phone);
          setUser(loginResult.user);
        }
      }
      return { success: result.success, error: result.error };
    },
    [],
  );

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    const current = getCurrentUser();
    setUser(current);
  }, []);

  const updateName = useCallback(
    (name: string) => {
      if (!user) return;
      updateDisplayNameUtil(user.phone, name);
      refreshUser();
    },
    [user, refreshUser],
  );

  return {
    user,
    isLoggedIn: !!user,
    isInitializing,
    login,
    register,
    logout,
    refreshUser,
    updateName,
  };
}
