import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameResult } from "../backend.d";
import type {
  HelpConversation,
  HelpMessage,
  RechargeRequest,
  UserProfileWithBalance,
} from "../declarations/backend.did.d";
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
      queryClient.invalidateQueries({ queryKey: ["allUserProfiles"] });
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

export function useSendHelpMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).sendHelpMessage(text) as Promise<bigint>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpMessages"] });
    },
  });
}

export function useGetUserHelpMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<HelpMessage[]>({
    queryKey: ["helpMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getUserHelpMessages() as Promise<HelpMessage[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useGetAllHelpConversations(isAdmin: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<HelpConversation[]>({
    queryKey: ["helpConversations"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllHelpConversations() as Promise<
        HelpConversation[]
      >;
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 5000,
  });
}

export function useReplyHelpMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      text,
    }: { userId: Principal; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).replyHelpMessage(
        userId,
        text,
      ) as Promise<undefined>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helpConversations"] });
    },
  });
}

export function useRegisterUserProfile() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      displayName,
    }: { phone: string; displayName: string }) => {
      if (!actor) return;
      return (actor as any).registerUserProfile(
        phone,
        displayName,
      ) as Promise<undefined>;
    },
  });
}

export function useGetAllUserProfiles(isAdmin: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileWithBalance[]>({
    queryKey: ["allUserProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUserProfiles() as Promise<
        UserProfileWithBalance[]
      >;
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 5000,
  });
}

export function useAdminSetUserBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      newBalance,
    }: { principal: Principal; newBalance: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).adminSetUserBalance(
        principal,
        newBalance,
      ) as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUserProfiles"] });
    },
  });
}
