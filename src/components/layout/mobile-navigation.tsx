import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  BookOpen,
  GraduationCap,
  Menu,
  X,
  Compass,
  CalendarCheck,
  FolderArchive,
  Settings,
  Tv,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNavigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/watch/movies', label: 'Watch', icon: Film },
    { to: '/read', label: 'Read', icon: BookOpen },
    { to: '/study', label: 'Study', icon: GraduationCap },
  ];

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border flex items-center justify-around h-14 px-2 select-none safe-area-pb">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1 w-14 py-1 text-[10px] font-medium transition-colors cursor-pointer',
            drawerOpen ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Menu className="w-5 h-5" />
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

          <div className="relative z-50 bg-card rounded-t-3xl border-t border-border p-5 shadow-2xl animate-in slide-in-from-bottom flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="font-semibold text-sm text-foreground">More LifeShelf</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
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
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 hover:bg-muted text-xs font-medium text-foreground col-span-2"
              >
                <Settings className="w-4 h-4 text-primary" />
                <span>Account & Storage Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
