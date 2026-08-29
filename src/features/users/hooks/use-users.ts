import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '@/features/users/api/users-api';
import { PaginationParams, User, UserFormData } from '@/types';

export const USERS_QUERY_KEY = ['users'];

export function useGetUsers(params: PaginationParams) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => usersApi.getUsers(params),
  });
}

export function useGetUser(id: string) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: () => usersApi.getUserById(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserFormData) => usersApi.createUser(payload),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`User created successfully`, {
        description: `${newUser.name} has been added to the workspace.`,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user`, {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) =>
      usersApi.updateUser(id, payload),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`User updated successfully`, {
        description: `Changes to ${updatedUser.name}'s profile have been saved.`,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user`, {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`User deleted successfully`, {
        description: 'The selected user has been removed.',
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user`, {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });
}

export function useDeleteMultipleUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => usersApi.deleteMultipleUsers(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(`Users deleted`, {
        description: `${res.count} users were removed successfully.`,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete users`, {
        description: error.message || 'An unexpected error occurred.',
      });
    },
  });
}
