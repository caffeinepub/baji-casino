import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameResult } from "../backend.d";
import type { RechargeRequest } from "../declarations/backend.did.d";
import { useActor } from "./useActor";

export function useBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavorites();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecentHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<GameResult[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: string) => {
      if (!actor) return;
      return actor.toggleFavoriteGame(game);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useAddChips() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addChips(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useClaimDailyBonus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimDailyBonus();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useRecordGameRound() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      game,
      bet,
      amount,
    }: { game: string; bet: bigint; amount: bigint }) => {
      if (!actor) return;
      return actor.recordGameRound(game, bet, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useSubmitRecharge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      txId,
      amount,
      method,
    }: { txId: string; amount: number; method: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).submitRechargeRequest(
        txId,
        BigInt(amount),
        method,
      ) as Promise<bigint>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function usePendingRechargeRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<RechargeRequest[]>({
    queryKey: ["recharge_requests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getPendingRechargeRequests() as Promise<
        RechargeRequest[]
      >;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useApproveRecharge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).approveRechargeRequest(id) as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recharge_requests"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useRejectRecharge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).rejectRechargeRequest(id) as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recharge_requests"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["is_admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
