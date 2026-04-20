import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { WalletResponse } from "../types/api";
import { useAppStore } from "../store/useAppStore";

export const useWallets = () => {
  const token = useAppStore((state) => state.token);
  const { activeWalletId, setActiveWalletId, isHydrated } = useAppStore();

  const query = useQuery({
    queryKey: ["wallets"],
    queryFn: () => fetcher<WalletResponse[]>("/wallets"),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!token, // Only fetch when token exists
  });

  // Auto-selection logic with hydration safety
  useEffect(() => {
    if (isHydrated && query.data?.length && !activeWalletId) {
      console.log(`[useWallets] Auto-selecting first wallet: ${query.data[0].id}`);
      setActiveWalletId(query.data[0].id);
    }
  }, [isHydrated, query.data, activeWalletId, setActiveWalletId]);

  return query;
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WalletResponse>) => 
      fetcher<WalletResponse>("/wallets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WalletResponse> }) => 
      fetcher<WalletResponse>(`/wallets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
};
