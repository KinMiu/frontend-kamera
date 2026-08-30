import {
  GitHubIssue,
  CreateGitHubIssuePayload,
} from '@/types';
import { initialGitHubIssues } from '@/lib/mock-data';

const GITHUB_ISSUES_STORAGE_KEY = 'waykambas_github_issues_cache';

export interface GitHubFetchParams {
  owner?: string;
  repo?: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string;
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

function getLocalCachedIssues(): GitHubIssue[] {
  try {
    const raw = localStorage.getItem(GITHUB_ISSUES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GITHUB_ISSUES_STORAGE_KEY, JSON.stringify(initialGitHubIssues));
      return initialGitHubIssues;
    }
    return JSON.parse(raw);
  } catch {
    return initialGitHubIssues;
  }
}

function saveLocalCachedIssues(issues: GitHubIssue[]): void {
  try {
    localStorage.setItem(GITHUB_ISSUES_STORAGE_KEY, JSON.stringify(issues));
  } catch (error) {
    console.error('Failed to save GitHub issues to cache:', error);
  }
}

export const githubIssuesApi = {
  /**
   * Fetches issues from GitHub API with local mock fallback
   */
  async getIssues(params: GitHubFetchParams = {}): Promise<{ issues: GitHubIssue[]; isLive: boolean }> {
    const owner = params.owner || 'KinMiu';
    const repo = params.repo || 'frontend-kamera';
    const state = params.state || 'all';

    try {
      const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
      url.searchParams.set('state', state);
      url.searchParams.set('per_page', String(params.per_page || 50));
      if (params.labels) url.searchParams.set('labels', params.labels);
      if (params.sort) url.searchParams.set('sort', params.sort);
      if (params.direction) url.searchParams.set('direction', params.direction);

      const token = localStorage.getItem('github_pat_token');
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url.toString(), { headers });

      if (res.ok) {
        const data: any[] = await res.json();
        // Filter out pull requests as GitHub issues endpoint returns both
        const issueList: GitHubIssue[] = data
          .filter((item) => !item.pull_request)
          .map((item) => ({
            id: item.id,
            number: item.number,
            title: item.title,
            state: item.state,
            locked: item.locked || false,
            user: {
              login: item.user?.login || 'Anonymous',
              id: item.user?.id || 0,
              avatar_url: item.user?.avatar_url || 'https://github.com/ghost.png',
              html_url: item.user?.html_url || '',
            },
            labels: (item.labels || []).map((l: any) => ({
              id: l.id,
              name: l.name,
              color: l.color,
              description: l.description,
            })),
            body: item.body || '',
            comments: item.comments || 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
            closed_at: item.closed_at || null,
            html_url: item.html_url,
            author_association: item.author_association,
            assignees: item.assignees?.map((a: any) => ({
              login: a.login,
              id: a.id,
              avatar_url: a.avatar_url,
              html_url: a.html_url,
            })),
          }));

        // If repo returned live issues, return them
        if (issueList.length > 0) {
          saveLocalCachedIssues(issueList);
          return { issues: issueList, isLive: true };
        }
      }
    } catch (err) {
      console.warn('Could not fetch from live GitHub API, falling back to local issues:', err);
    }

    // Fallback: Use cached or initial mock issues
    await new Promise((resolve) => setTimeout(resolve, 200));
    let cached = getLocalCachedIssues();

    if (state && state !== 'all') {
      cached = cached.filter((issue) => issue.state === state);
    }

    return { issues: cached, isLive: false };
  },

  /**
   * Creates a new GitHub issue
   */
  async createIssue(
    payload: CreateGitHubIssuePayload,
    owner = 'KinMiu',
    repo = 'frontend-kamera'
  ): Promise<GitHubIssue> {
    const token = localStorage.getItem('github_pat_token');

    if (token) {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: payload.title,
            body: payload.body,
            labels: payload.labels,
            assignees: payload.assignees,
          }),
        });

        if (res.ok) {
          const item = await res.json();
          return {
            id: item.id,
            number: item.number,
            title: item.title,
            state: item.state,
            locked: false,
            user: {
              login: item.user?.login || 'KinMiu',
              id: item.user?.id || 1,
              avatar_url: item.user?.avatar_url || 'https://github.com/KinMiu.png',
              html_url: item.user?.html_url || '',
            },
            labels: item.labels || [],
            body: item.body || '',
            comments: 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
            closed_at: null,
            html_url: item.html_url,
          };
        }
      } catch (e) {
        console.warn('Failed to post issue to GitHub API, saving to local state:', e);
      }
    }

    // Fallback local creation
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cached = getLocalCachedIssues();
    const nextNumber = Math.max(0, ...cached.map((i) => i.number)) + 1;

    const newIssue: GitHubIssue = {
      id: Date.now(),
      number: nextNumber,
      title: payload.title,
      state: 'open',
      locked: false,
      user: {
        login: 'KinMiu',
        id: 991234,
        avatar_url: 'https://github.com/KinMiu.png',
        html_url: 'https://github.com/KinMiu',
      },
      labels: (payload.labels || ['enhancement']).map((name, i) => ({
        id: Date.now() + i,
        name,
        color: name === 'bug' ? 'd73a4a' : 'a2eeef',
      })),
      body: payload.body,
      comments: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      closed_at: null,
      html_url: `https://github.com/${owner}/${repo}/issues/${nextNumber}`,
      author_association: 'OWNER',
    };

    saveLocalCachedIssues([newIssue, ...cached]);
    return newIssue;
  },

  /**
   * Toggles issue state (open/closed)
   */
  async toggleIssueState(
    issueNumber: number,
    nextState: 'open' | 'closed',
    owner = 'KinMiu',
    repo = 'frontend-kamera'
  ): Promise<{ success: boolean; issueNumber: number; state: 'open' | 'closed' }> {
    const token = localStorage.getItem('github_pat_token');

    if (token) {
      try {
        await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ state: nextState }),
        });
      } catch (e) {
        console.warn('Failed to update issue state on GitHub API:', e);
      }
    }

    const cached = getLocalCachedIssues();
    const idx = cached.findIndex((i) => i.number === issueNumber);
    if (idx !== -1) {
      cached[idx] = {
        ...cached[idx],
        state: nextState,
        closed_at: nextState === 'closed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      saveLocalCachedIssues(cached);
    }

    return { success: true, issueNumber, state: nextState };
  },
};
