import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { githubIssuesApi, GitHubFetchParams } from '@/features/issues/api/github-issues-api';
import { CreateGitHubIssuePayload } from '@/types';
import { toast } from 'sonner';

export const GITHUB_ISSUES_QUERY_KEYS = {
  all: ['github_issues'] as const,
  list: (params?: GitHubFetchParams) => ['github_issues', 'list', params] as const,
};

export function useGetGitHubIssues(params?: GitHubFetchParams) {
  return useQuery({
    queryKey: GITHUB_ISSUES_QUERY_KEYS.list(params),
    queryFn: () => githubIssuesApi.getIssues(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateGitHubIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      owner,
      repo,
    }: {
      payload: CreateGitHubIssuePayload;
      owner?: string;
      repo?: string;
    }) => githubIssuesApi.createIssue(payload, owner, repo),
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: GITHUB_ISSUES_QUERY_KEYS.all });
      toast.success(`GitHub Issue #${issue.number} berhasil dibuat!`);
    },
    onError: (err: Error) => {
      toast.error(`Gagal membuat issue: ${err.message}`);
    },
  });
}

export function useToggleGitHubIssueState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueNumber,
      nextState,
      owner,
      repo,
    }: {
      issueNumber: number;
      nextState: 'open' | 'closed';
      owner?: string;
      repo?: string;
    }) => githubIssuesApi.toggleIssueState(issueNumber, nextState, owner, repo),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: GITHUB_ISSUES_QUERY_KEYS.all });
      toast.success(
        `Issue #${res.issueNumber} ${res.state === 'closed' ? 'ditutup' : 'dibuka kembali'}`
      );
    },
    onError: (err: Error) => {
      toast.error(`Gagal mengubah status issue: ${err.message}`);
    },
  });
}
