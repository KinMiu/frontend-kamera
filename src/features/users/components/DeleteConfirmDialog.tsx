import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User } from '@/types';
import { useDeleteUser } from '@/features/users/hooks/use-users';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const deleteMutation = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;
    await deleteMutation.mutateAsync(user.id);
    onOpenChange(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-destructive">
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            Are you sure you want to permanently remove{' '}
            <strong className="text-foreground">{user?.name}</strong> (
            <span className="font-mono text-xs">{user?.email}</span>)? This
            action cannot be undone and will revoke their workspace access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
