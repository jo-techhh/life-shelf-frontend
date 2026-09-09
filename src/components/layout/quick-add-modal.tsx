import { Dialog } from '@/components/ui/dialog';
import { Film, Tv, BookOpen, GraduationCap, MapPin, CalendarCheck, ChevronRight } from 'lucide-react';

export interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'MOVIE' | 'SERIES' | 'READING' | 'STUDY' | 'TRAVEL' | 'PLAN') => void;
}

export function QuickAddModal({ isOpen, onClose, onSelectType }: QuickAddModalProps) {
  const options = [
    {
      type: 'MOVIE' as const,
      label: 'Movie',
      description: 'Add a movie to your watchlist, track rating and notes',
      icon: Film,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      type: 'SERIES' as const,
      label: 'Series / Show',
      description: 'Track TV series, seasons, episodes, and progress',
      icon: Tv,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      type: 'READING' as const,
      label: 'Reading Item',
      description: 'Add a book, article, research paper, or documentation',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      type: 'STUDY' as const,
      label: 'Study Topic / Skill',
      description: 'Courses, technologies, certifications, and resources',
      icon: GraduationCap,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      type: 'TRAVEL' as const,
      label: 'Travel Place',
      description: 'Places to visit, target budget, and trip itineraries',
      icon: MapPin,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      type: 'PLAN' as const,
      label: 'Scheduled Plan',
      description: 'Set things you want to do today or upcoming',
      icon: CalendarCheck,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add to LifeShelf" description="What would you like to put on your shelf?" size="md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => {
                onClose();
                onSelectType(opt.type);
              }}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${opt.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {opt.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
