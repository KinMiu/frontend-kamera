import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Shield,
  Clock,
  Building2,
  RefreshCw,
  MapPin,
  Users as UsersIcon,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, UserRole, UserStatus } from '@/types';
import {
  useGetUsers,
  useDeleteMultipleUsers,
} from '@/features/users/hooks/use-users';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { DeleteConfirmDialog } from '@/features/users/components/DeleteConfirmDialog';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function UserManagementPage() {
  const navigate = useNavigate();

  // Filters and table state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Sorting params derived
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  // React Query Fetch Hook
  const { data: usersResponse, isLoading, isFetching, refetch } = useGetUsers({
    page,
    pageSize,
    search,
    role: roleFilter,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  const deleteMultipleMutation = useDeleteMultipleUsers();

  const usersList = useMemo(() => usersResponse?.data || [], [usersResponse]);
  const totalUsers = usersResponse?.total || 0;
  const totalPages = usersResponse?.totalPages || 1;

  // Handlers for Add, Edit, Delete
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    const selectedIds = selectedIndices
      .map((idx) => usersList[idx]?.id)
      .filter(Boolean);

    if (selectedIds.length === 0) return;

    await deleteMultipleMutation.mutateAsync(selectedIds);
    setRowSelection({});
  };

  // Status Badge styling helper
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Active</Badge>;
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'Inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Role Badge styling helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-xs">
            <Shield className="h-3.5 w-3.5" /> Admin
          </span>
        );
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 text-xs">
            Manager
          </span>
        );
      case 'Editor':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 text-xs">
            Editor
          </span>
        );
      case 'Viewer':
        return (
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground text-xs">
            Viewer
          </span>
        );
    }
  };

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            User Details
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Link
              to={`/users/${user.id}`}
              className="group flex items-center gap-3 focus:outline-none"
            >
              <Avatar className="h-9 w-9 border border-border/80 transition-transform group-hover:scale-105 group-hover:border-primary/40">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs font-bold">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3 shrink-0" /> {user.email}
                </span>
                {(user.city || user.country) && (
                  <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                    {user.city && user.country ? `${user.city}, ${user.country}` : user.city || user.country}
                  </span>
                )}
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Role
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => getRoleBadge(row.original.role),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Status
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </button>
        ),
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Building2 className="h-3.5 w-3.5" />
            {row.original.department}
          </span>
        ),
      },
      {
        accessorKey: 'lastActive',
        header: 'Last Active',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {row.original.lastActive}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined Date',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/users/${user.id}`)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                title="View User Details"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenEditModal(user)}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                title="Edit User"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenDeleteDialog(user)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                title="Delete User"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View Full Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(user.email);
                      toast.success('Email copied to clipboard');
                    }}
                  >
                    Copy User Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenEditModal(user)}>
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleOpenDeleteDialog(user)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: usersList,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {totalUsers} members
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage organization members, assign permission roles, and control access.
          </p>
        </div>

        {/* Add User Action Button */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleOpenAddModal}
            className="h-9 gap-1.5 text-xs font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Member</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 bg-muted/20">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, dept..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs bg-background"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-32 sm:w-36 text-xs bg-background">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-32 sm:w-36 text-xs bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Bulk delete action if selected */}
            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMultipleMutation.isPending}
                className="h-9 gap-1.5 text-xs font-semibold animate-in fade-in zoom-in-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete ({selectedCount})</span>
              </Button>
            )}

            {/* Column Visibility Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs font-medium bg-background"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  Toggle Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize text-xs cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/40">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-3 text-xs">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={columns.length} className="h-16 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-xs text-muted-foreground">
                          Loading user data...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        No team members found
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Try modifying your search keywords or active filters to find
                        what you are looking for.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/70 text-xs text-muted-foreground bg-muted/10">
            <div className="flex items-center gap-4">
              <span>
                Showing{' '}
                <strong className="text-foreground">
                  {totalUsers === 0 ? 0 : (page - 1) * pageSize + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-foreground">
                  {Math.min(page * pageSize, totalUsers)}
                </strong>{' '}
                of <strong className="text-foreground">{totalUsers}</strong>{' '}
                entries
              </span>

              {/* Rows per page selector */}
              <div className="flex items-center gap-2">
                <span>Rows:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-16 text-xs bg-background">
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Page navigation buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
                className="h-8 w-8 bg-background"
                title="First Page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || isLoading}
                className="h-8 w-8 bg-background"
                title="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <span className="px-2 font-medium text-foreground">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || isLoading}
                className="h-8 w-8 bg-background"
                title="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || isLoading}
                className="h-8 w-8 bg-background"
                title="Last Page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Add / Edit Modal */}
      <UserFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        userToEdit={editingUser}
      />

      {/* User Delete Alert Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
      />
    </div>
  );
}
