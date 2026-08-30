import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Tag,
  MessageSquare,
  Calendar,
  ExternalLink,
  GitPullRequest,
  Check,
  GitFork,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitHubIssue } from '@/types';
import { useGetGitHubIssues } from '@/features/issues/hooks/use-github-issues';
import { IssueDetailDrawer } from '@/features/issues/components/IssueDetailDrawer';
import { NewIssueModal } from '@/features/issues/components/NewIssueModal';
import { formatDate } from '@/lib/utils';

const POPULAR_REPOS = [
  { owner: 'KinMiu', repo: 'frontend-kamera', label: 'KinMiu / frontend-kamera' },
  { owner: 'KinMiu', repo: 'worker-gateway-cam', label: 'KinMiu / worker-gateway-cam' },
  { owner: 'KinMiu', repo: 'worker-cam-send-data', label: 'KinMiu / worker-cam-send-data' },
  { owner: 'KinMiu', repo: 'backend-Greenhouse-management', label: 'KinMiu / backend-Greenhouse-management' },
];

export function GitHubIssuesPage() {
  const [selectedRepoStr, setSelectedRepoStr] = useState('KinMiu/frontend-kamera');
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'comments'>('created');

  // Modals & Drawers
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [newIssueModalOpen, setNewIssueModalOpen] = useState(false);

  const [owner, repo] = selectedRepoStr.split('/');

  // Query Hook
  const { data, isLoading, isFetching, refetch } = useGetGitHubIssues({
    owner,
    repo,
    state: activeTab === 'all' ? 'all' : activeTab,
    sort: sortBy,
  });

  const allIssues = data?.issues || [];
  const isLive = data?.isLive || false;

  // Derive counts
  const openCount = useMemo(
    () => allIssues.filter((i) => i.state === 'open').length,
    [allIssues]
  );
  const closedCount = useMemo(
    () => allIssues.filter((i) => i.state === 'closed').length,
    [allIssues]
  );

  // Filtered Issues by Search & Label
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      // Tab filter
      if (activeTab === 'open' && issue.state !== 'open') return false;
      if (activeTab === 'closed' && issue.state !== 'closed') return false;

      // Label filter
      if (
        selectedLabel !== 'all' &&
        !issue.labels?.some((l) => l.name.toLowerCase() === selectedLabel.toLowerCase())
      ) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchNumber = `#${issue.number}`.includes(q) || String(issue.number) === q;
        const matchAuthor = issue.user.login.toLowerCase().includes(q);
        const matchBody = (issue.body || '').toLowerCase().includes(q);
        return matchTitle || matchNumber || matchAuthor || matchBody;
      }

      return true;
    });
  }, [allIssues, activeTab, selectedLabel, search]);

  const handleOpenDetail = (issue: GitHubIssue) => {
    setSelectedIssue(issue);
    setDetailDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              GitHub Issues
            </h1>
            <Badge
              variant="outline"
              className={`text-xs ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isLive ? 'Live GitHub Sync' : 'Cached Sync'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pelacakan issue dan tiket kendala repositori pengembangan sistem kamera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Repository Selector */}
          <Select value={selectedRepoStr} onValueChange={setSelectedRepoStr}>
            <SelectTrigger className="h-9 w-60 text-xs font-medium">
              <GitFork className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Pilih Repositori" />
            </SelectTrigger>
            <SelectContent align="end">
              {POPULAR_REPOS.map((item) => (
                <SelectItem key={`${item.owner}/${item.repo}`} value={`${item.owner}/${item.repo}`} className="text-xs font-mono">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            onClick={() => setNewIssueModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>New Issue</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Issues Terdaftar</p>
              <p className="text-2xl font-bold text-foreground">{allIssues.length} Issues</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Open Issues (Aktif)</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {openCount} Open
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Closed Issues (Selesai)</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {closedCount} Closed
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Issue List Container */}
      <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
        {/* State Tabs & Filters Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 bg-muted/10">
          {/* State Tabs */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Semua</span>
              <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded-full">
                {allIssues.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('open')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'open'
                  ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Open</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded-full">
                {openCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('closed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'closed'
                  ? 'bg-background text-purple-600 dark:text-purple-400 shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Closed</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.2 rounded-full">
                {closedCount}
              </span>
            </button>
          </div>

          {/* Search & Label Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari judul, #nomor, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={selectedLabel} onValueChange={setSelectedLabel}>
              <SelectTrigger className="h-9 w-32 text-xs">
                <Tag className="mr-1.5 h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Label" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">Semua Label</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="enhancement">Enhancement</SelectItem>
                <SelectItem value="video-stream">Video Stream</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="h-9 w-32 text-xs">
                <SlidersHorizontal className="mr-1.5 h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="created">Terbaru</SelectItem>
                <SelectItem value="updated">Update Terkini</SelectItem>
                <SelectItem value="comments">Komentar Terbanyak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Issue List View */}
        <div className="divide-y divide-border/60">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Memuat daftar GitHub issues...</span>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground/50 stroke-1" />
              <div>
                <p className="text-sm font-semibold text-foreground">Tidak ada issue yang sesuai</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Coba ubah kata kunci pencarian, filter label, atau buat issue baru.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedLabel('all');
                  setActiveTab('all');
                }}
                className="text-xs h-8"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isOpen = issue.state === 'open';
              return (
                <div
                  key={issue.id}
                  className="flex items-start justify-between p-4 hover:bg-accent/40 transition-colors cursor-pointer group"
                  onClick={() => handleOpenDetail(issue)}
                >
                  <div className="flex items-start gap-3.5 overflow-hidden flex-1">
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {isOpen ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    {/* Issue Main Content */}
                    <div className="space-y-1.5 overflow-hidden flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {issue.title}
                        </span>

                        {/* Labels */}
                        {issue.labels?.map((label) => (
                          <span
                            key={label.id}
                            style={{
                              backgroundColor: `#${label.color}15`,
                              color: `#${label.color}`,
                              borderColor: `#${label.color}35`,
                            }}
                            className="text-[10px] font-semibold px-2 py-0.2 rounded-full border inline-block"
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="font-mono font-medium">#{issue.number}</span>
                        <span>oleh <strong className="font-medium text-foreground">{issue.user.login}</strong></span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground/70" />
                          {formatDate(issue.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Comments count & External link */}
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {issue.comments > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border">
                        <MessageSquare className="h-3 w-3" />
                        <span className="font-mono text-[11px]">{issue.comments}</span>
                      </div>
                    )}

                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Buka langsung di GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Repository Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-muted/20 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <GitFork className="h-3.5 w-3.5" />
            <span>Target Repo: <strong className="text-foreground">{owner}/{repo}</strong></span>
          </div>

          <a
            href={`https://github.com/${owner}/${repo}/issues`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline font-medium mt-2 sm:mt-0"
          >
            <span>Lihat semua di GitHub.com</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>

      {/* Issue Detail Drawer Modal */}
      <IssueDetailDrawer
        issue={selectedIssue}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        owner={owner}
        repo={repo}
      />

      {/* New Issue Creation Modal */}
      <NewIssueModal
        open={newIssueModalOpen}
        onOpenChange={setNewIssueModalOpen}
        owner={owner}
        repo={repo}
      />
    </div>
  );
}
