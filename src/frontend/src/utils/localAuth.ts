export interface RechargeRecord {
  id: string;
  amount: number;
  method: string;
  txId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
}

export interface LocalUser {
  phone: string;
  passwordHash: string;
  displayName: string;
  balance: number;
  rechargeHistory: RechargeRecord[];
  createdAt: number;
}

const USER_PREFIX = "banabo_user_";
const CURRENT_PHONE_KEY = "banabo_current_phone";

function hashPassword(password: string): string {
  return btoa(`${password}_banabo_salt`);
}

function getUserKey(phone: string): string {
  return `${USER_PREFIX}${phone}`;
}

export function getUser(phone: string): LocalUser | null {
  const data = localStorage.getItem(getUserKey(phone));
  if (!data) return null;
  try {
    return JSON.parse(data) as LocalUser;
  } catch {
    return null;
  }
}

function saveUser(user: LocalUser): void {
  localStorage.setItem(getUserKey(user.phone), JSON.stringify(user));
}

export function registerUser(
  phone: string,
  password: string,
  displayName?: string,
): { success: boolean; error?: string } {
  if (getUser(phone)) {
    return { success: false, error: "এই phone number ইতিমধ্যে registered" };
  }
  const user: LocalUser = {
    phone,
    passwordHash: hashPassword(password),
    displayName: displayName || `Player${phone.slice(-4)}`,
    balance: 0,
    rechargeHistory: [],
    createdAt: Date.now(),
  };
  saveUser(user);
  return { success: true };
}

export function loginUser(
  phone: string,
  password: string,
): { success: boolean; user?: LocalUser; error?: string } {
  const user = getUser(phone);
  if (!user) {
    return { success: false, error: "Phone number found হয়নি" };
  }
  if (user.passwordHash !== hashPassword(password)) {
    return { success: false, error: "Password ভুল" };
  }
  return { success: true, user };
}

export function getCurrentUser(): LocalUser | null {
  // Use localStorage so session persists across browser restarts
  const phone = localStorage.getItem(CURRENT_PHONE_KEY);
  if (!phone) return null;
  return getUser(phone);
}

export function setCurrentUser(phone: string): void {
  localStorage.setItem(CURRENT_PHONE_KEY, phone);
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_PHONE_KEY);
  // Also clear sessionStorage for backwards compatibility
  sessionStorage.removeItem(CURRENT_PHONE_KEY);
}

export function getBalance(phone: string): number {
  const user = getUser(phone);
  return user?.balance ?? 0;
}

export function updateBalance(phone: string, newBalance: number): void {
  const user = getUser(phone);
  if (!user) return;
  user.balance = newBalance;
  saveUser(user);
}

export function addRechargeRecord(phone: string, record: RechargeRecord): void {
  const user = getUser(phone);
  if (!user) return;
  user.rechargeHistory = [record, ...user.rechargeHistory];
  saveUser(user);
}

export function updateDisplayName(phone: string, name: string): void {
  const user = getUser(phone);
  if (!user) return;
  user.displayName = name;
  saveUser(user);
}

export function getAllUsers(): LocalUser[] {
  const users: LocalUser[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(USER_PREFIX)) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const user = JSON.parse(data) as LocalUser;
          users.push(user);
        } catch {
          // skip invalid
        }
      }
    }
  }
  return users.sort((a, b) => b.createdAt - a.createdAt);
}
