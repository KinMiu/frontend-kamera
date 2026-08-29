import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, UserFormData, UserRole, UserStatus } from '@/types';
import { useCreateUser, useUpdateUser } from '@/features/users/hooks/use-users';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['Admin', 'Editor', 'Viewer', 'Manager'] as const, {
    required_error: 'Please select a role',
  }),
  status: z.enum(['Active', 'Inactive', 'Pending'] as const, {
    required_error: 'Please select a status',
  }),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.coerce.number().min(-90, 'Min latitude is -90').max(90, 'Max latitude is 90').optional(),
  longitude: z.coerce.number().min(-180, 'Min longitude is -180').max(180, 'Max longitude is 180').optional(),
});

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
}

export function UserFormModal({
  open,
  onOpenChange,
  userToEdit,
}: UserFormModalProps) {
  const isEditing = Boolean(userToEdit);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Editor',
      status: 'Active',
      department: 'Engineering',
      phone: '',
      address: '',
      city: '',
      country: '',
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });

  // Populate data when editing
  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
        department: userToEdit.department,
        phone: userToEdit.phone || '',
        address: userToEdit.address || '',
        city: userToEdit.city || '',
        country: userToEdit.country || '',
        latitude: userToEdit.latitude ?? 37.7749,
        longitude: userToEdit.longitude ?? -122.4194,
      });
    } else {
      reset({
        name: '',
        email: '',
        role: 'Editor',
        status: 'Active',
        department: 'Engineering',
        phone: '',
        address: '',
        city: '',
        country: '',
        latitude: 37.7749,
        longitude: -122.4194,
      });
    }
  }, [userToEdit, reset, open]);

  const onSubmit = async (data: UserFormData) => {
    if (isEditing && userToEdit) {
      await updateUserMutation.mutateAsync({
        id: userToEdit.id,
        payload: data,
      });
    } else {
      await createUserMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Edit User Profile' : 'Add New Team Member'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's role, status, contact, and geographic address details."
              : 'Fill in the information below to invite a new user to the workspace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Full Name *
            </label>
            <Input
              placeholder="e.g. Alex Rivera"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="alex@company.com"
                error={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Phone Number
              </label>
              <Input
                type="text"
                placeholder="+1 (555) 000-0000"
                error={Boolean(errors.phone)}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Role & Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Role Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Role *</label>
              <Select
                defaultValue={userToEdit ? userToEdit.role : 'Editor'}
                onValueChange={(val) => setValue('role', val as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status *
              </label>
              <Select
                defaultValue={userToEdit ? userToEdit.status : 'Active'}
                onValueChange={(val) => setValue('status', val as UserStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Department Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Department *
            </label>
            <Input
              placeholder="e.g. Design & UX, Engineering"
              error={Boolean(errors.department)}
              {...register('department')}
            />
            {errors.department && (
              <p className="text-xs text-destructive">
                {errors.department.message}
              </p>
            )}
          </div>

          {/* Location & Geographic Address Section */}
          <div className="pt-2 border-t border-border/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Geographic Location & Coordinates
            </h4>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Street Address
              </label>
              <Input
                placeholder="e.g. 525 Market Street, Suite 3200"
                error={Boolean(errors.address)}
                {...register('address')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City</label>
                <Input
                  placeholder="e.g. San Francisco"
                  error={Boolean(errors.city)}
                  {...register('city')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Country</label>
                <Input
                  placeholder="e.g. United States"
                  error={Boolean(errors.country)}
                  {...register('country')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. 37.7749"
                  error={Boolean(errors.latitude)}
                  {...register('latitude')}
                />
                {errors.latitude && (
                  <p className="text-xs text-destructive">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g. -122.4194"
                  error={Boolean(errors.longitude)}
                  {...register('longitude')}
                />
                {errors.longitude && (
                  <p className="text-xs text-destructive">{errors.longitude.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
