import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameResult {
    bet: bigint;
    game: string;
    amount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChips(amount: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimDailyBonus(): Promise<boolean>;
    getBalance(): Promise<bigint>;
    getCallerUserRole(): Promise<UserRole>;
    getFavorites(): Promise<Array<string>>;
    getRecentHistory(): Promise<Array<GameResult>>;
    isCallerAdmin(): Promise<boolean>;
    isFavorite(game: string): Promise<boolean>;
    recordGameRound(game: string, bet: bigint, amount: bigint): Promise<void>;
    toggleFavoriteGame(game: string): Promise<void>;
}
