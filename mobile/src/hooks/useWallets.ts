import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { WalletResponse } from "../types/api";

export const useWallets = () => {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => fetcher<WalletResponse[]>("/wallets"),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
