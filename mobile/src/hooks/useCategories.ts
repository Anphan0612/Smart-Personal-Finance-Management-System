import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../services/api";

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => fetcher<Category[]>("/categories"),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
