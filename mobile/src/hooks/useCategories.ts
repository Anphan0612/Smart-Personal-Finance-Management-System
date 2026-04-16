import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";
import { useAppStore } from "../store/useAppStore";

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export const useCategories = () => {
  const token = useAppStore((state) => state.token);

  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetcher<Category[]>("/categories"),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!token, // Only fetch when token exists
  });
};
