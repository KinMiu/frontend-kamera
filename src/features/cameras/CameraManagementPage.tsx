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
  Radio,
  MapPin,
  ExternalLink,
  Tv,
  X,
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
import { parseMediaMTXUrl } from '@/features/cameras/components/MediaMTXLivePlayer';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function CameraManagementPage() {
  const navigate = useNavigate();

  // Filters and table state
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mediamtx' | 'gps'>('all');
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

  const allFetchedCameras = camerasResponse?.data || [];
  const totalItems = camerasResponse?.total || 0;
  const totalPages = camerasResponse?.totalPages || 1;

  // Filter cameras locally if user selects quick filter tabs
  const cameras = useMemo(() => {
    if (activeFilter === 'mediamtx') {
      return allFetchedCameras.filter((c) => Boolean(c.mediamtxEndpoint && c.mediamtxEndpoint.trim() !== ''));
    }
    if (activeFilter === 'gps') {
      return allFetchedCameras.filter((c) => c.latitude != null && c.longitude != null);
    }
    return allFetchedCameras;
  }, [allFetchedCameras, activeFilter]);

  // Metric counts derived from current data
  const mediamtxCount = useMemo(
    () => allFetchedCameras.filter((c) => Boolean(c.mediamtxEndpoint && c.mediamtxEndpoint.trim() !== '')).length,
    [allFetchedCameras]
  );
  const gpsCount = useMemo(
    () => allFetchedCameras.filter((c) => c.latitude != null && c.longitude != null).length,
    [allFetchedCameras]
  );

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
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
              aria-label="Pilih semua baris"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(val) => row.toggleSelected(!!val)}
              aria-label="Pilih baris"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 44,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-foreground/80 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Kamera
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const cam = row.original;
          const isMtx = Boolean(cam.mediamtxEndpoint && cam.mediamtxEndpoint.trim() !== '');
          return (
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                  isMtx
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                <CameraIcon className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <button
                  onClick={() => navigate(`/cameras/${cam.id}`)}
                  className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors text-left truncate"
                >
                  {cam.name}
                </button>
                <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  ID: {cam.id.slice(0, 12)}...
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Tipe Stream',
        cell: ({ row }) => {
          const cam = row.original;
          const isMtx = Boolean(cam.mediamtxEndpoint && cam.mediamtxEndpoint.trim() !== '');
          return isMtx ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-0.5 font-medium whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MediaMTX Relay
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground border-border text-xs px-2.5 py-0.5 font-medium whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              RTSP Direct
            </Badge>
          );
        },
      },
      {
        accessorKey: 'macAddress',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-foreground/80 hover:text-foreground"
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
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-foreground/90 bg-muted/30 px-2 py-1 rounded border border-border/60">
                {mac}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
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
        header: 'RTSP Stream URL',
        cell: ({ row }) => {
          const endpoint = row.original.rtspEndpoint;
          const isCopied = copiedId === `rtsp-${row.original.id}`;

          return (
            <div className="flex items-center gap-1.5 max-w-[240px]">
              <div
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border/60 truncate flex-1"
                title={endpoint}
              >
                <Video className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate text-[11px]">{endpoint}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => handleCopy(endpoint, `rtsp-${row.original.id}`, 'RTSP URL')}
                title="Salin RTSP URL"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: 'latitude',
        header: 'Koordinat GPS',
        cell: ({ row }) => {
          const cam = row.original;
          const hasCoords =
            cam.latitude != null &&
            cam.longitude != null &&
            !isNaN(Number(cam.latitude)) &&
            !isNaN(Number(cam.longitude));

          return hasCoords ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-foreground/90 whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>
                {Number(cam.latitude).toFixed(4)}, {Number(cam.longitude).toFixed(4)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground/50 italic">- Belum diset -</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold text-foreground/80 hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Waktu Dibuat
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/60" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
            <span>{formatDate(row.original.createdAt)}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right pr-2">Aksi</div>,
        cell: ({ row }) => {
          const cam = row.original;
          const parsed = parseMediaMTXUrl(cam.mediamtxEndpoint || cam.rtspEndpoint);
          return (
            <div className="flex items-center justify-end gap-1.5 pr-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/cameras/${cam.id}`)}
                className="h-7 px-2.5 gap-1 text-xs font-medium hover:text-primary hover:border-primary/40"
                title="Buka Live Player"
              >
                <Eye className="h-3 w-3" />
                <span>Detail</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">Menu Opsi</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 shadow-xl">
                  <DropdownMenuLabel className="text-xs">Opsi Kamera</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate(`/cameras/${cam.id}`)}
                    className="cursor-pointer text-xs gap-2"
                  >
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Lihat Live Streaming</span>
                  </DropdownMenuItem>
                  {parsed && (
                    <DropdownMenuItem
                      onClick={() => window.open(parsed.hlsPlayerUrl, '_blank')}
                      className="cursor-pointer text-xs gap-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Buka HLS Web Player (Port 8888)</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingCamera(cam);
                      setFormModalOpen(true);
                    }}
                    className="cursor-pointer text-xs gap-2"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Edit Data Kamera</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleCopy(cam.rtspEndpoint, `menu-rtsp-${cam.id}`, 'RTSP Fisik URL')}
                    className="cursor-pointer text-xs gap-2"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Salin RTSP Fisik</span>
                  </DropdownMenuItem>
                  {cam.mediamtxEndpoint && (
                    <DropdownMenuItem
                      onClick={() => handleCopy(cam.mediamtxEndpoint!, `menu-mtx-${cam.id}`, 'MediaMTX Relay URL')}
                      className="cursor-pointer text-xs gap-2"
                    >
                      <Copy className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Salin MediaMTX Relay</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setCameraToDelete(cam);
                      setDeleteDialogOpen(true);
                    }}
                    className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Kamera</span>
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
            Daftar perangkat kamera pemantauan dan RTSP / MediaMTX relay di kawasan Way Kambas.
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
            <span>Refresh Data</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingCamera(null);
              setFormModalOpen(true);
            }}
            className="h-9 gap-1.5 text-xs font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kamera</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards - Real Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Perangkat Kamera</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                <span className="text-xs text-muted-foreground">Unit Terdaftar</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <CameraIcon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">MediaMTX Relay Aktif</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{mediamtxCount}</p>
                <span className="text-xs text-muted-foreground">dari {totalItems} kamera</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Radio className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Terpetakan GPS</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gpsCount}</p>
                <span className="text-xs text-muted-foreground">Titik Koordinat</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <MapPin className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="flex flex-col gap-3 p-4 border-b border-border/60 bg-muted/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama kamera, MAC, atau URL RTSP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 h-9 text-xs bg-background"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Buttons & Column Settings */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-border/80 bg-background p-0.5 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Semua ({totalItems})
                </button>
                <button
                  onClick={() => setActiveFilter('mediamtx')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeFilter === 'mediamtx'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  MediaMTX ({mediamtxCount})
                </button>
                <button
                  onClick={() => setActiveFilter('gps')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeFilter === 'gps'
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  GPS ({gpsCount})
                </button>
              </div>

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
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium bg-background">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Kolom</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-xl">
                  <DropdownMenuLabel className="text-xs">Tampilkan Kolom</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="text-xs cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id === 'name'
                          ? 'Nama Kamera'
                          : column.id === 'status'
                          ? 'Tipe Stream'
                          : column.id === 'macAddress'
                          ? 'MAC Address'
                          : column.id === 'rtspEndpoint'
                          ? 'RTSP Stream URL'
                          : column.id === 'latitude'
                          ? 'Koordinat GPS'
                          : column.id === 'createdAt'
                          ? 'Waktu Dibuat'
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/80">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="text-xs font-semibold text-muted-foreground py-3.5 px-4 whitespace-nowrap"
                    >
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
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Memuat data kamera Way Kambas...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cameras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <CameraIcon className="h-10 w-10 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-semibold text-foreground">Tidak ada kamera ditemukan</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {search
                          ? `Tidak ditemukan hasil yang cocok dengan "${search}".`
                          : 'Belum ada data kamera yang terdaftar pada sistem.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-muted/40 transition-colors border-b border-border/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 whitespace-nowrap">
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
            <span className="font-semibold text-foreground">
              {cameras.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-foreground">
              {Math.min(page * pageSize, totalItems)}
            </span>{' '}
            dari <span className="font-semibold text-foreground">{totalItems}</span> total kamera
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
                <SelectTrigger className="h-8 w-16 text-xs bg-background">
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
                className="h-8 w-8 bg-background"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 w-8 bg-background"
                title="Halaman Sebelumnya"
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
                className="h-8 w-8 bg-background"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="h-8 w-8 bg-background"
                title="Halaman Terakhir"
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
