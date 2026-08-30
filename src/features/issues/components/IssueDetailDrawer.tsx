import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitHubIssue } from '@/types';
import { useToggleGitHubIssueState } from '@/features/issues/hooks/use-github-issues';
import { formatDate } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Calendar,
  Lock,
  Tag,
  Loader2,
} from 'lucide-react';

interface IssueDetailDrawerProps {
  issue: GitHubIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: string;
  repo?: string;
}

export function IssueDetailDrawer({
  issue,
  open,
  onOpenChange,
  owner = 'KinMiu',
  repo = 'frontend-kamera',
}: IssueDetailDrawerProps) {
  const toggleState = useToggleGitHubIssueState();

  if (!issue) return null;

  const isOpen = issue.state === 'open';

  const handleToggle = async () => {
    await toggleState.mutateAsync({
      issueNumber: issue.number,
      nextState: isOpen ? 'closed' : 'open',
      owner,
      repo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-border shadow-2xl p-6">
        <DialogHeader className="space-y-3 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Badge
              variant={isOpen ? 'default' : 'secondary'}
              className={`text-xs font-semibold gap-1.5 py-1 px-2.5 ${
                isOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isOpen ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>{isOpen ? 'Open' : 'Closed'}</span>
            </Badge>

            <span className="text-xs font-mono text-muted-foreground font-semibold">
              #{issue.number}
            </span>

            {issue.locked && (
              <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold leading-snug text-foreground">
            {issue.title}
          </DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={issue.user.avatar_url} />
                  <AvatarFallback className="text-[9px]">
                    {issue.user.login.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <a
                  href={issue.user.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground hover:underline"
                >
                  {issue.user.login}
                </a>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Dibuka {formatDate(issue.created_at)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{issue.comments} komentar</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Issue Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {issue.labels.map((label) => (
              <span
                key={label.id}
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}40`,
                }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Issue Body */}
        <div className="rounded-xl border bg-muted/20 p-4 font-sans text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap select-text">
          {issue.body ? (
            issue.body
          ) : (
            <span className="italic text-muted-foreground">
              Tidak ada deskripsi yang disediakan pada issue ini.
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={toggleState.isPending}
            className="text-xs h-9 gap-1.5 w-full sm:w-auto"
          >
            {toggleState.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isOpen ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span>{isOpen ? 'Close Issue' : 'Reopen Issue'}</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Tutup
            </Button>

            <a
              href={issue.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button size="sm" className="text-xs h-9 gap-1.5 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Buka di GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
