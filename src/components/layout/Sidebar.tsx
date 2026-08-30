import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  AlertCircle,
  FileCode2,
  Lock,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  ChevronDown,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { env } from '@/config/env';
import { authApi } from '@/features/auth/api/auth-api';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  className,
  isMobile = false,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(authApi.getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authApi.getStoredUser());
    };
    window.addEventListener('auth_state_change', handleAuthChange);
    return () => window.removeEventListener('auth_state_change', handleAuthChange);
  }, []);

  const handleNavClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          path: '/',
          icon: LayoutDashboard,
          badge: 'Live',
        },
      ],
    },
    {
      title: 'Kamera & Tracking',
      items: [
        {
          name: 'Manajemen Kamera',
          path: '/cameras',
          icon: Camera,
          badge: '8',
        },
        {
          name: 'GitHub Issues',
          path: '/issues',
          icon: AlertCircle,
          badge: 'Active',
        },
        {
          name: 'Form Showcase',
          path: '/forms',
          icon: FileCode2,
          badge: 'Demo',
        },
      ],
    },
  ];

  const authItems = [
    {
      name: 'Login Screen',
      path: '/login',
      icon: Lock,
    },
    {
      name: 'Register Screen',
      path: '/register',
      icon: UserPlus,
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "relative flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out select-none z-30",
          collapsed && !isMobile ? "w-[76px]" : "w-64",
          className
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "relative flex h-16 items-center border-b border-border/80 transition-all duration-300",
            collapsed && !isMobile ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          <div
            className={cn(
              "flex items-center overflow-hidden transition-all duration-300",
              collapsed && !isMobile ? "justify-center" : "gap-3"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Video className="h-5 w-5" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-foreground truncate">
                  <span>Kamera Way Kambas</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>v{env.appVersion} • Surveillance</span>
                </div>
              </div>
            )}
          </div>

          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleCollapse}
              className="absolute -right-3.5 top-4.5 z-40 h-7 w-7 rounded-full border border-border bg-background shadow-xs hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {(!collapsed || isMobile) && (
                <div className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase mb-2">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                  const navLinkContent = (
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        collapsed && !isMobile && "justify-center px-0 h-10 w-10 mx-auto"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );

                  if (collapsed && !isMobile) {
                    return (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-medium text-xs">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.path}>{navLinkContent}</React.Fragment>;
                })}
              </div>
            </div>
          ))}

          {/* Authentication section with collapsible trigger */}
          <div className="space-y-1 pt-2 border-t border-border/60">
            {(!collapsed || isMobile) ? (
              <div>
                <button
                  type="button"
                  onClick={() => setAuthMenuOpen(!authMenuOpen)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase hover:text-foreground transition-colors"
                >
                  <span>Authentication</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      authMenuOpen && "rotate-180"
                    )}
                  />
                </button>
                {authMenuOpen && (
                  <div className="mt-1 space-y-1 pl-1">
                    {authItems.map((authItem) => {
                      const Icon = authItem.icon;
                      return (
                        <NavLink
                          key={authItem.path}
                          to={authItem.path}
                          onClick={handleNavClick}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{authItem.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {authItems.map((authItem) => {
                  const Icon = authItem.icon;
                  return (
                    <Tooltip key={authItem.path}>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={authItem.path}
                          onClick={handleNavClick}
                          className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium text-xs">
                        {authItem.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer User Profile Card */}
        <div className="p-3 border-t border-border/80 bg-muted/20">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/60",
              collapsed && !isMobile && "justify-center p-0"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 border border-primary/20">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {currentUser?.name
                  ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'US'}
              </AvatarFallback>
            </Avatar>

            {(!collapsed || isMobile) && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-foreground truncate">
                  {currentUser?.name || 'Pengguna'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentUser?.email || 'admin@destroyer.local'}
                </p>
              </div>
            )}

            {(!collapsed || isMobile) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await authApi.logout();
                  navigate('/login');
                }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
