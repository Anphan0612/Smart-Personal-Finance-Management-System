import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  type: string;
}

export interface CreateCategoryRequest {
  name: string;
  iconName: string;
  type: 'EXPENSE' | 'INCOME';
}

export const useCategories = () => {
  const token = useAppStore((state) => state.token);

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetcher<Category[]>('/categories'),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!token, // Only fetch when token exists
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      fetcher<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
