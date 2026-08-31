import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RefreshCw,
  Camera as CameraIcon,
  Video,
  Network,
  Copy,
  Check,
  Calendar,
  Layers,
  Radio,
  MapPin,
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
import { Camera } from '@/types';
import {
  useGetCameras,
  useDeleteMultipleCameras,
} from '@/features/cameras/hooks/use-cameras';
import { CameraFormModal } from '@/features/cameras/components/CameraFormModal';
import { DeleteCameraDialog } from '@/features/cameras/components/DeleteCameraDialog';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function CameraManagementPage() {
  const navigate = useNavigate();

  // Filters and table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);

  // Copied state indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive sort parameters
  const sortBy = sorting.length > 0 ? sorting[0].id : undefined;
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  // React Query Fetch Hook
  const { data: camerasResponse, isLoading, isFetching, refetch } = useGetCameras({
    page,
    pageSize,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMultiple = useDeleteMultipleCameras();

  const cameras = camerasResponse?.data || [];
  const totalItems = camerasResponse?.total || 0;
  const totalPages = camerasResponse?.totalPages || 1;

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} disalin ke clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<Camera>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center pl-2">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center pl-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(val) => row.toggleSelected(!!val)}
              aria-label="Select row"
              className="translate-y-[2px]"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Kamera
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const cam = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <CameraIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <button
                  onClick={() => navigate(`/cameras/${cam.id}`)}
                  className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors text-left truncate group flex items-center gap-1.5"
                >
                  <span className="truncate">{cam.name}</span>
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px]">ID: {cam.id}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'macAddress',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            MAC Address
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
          </Button>
        ),
        cell: ({ row }) => {
          const mac = row.original.macAddress;
          const isCopied = copiedId === `mac-${row.original.id}`;
          return (
            <div className="flex items-center gap-1.5 group">
              <Badge variant="outline" className="font-mono text-xs bg-muted/30 px-2 py-0.5">
                <Network className="mr-1.5 h-3 w-3 text-muted-foreground" />
                {mac}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(mac, `mac-${row.original.id}`, 'MAC Address')}
                title="Salin MAC Address"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: 'rtspEndpoint',
        header: 'RTSP Stream Endpoint',
        cell: ({ row }) => {
          const endpoint = row.original.rtspEndpoint;
          const mediamtx = row.original.mediamtxEndpoint;
          const isCopied = copiedId === `rtsp-${row.original.id}`;
          const isMtxCopied = copiedId === `mtx-${row.original.id}`;
          return (
            <div className="flex flex-col gap-1 max-w-[280px]">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border truncate flex-1">
                  <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate" title={endpoint}>{endpoint}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => handleCopy(endpoint, `rtsp-${row.original.id}`, 'RTSP URL')}
                  title="Salin RTSP Stream URL"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              {mediamtx && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 truncate flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1 bg-emerald-500/20 rounded">MTX</span>
                    <span className="truncate" title={mediamtx}>{mediamtx}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => handleCopy(mediamtx, `mtx-${row.original.id}`, 'MediaMTX RTSP URL')}
                    title="Salin MediaMTX Bypass URL"
                  >
                    {isMtxCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'latitude',
        header: 'Koordinat GPS',
        cell: ({ row }) => {
          const cam = row.original;
          const hasCoords = cam.latitude != null && cam.longitude != null;
          return hasCoords ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border w-fit">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span>{Number(cam.latitude).toFixed(4)}, {Number(cam.longitude).toFixed(4)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/60 italic">- Belum diset -</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Waktu Dibuat
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{formatDate(row.original.createdAt)}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right pr-2">Aksi</div>,
        cell: ({ row }) => {
          const cam = row.original;
          return (
            <div className="flex items-center justify-end gap-1 pr-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/cameras/${cam.id}`)}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Buka Detail Stream"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 shadow-xl">
                  <DropdownMenuLabel className="text-xs">Aksi Perangkat</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate(`/cameras/${cam.id}`)}
                    className="cursor-pointer text-xs"
                  >
                    <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Lihat Stream & Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingCamera(cam);
                      setFormModalOpen(true);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Edit2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Edit Data Kamera
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCopy(cam.rtspEndpoint, `menu-${cam.id}`, 'RTSP URL')}
                    className="cursor-pointer text-xs"
                  >
                    <Copy className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Salin RTSP Stream
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setCameraToDelete(cam);
                      setDeleteDialogOpen(true);
                    }}
                    className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Hapus Kamera
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [copiedId, navigate]
  );

  const table = useReactTable({
    data: cameras,
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
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBatchDelete = async () => {
    const ids = selectedRows.map((r) => r.original.id);
    if (ids.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${ids.length} kamera terpilih?`)) {
      await deleteMultiple.mutateAsync(ids);
      setRowSelection({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Manajemen Kamera
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {totalItems} Perangkat
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Daftar perangkat kamera pemantauan dan RTSP stream di kawasan Way Kambas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingCamera(null);
              setFormModalOpen(true);
            }}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kamera</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Perangkat</p>
              <p className="text-2xl font-bold text-foreground">{totalItems} Unit</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <CameraIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">RTSP Stream Aktif</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalItems} Stream
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Skema Database</p>
              <p className="text-sm font-semibold text-foreground font-mono">Device (Prisma)</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 bg-muted/10">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama, MAC, atau RTSP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Batch delete action */}
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="h-9 gap-1.5 text-xs animate-in fade-in"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus ({selectedRows.length})</span>
              </Button>
            )}

            {/* Column Visibility Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Kolom</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 shadow-xl">
                <DropdownMenuLabel className="text-xs">Pengaturan Kolom</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === 'name'
                        ? 'Nama Kamera'
                        : column.id === 'macAddress'
                        ? 'MAC Address'
                        : column.id === 'rtspEndpoint'
                        ? 'RTSP Endpoint'
                        : column.id === 'createdAt'
                        ? 'Waktu Dibuat'
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs">Memuat data kamera...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cameras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <CameraIcon className="h-8 w-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium text-foreground">Tidak ada kamera ditemukan</p>
                      <p className="text-xs text-muted-foreground">
                        Coba sesuaikan kata kunci pencarian atau tambah kamera baru.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 bg-muted/10 text-xs">
          <div className="text-muted-foreground">
            Menampilkan{' '}
            <span className="font-medium text-foreground">
              {cameras.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-medium text-foreground">
              {Math.min(page * pageSize, totalItems)}
            </span>{' '}
            dari <span className="font-medium text-foreground">{totalItems}</span> total kamera
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Per halaman:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-muted-foreground">
                Halaman <strong className="text-foreground">{page}</strong> dari{' '}
                <strong className="text-foreground">{totalPages}</strong>
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Camera Form Modal (Add / Edit) */}
      <CameraFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        camera={editingCamera}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteCameraDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        camera={cameraToDelete}
      />
    </div>
  );
}
