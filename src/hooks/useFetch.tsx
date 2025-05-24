import { useQuery, useMutation, useQueryClient, QueryKey } from 'react-query';
import api from '../services/api';
import { ApiError } from '../types';

// Generic fetch hook for GET requests
export function useFetch<T>(
  queryKey: QueryKey,
  url: string,
  params?: Record<string, any>,
  options = {}
) {
  return useQuery<T, ApiError>(
    params ? [...queryKey, params] : queryKey,
    async () => {
      const response = await api.get(url, { params });
      return response.data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      ...options,
    }
  );
}

// Hook for creating data
export function useCreate<T, R = T>(
  url: string,
  queryKey: QueryKey,
  options = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation<T, ApiError, R>(
    async (data) => {
      const response = await api.post(url, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      ...options,
    }
  );
}

// Hook for updating data
export function useUpdate<T, R = Partial<T>>(
  url: string,
  queryKey: QueryKey,
  options = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation<T, ApiError, { id: number; data: R }>(
    async ({ id, data }) => {
      const response = await api.put(`${url}/${id}/`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      ...options,
    }
  );
}

// Hook for deleting data
export function useDelete(
  url: string,
  queryKey: QueryKey,
  options = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, number>(
    async (id) => {
      await api.delete(`${url}/${id}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
      },
      ...options,
    }
  );
}