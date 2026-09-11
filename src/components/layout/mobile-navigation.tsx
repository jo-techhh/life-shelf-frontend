import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  BookOpen,
  Plus,
  Menu,
  X,
  Compass,
  CalendarCheck,
  FolderArchive,
  Settings,
  Tv,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileNavigationProps {
  onOpenQuickAdd?: () => void;
}

export function MobileNavigation({ onOpenQuickAdd }: MobileNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/92 backdrop-blur-lg border-t border-border/70 flex items-center justify-around h-14 px-2 select-none safe-area-pb">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 w-12 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/watch/movies"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 w-12 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Film className="w-4.5 h-4.5" />
          <span>Watch</span>
        </NavLink>

        {/* Prominent Center Add Button */}
        {onOpenQuickAdd && (
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center w-10 h-10 -mt-2.5 rounded-2xl bg-primary text-primary-foreground shadow-md hover:bg-[hsl(var(--primary-hover))] active:scale-95 transition-all cursor-pointer"
            aria-label="Add to LifeShelf"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}

        <NavLink
          to="/read"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5 w-12 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Read</span>
        </NavLink>

        {/* More Drawer Trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 w-12 py-1 text-[10px] font-medium transition-colors cursor-pointer',
            drawerOpen ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Menu className="w-4.5 h-4.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
          />

          <div className="relative z-50 bg-card rounded-t-3xl border-t border-border p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-border/60">
                  <img src="/logo.png" alt="LifeShelf" className="w-full h-full object-cover" />
                </div>
                <span className="font-semibold text-sm text-foreground">More LifeShelf</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/watch/series"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <Tv className="w-4 h-4 text-primary" />
                <span>TV Series</span>
              </NavLink>

              <NavLink
                to="/study"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Studylist</span>
              </NavLink>

              <NavLink
                to="/travel"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Travel & Trips</span>
              </NavLink>

              <NavLink
                to="/plans"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span>Plans</span>
              </NavLink>

              <NavLink
                to="/media"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <FolderArchive className="w-4 h-4 text-primary" />
                <span>Media Library</span>
              </NavLink>

              <NavLink
                to="/settings"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground"
              >
                <Settings className="w-4 h-4 text-primary" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
