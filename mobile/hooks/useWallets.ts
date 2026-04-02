import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currencyCode: string;
  currencySymbol: string;
  type: "CASH" | "BANK" | "EWALLET" | "INVESTMENT";
  icon?: string;
  color?: string;
}

export const useWallets = () => {
  const token = useAppStore(state => state.token);

  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => fetcher<Wallet[]>("/wallets"),
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
