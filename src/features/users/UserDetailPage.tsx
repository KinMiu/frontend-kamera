import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  KeyRound,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useGetUser, useUpdateUser } from '@/features/users/hooks/use-users';
import { User, UserRole, UserStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { UserFormModal } from '@/features/users/components/UserFormModal';
import { DeleteConfirmDialog } from '@/features/users/components/DeleteConfirmDialog';
import { UserLocationMap } from '@/features/users/components/UserLocationMap';
import { toast } from 'sonner';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useGetUser(id || '');
  const updateUserMutation = useUpdateUser();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [twoFactorLocal, setTwoFactorLocal] = useState<boolean | null>(null);

  // Status Badge styling helper
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success" className="px-3 py-1 font-semibold">Active</Badge>;
      case 'Pending':
        return <Badge variant="warning" className="px-3 py-1 font-semibold">Pending</Badge>;
      case 'Inactive':
        return <Badge variant="destructive" className="px-3 py-1 font-semibold">Inactive</Badge>;
      default:
        return <Badge variant="secondary" className="px-3 py-1 font-semibold">{status}</Badge>;
    }
  };

  // Role Badge styling helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Shield className="h-3.5 w-3.5" /> Admin
          </span>
        );
      case 'Manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Manager
          </span>
        );
      case 'Editor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Editor
          </span>
        );
      case 'Viewer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            Viewer
          </span>
        );
    }
  };

  // Toggle user active/suspended status
  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    await updateUserMutation.mutateAsync({
      id: user.id,
      payload: { status: newStatus },
    });
    toast.success(`Account status updated`, {
      description: `${user.name}'s account is now marked as ${newStatus}.`,
    });
  };

  // Toggle 2FA switch
  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorLocal(checked);
    if (!user) return;
    updateUserMutation.mutate({
      id: user.id,
      payload: { twoFactorEnabled: checked },
    });
    toast.success(
      checked ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled',
      {
        description: `Security preference updated for ${user.name}.`,
      }
    );
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-36 bg-muted rounded-lg" />
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-64 bg-muted rounded-md" />
              <div className="h-4 w-48 bg-muted rounded-md" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-6 w-24 bg-muted rounded-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-muted rounded-lg" />
              <div className="h-10 w-32 bg-muted rounded-lg" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-12 w-80 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 rounded-2xl border border-dashed border-border bg-card/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">User Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          {error?.message ||
            `The requested user with ID "${id}" does not exist or has been removed from this organization.`}
        </p>
        <Button onClick={() => navigate('/users')} className="gap-2 shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Return to User List
        </Button>
      </div>
    );
  }

  const is2FA = twoFactorLocal !== null ? twoFactorLocal : user.twoFactorEnabled ?? true;

  // Filter activity logs
  const filteredActivities = (user.activities || []).filter((act) => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="w-fit text-muted-foreground hover:text-foreground gap-2 -ml-2 rounded-lg font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to User Directory
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">User ID:</span>
          <code className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-foreground font-semibold border border-border">
            {user.id}
          </code>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-xs">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Info Left Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary/20 shadow-md">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-card ${
                  user.status === 'Active'
                    ? 'bg-emerald-500'
                    : user.status === 'Pending'
                    ? 'bg-amber-500'
                    : 'bg-destructive'
                }`}
                title={`Status: ${user.status}`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {user.name}
                </h1>
                <span title="Verified Member">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                </span>
              </div>

              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>{user.jobTitle || `${user.role} in ${user.department}`}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {user.department}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
                {is2FA && (
                  <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5">
                    <ShieldCheck className="h-3 w-3" /> 2FA Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Right Section */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="gap-2 rounded-lg font-medium shadow-xs"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>

            <Button
              variant={user.status === 'Active' ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggleStatus}
              disabled={updateUserMutation.isPending}
              className={`gap-2 rounded-lg font-medium shadow-xs ${
                user.status === 'Active'
                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-amber-500/30'
                  : ''
              }`}
            >
              {user.status === 'Active' ? (
                <>
                  <UserX className="h-3.5 w-3.5" /> Suspend
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" /> Activate
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              title="Delete Account"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Quick Info Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-border/80 text-xs">
          <div>
            <span className="text-muted-foreground block mb-0.5">Email Address</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate">{user.email}</span>
              <button
                onClick={() => handleCopy(user.email, 'Email')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy email"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Phone Number</span>
            <span className="font-semibold text-foreground">
              {user.phone || '+1 (555) 234-5678'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Location</span>
            <span className="font-semibold text-foreground truncate flex items-center gap-1">
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              {user.city && user.country ? `${user.city}, ${user.country}` : user.location || 'San Francisco, US'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Joined Date</span>
            <span className="font-semibold text-foreground">
              {formatDate(user.createdAt)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Last Active</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {user.lastActive}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Details Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md h-11 p-1 bg-muted/60 rounded-xl border border-border">
          <TabsTrigger value="overview" className="rounded-lg font-medium text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg font-medium text-xs sm:text-sm">
            Security & Access
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg font-medium text-xs sm:text-sm">
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW & PERSONAL DETAILS */}
        {/* ================================================================= */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Personal & Organizational Details + Map */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Personal Information
                  </CardTitle>
                  <CardDescription>
                    Contact details and bio for this workspace member.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1 font-medium">Bio</span>
                    <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/60">
                      {user.bio ||
                        'Experienced professional dedicated to delivering high-impact solutions with clean architecture, modern UX, and robust product engineering.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-primary" /> Email
                      </span>
                      <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary" /> Phone
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {user.phone || '+1 (555) 234-5678'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> Office Location
                      </span>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.city && user.country ? `${user.city}, ${user.country}` : user.location || 'San Francisco, CA (PST)'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" /> Timezone
                      </span>
                      <p className="text-sm font-semibold text-foreground">UTC-07:00 (Pacific Time)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization & Employment Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Organization & Role Details
                  </CardTitle>
                  <CardDescription>
                    Department hierarchy and employment metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground">Department</span>
                      <p className="text-sm font-semibold text-foreground">{user.department}</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground">Position Title</span>
                      <p className="text-sm font-semibold text-foreground">
                        {user.jobTitle || `${user.role} in ${user.department}`}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground">Employment Type</span>
                      <p className="text-sm font-semibold text-foreground">
                        {user.employmentType || 'Full-time (Salaried)'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1">
                      <span className="text-xs text-muted-foreground">Access Level</span>
                      <p className="text-sm font-semibold text-foreground">
                        {user.role} Permissions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Geographic Location & Map */}
              <UserLocationMap
                latitude={user.latitude ?? 37.7749}
                longitude={user.longitude ?? -122.4194}
                address={user.address || '525 Market Street, Suite 3200'}
                city={user.city || 'San Francisco'}
                country={user.country || 'United States'}
                userName={user.name}
                userAvatar={user.avatar}
              />
            </div>

            {/* Right 1 Col: Quick Meta & Team Badges */}
            <div className="space-y-6">
              {/* Account Health Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80">
                    <span className="text-xs font-medium text-muted-foreground">Verification</span>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Identity Verified
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80">
                    <span className="text-xs font-medium text-muted-foreground">Security Rating</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      98% • High
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80">
                    <span className="text-xs font-medium text-muted-foreground">Account Type</span>
                    <span className="text-xs font-semibold text-foreground">Enterprise Staff</span>
                  </div>
                </CardContent>
              </Card>

              {/* Assigned Project Teams */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Assigned Workspaces
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Core Admin Dashboard', role: user.role, color: 'bg-blue-500' },
                    { name: 'Customer Analytics Hub', role: 'Collaborator', color: 'bg-emerald-500' },
                    { name: 'Billing & Payments Gateway', role: user.role === 'Admin' ? 'Admin' : 'Viewer', color: 'bg-purple-500' },
                  ].map((ws, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className={`h-2.5 w-2.5 rounded-full ${ws.color} shrink-0`} />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {ws.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {ws.role}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 2: SECURITY & PERMISSIONS */}
        {/* ================================================================= */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 2FA & Authentication Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" /> Authentication Settings
                </CardTitle>
                <CardDescription>
                  Manage login security and two-factor authentication requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Two-Factor Authentication (2FA)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Require security code or hardware key on login.
                    </p>
                  </div>
                  <Switch
                    checked={is2FA}
                    onCheckedChange={handleToggle2FA}
                  />
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Password Last Changed</span>
                    <span className="text-xs font-semibold text-foreground">34 days ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Single Sign-On (SSO)</span>
                    <Badge variant="outline" className="text-xs">Google Workspace SSO</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Session Inactivity Timeout</span>
                    <span className="text-xs font-semibold text-foreground">30 Minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Permissions Matrix Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Role Permissions Matrix
                </CardTitle>
                <CardDescription>
                  Current capabilities granted by the <strong>{user.role}</strong> role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  {
                    perm: 'View & Analyze Metrics Overview',
                    granted: true,
                  },
                  {
                    perm: 'Create, Edit, & Delete Workspace Users',
                    granted: user.role === 'Admin' || user.role === 'Manager',
                  },
                  {
                    perm: 'Modify Billing & Subscription Plans',
                    granted: user.role === 'Admin',
                  },
                  {
                    perm: 'Export Audit Logs and CSV Data',
                    granted: user.role !== 'Viewer',
                  },
                  {
                    perm: 'Manage API Keys & Webhooks',
                    granted: user.role === 'Admin',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs"
                  >
                    <span className="text-foreground font-medium">{item.perm}</span>
                    {item.granted ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" /> Restricted
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Active Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" /> Active Login Sessions
              </CardTitle>
              <CardDescription>
                Devices and browsers currently authenticated with this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(user.sessions || []).map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/60 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Laptop className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {session.device}
                        </span>
                        {session.isCurrent && (
                          <Badge variant="success" className="text-[10px] px-2 py-0">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} • IP: {session.ip} ({session.location})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {session.isCurrent ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          ● Online
                        </span>
                      ) : (
                        session.lastActive
                      )}
                    </span>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success('Session revoked successfully')}
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-lg"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: ACTIVITY LOGS & AUDIT TRAIL */}
        {/* ================================================================= */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Audit Logs & Activity Timeline
                </CardTitle>
                <CardDescription>
                  Full chronological record of events performed by {user.name}.
                </CardDescription>
              </div>

              {/* Activity Category Filters */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border text-xs">
                {['all', 'auth', 'edit', 'system', 'security'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                      activityFilter === f
                        ? 'bg-background text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No activity logs matching the selected filter.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <span className="absolute -left-6 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary ring-4 ring-background" />

                      <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1 hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {act.action}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {act.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {act.description}
                        </p>
                        {act.ipAddress && (
                          <div className="pt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/80 font-mono">
                            <span>Origin IP: {act.ipAddress}</span>
                            <span>•</span>
                            <span className="capitalize">{act.type}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <UserFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        userToEdit={user}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={user}
        onSuccess={() => {
          navigate('/users');
        }}
      />
    </div>
  );
}
