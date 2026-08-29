export type UserRole = 'Admin' | 'Editor' | 'Viewer' | 'Manager';
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
  type: 'security' | 'auth' | 'edit' | 'billing' | 'system';
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

  // Extended Profile & Contact Information
  phone?: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  jobTitle?: string;
  employmentType?: 'Full-time' | 'Contract' | 'Part-time';
  twoFactorEnabled?: boolean;
  sessions?: UserSecuritySession[];
  activities?: UserActivityLog[];
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

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
  revenue: number;
  expenses: number;
  profit: number;
}

export interface SalesCategoryData {
  name: string;
  sales: number;
  target: number;
}

export interface DeviceDistributionData {
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

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  status?: string;
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
