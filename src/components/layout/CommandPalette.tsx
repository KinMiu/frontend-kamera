import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  LayoutDashboard,
  Users,
  FileCode2,
  Lock,
  UserPlus,
  Moon,
  Sun,
  Search,
} from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [search, setSearch] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (action: () => void) => {
    action();
    onOpenChange(false);
    setSearch('');
  };

  const navItems = [
    {
      title: 'Overview Dashboard',
      description: 'View KPIs, analytics charts, and recent activity',
      icon: LayoutDashboard,
      action: () => navigate('/'),
      category: 'Navigation',
    },
    {
      title: 'User Management (CRUD)',
      description: 'Browse, filter, add, edit, and delete users',
      icon: Users,
      action: () => navigate('/users'),
      category: 'Navigation',
    },
    {
      title: 'Form & Input Showcase',
      description: 'Explore all UI input variants with Zod validation',
      icon: FileCode2,
      action: () => navigate('/forms'),
      category: 'Navigation',
    },
    {
      title: 'Login Page',
      description: 'View the authentication login screen',
      icon: Lock,
      action: () => navigate('/login'),
      category: 'Auth',
    },
    {
      title: 'Register Page',
      description: 'View the authentication register screen',
      icon: UserPlus,
      action: () => navigate('/register'),
      category: 'Auth',
    },
    {
      title: 'Sarah Jenkins (Admin Profile)',
      description: 'View full profile, security, and activity details',
      icon: Users,
      action: () => navigate('/users/usr-1'),
      category: 'Users',
    },
    {
      title: 'Alex Rivera (Editor Profile)',
      description: 'View full profile, security, and activity details',
      icon: Users,
      action: () => navigate('/users/usr-2'),
      category: 'Users',
    },
    {
      title: 'Switch to Dark Mode',
      description: 'Set application theme to dark',
      icon: Moon,
      action: () => setTheme('dark'),
      category: 'Theme',
    },
    {
      title: 'Switch to Light Mode',
      description: 'Set application theme to light',
      icon: Sun,
      action: () => setTheme('light'),
      category: 'Theme',
    },
  ];

  const filteredItems = navItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="max-w-xl p-0 overflow-hidden border-border shadow-2xl">
        <div className="flex items-center border-b px-4 py-3 bg-muted/20">
          <Search className="mr-2.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            placeholder="Type a command, page name, or theme action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for &ldquo;{search}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item.action)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground group focus:bg-accent focus:outline-none"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press Enter to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
