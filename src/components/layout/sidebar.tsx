import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Tv,
  BookOpen,
  GraduationCap,
  Compass,
  CalendarCheck,
  FolderArchive,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon: Icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group select-none',
          isActive
            ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
        )
      }
    >
      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border/70 bg-card/50 dark:bg-card/30 p-4 shrink-0 select-none min-h-[calc(100vh-4rem)]">
      {/* Navigation Group 1: General */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Personal Shelf
        </div>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
      </div>

      {/* Navigation Group 2: Media & Entertainment */}
      <div className="flex flex-col gap-1 mt-5">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Watch
        </div>
        <NavItem to="/watch/movies" icon={Film} label="Movies" />
        <NavItem to="/watch/series" icon={Tv} label="Series & TV" />
      </div>

      {/* Navigation Group 3: Knowledge & Growth */}
      <div className="flex flex-col gap-1 mt-5">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Grow
        </div>
        <NavItem to="/read" icon={BookOpen} label="Readlist" />
        <NavItem to="/study" icon={GraduationCap} label="Studylist" />
      </div>

      {/* Navigation Group 4: Life & Experiences */}
      <div className="flex flex-col gap-1 mt-5">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Experience
        </div>
        <NavItem to="/travel" icon={Compass} label="Travel & Trips" />
        <NavItem to="/plans" icon={CalendarCheck} label="Plans & To-Do" />
      </div>

      {/* Navigation Group 5: Library & Setup */}
      <div className="flex flex-col gap-1 mt-5">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Manage
        </div>
        <NavItem to="/media" icon={FolderArchive} label="Media Library" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>

      {/* Bottom Promo / Personal Space Quote */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl border border-border/80 bg-gradient-to-br from-primary/8 via-accent/30 to-card flex flex-col gap-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Space</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your personal shelf for everything you want to watch, read, learn, visit, and experience.
          </p>
        </div>
      </div>
    </aside>
  );
}
