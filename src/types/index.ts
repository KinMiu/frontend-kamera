// =============================================================================
// Authentication & User Types (Preserved for Auth System)
// =============================================================================
export type UserRole = 'Admin' | 'Operator' | 'Viewer' | 'Technician';
export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface UserSecuritySession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  type: 'security' | 'auth' | 'edit' | 'camera' | 'system';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  department: string;
  createdAt: string;
  lastActive: string;
  phone?: string;
  location?: string;
  bio?: string;
}

// =============================================================================
// Camera / Device Types (Aligned with Prisma Device Schema)
// =============================================================================
export interface Camera {
  id: string;
  name: string;
  macAddress: string;
  rtspEndpoint: string;
  mediamtxEndpoint?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface CameraFormData {
  name: string;
  macAddress: string;
  rtspEndpoint: string;
  mediamtxEndpoint?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// =============================================================================
// GitHub Issues Types
// =============================================================================
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed';
  due_on?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  locked: boolean;
  user: GitHubUser;
  labels: GitHubLabel[];
  body: string | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  author_association?: string;
  assignees?: GitHubUser[];
  milestone?: GitHubMilestone | null;
}

export interface GitHubIssueComment {
  id: number;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  body: string;
  html_url: string;
}

export interface CreateGitHubIssuePayload {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
}

// =============================================================================
// Dashboard & Metric Types
// =============================================================================
export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  period: string;
  icon: string;
}

export interface RevenueChartData {
  name: string;
  activeStreams: number;
  captures: number;
  detections: number;
}

export interface CameraStatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed' | 'pending';
  amount?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'order' | 'user' | 'system' | 'alert';
}

// =============================================================================
// Pagination & Table Generic Types
// =============================================================================
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
