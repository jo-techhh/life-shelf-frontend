import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';
import { useTheme } from '@/app/theme-provider';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Laptop,
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
} from 'lucide-react';

export interface TopBarProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
}

export function TopBar({ onOpenSearch, onOpenQuickAdd }: TopBarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center border border-border/60 bg-card shrink-0">
            <img src="/logo.png" alt="LifeShelf" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-foreground leading-none">
              LifeShelf
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide hidden sm:inline-block mt-0.5">
              Watch · Read · Learn · Explore
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Search Trigger (Ctrl + K) */}
      <div className="flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-muted-foreground bg-secondary/70 hover:bg-secondary border border-border/60 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="truncate">Search LifeShelf...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-card rounded border border-border/80">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Actions (Quick Add, Theme, Notifications, User) */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button */}
        <Button
          onClick={onOpenQuickAdd}
          size="sm"
          className="gap-1.5 shadow-sm rounded-xl px-3"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>

        {/* Theme Selector Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="rounded-xl w-9 h-9 text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in zoom-in-95 text-xs z-50">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  theme === 'light' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  theme === 'dark' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  setThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  theme === 'system' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> System
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell (Visual) */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl w-9 h-9 text-muted-foreground hover:text-foreground relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted/70 transition-colors cursor-pointer"
            aria-label="Open user menu"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                className="w-8 h-8 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs flex items-center justify-center">
                {getInitials(user?.displayName || user?.username)}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-in zoom-in-95 text-xs z-50">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="font-semibold text-foreground text-sm truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-muted-foreground text-[11px] truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings & Storage</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
