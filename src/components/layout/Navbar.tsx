import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  Server,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { env } from '@/config/env';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { mockNotifications } from '@/lib/mock-data';
import { NotificationItem } from '@/types';
import { toast } from 'sonner';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export function Navbar({ onOpenMobileMenu, onOpenSearch }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Overview';
      case '/users':
        return 'User Management';
      case '/forms':
        return 'Form Showcase';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      default:
        return path.replace('/', '');
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'system':
        return <Server className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 glass-nav px-4 sm:px-6">
      {/* Left side: Hamburger button + Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground font-medium">
                  {env.appTitle}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {location.pathname.startsWith('/users/') && location.pathname !== '/users' ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/users" className="text-muted-foreground hover:text-foreground font-medium">
                      User Management
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    User Details
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">
                  {getBreadcrumbTitle(location.pathname)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: Global Search Bar + Theme Toggle + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search trigger button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-xl border border-input bg-background/60 hover:bg-accent/70 px-3 py-1.5 text-xs text-muted-foreground transition-all shadow-2xs hover:shadow-xs w-36 sm:w-56 justify-between group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 shrink-0 group-hover:text-primary transition-colors" />
            <span className="truncate">Search anything...</span>
          </div>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-[1.15rem] w-[1.15rem]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b p-4 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markSingleAsRead(notif.id)}
                  className={`flex items-start gap-3.5 p-3.5 text-sm transition-colors hover:bg-accent/50 cursor-pointer ${
                    !notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border shadow-2xs">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs text-foreground truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t p-2 text-center bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
                onClick={() => toast.info('All notifications are up to date')}
              >
                View notification history
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all p-0"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  KM
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    Kin Miu
                  </p>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    PRO
                  </span>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@kinmiu.dev
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.info('Profile modal placeholder')}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info('Settings modal placeholder')}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info('Pro features are active!')}
              className="cursor-pointer"
            >
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              <span>Upgrade Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                window.open('https://github.com/Ma-Vibe-Code/dashboard-template', '_blank')
              }
              className="cursor-pointer"
            >
              <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/login')}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
