import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies.api';
import { seriesApi } from '@/api/series.api';
import { readlistApi } from '@/api/readlist.api';
import { studylistApi } from '@/api/studylist.api';
import { travelApi } from '@/api/travel.api';
import { plansApi } from '@/api/plans.api';
import { Search, Film, Tv, BookOpen, GraduationCap, MapPin, CalendarCheck, Plus, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: (type?: string) => void;
}

export function CommandPalette({ isOpen, onClose, onOpenQuickAdd }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // Fetch search results across domains when debouncedQuery is non-empty
  const hasQuery = debouncedQuery.length > 0;

  const { data: movies } = useQuery({
    queryKey: ['search', 'movies', debouncedQuery],
    queryFn: () => moviesApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  const { data: series } = useQuery({
    queryKey: ['search', 'series', debouncedQuery],
    queryFn: () => seriesApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  const { data: reading } = useQuery({
    queryKey: ['search', 'reading', debouncedQuery],
    queryFn: () => readlistApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  const { data: study } = useQuery({
    queryKey: ['search', 'study', debouncedQuery],
    queryFn: () => studylistApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  const { data: travel } = useQuery({
    queryKey: ['search', 'travel', debouncedQuery],
    queryFn: () => travelApi.listPlaces({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  const { data: plans } = useQuery({
    queryKey: ['search', 'plans', debouncedQuery],
    queryFn: () => plansApi.list({ search: debouncedQuery, limit: 5 }),
    enabled: isOpen && hasQuery,
  });

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleAction = (type: string) => {
    onClose();
    onOpenQuickAdd(type);
  };

  const hasAnyResults =
    (movies?.data?.length ?? 0) > 0 ||
    (series?.data?.length ?? 0) > 0 ||
    (reading?.data?.length ?? 0) > 0 ||
    (study?.data?.length ?? 0) > 0 ||
    (travel?.data?.length ?? 0) > 0 ||
    (plans?.data?.length ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div onClick={onClose} className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" />

      <div className="relative z-50 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search LifeShelf or jump to..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground bg-secondary rounded border border-border/80">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 flex flex-col gap-4 text-xs">
          {/* If there's an active query */}
          {hasQuery ? (
            hasAnyResults ? (
              <div className="flex flex-col gap-4">
                {/* Movies */}
                {movies?.data && movies.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Movies
                    </div>
                    {movies.data.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleNavigate(`/watch/movies/${m.id}`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{m.title}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {m.releaseYear || m.genre || 'Movie'} <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Series */}
                {series?.data && series.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5" /> Series
                    </div>
                    {series.data.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleNavigate(`/watch/series/${s.id}`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{s.title}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {s.seasons?.length ? `${s.seasons.length} Seasons` : 'Series'}{' '}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Reading */}
                {reading?.data && reading.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Reading
                    </div>
                    {reading.data.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleNavigate(`/read`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{r.title}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {r.author || r.type} <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Study */}
                {study?.data && study.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Study
                    </div>
                    {study.data.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleNavigate(`/study`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{st.title}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {st.progress}% completed <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Travel */}
                {travel?.data && travel.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Travel
                    </div>
                    {travel.data.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleNavigate(`/travel`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{t.name}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {t.country || 'Destination'} <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Plans */}
                {plans?.data && plans.data.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5" /> Plans
                    </div>
                    {plans.data.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate(`/plans`)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-left transition-colors group cursor-pointer"
                      >
                        <span className="font-medium text-foreground">{p.title}</span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {p.type} <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items found for &quot;{debouncedQuery}&quot;.
              </div>
            )
          ) : (
            /* Quick actions & Navigation when query is empty */
            <div className="flex flex-col gap-4">
              <div>
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {[
                    { label: 'Add Movie', icon: Film, type: 'MOVIE' },
                    { label: 'Add Series', icon: Tv, type: 'SERIES' },
                    { label: 'Add to Readlist', icon: BookOpen, type: 'READING' },
                    { label: 'Add Study Topic', icon: GraduationCap, type: 'STUDY' },
                    { label: 'Add Travel Place', icon: MapPin, type: 'TRAVEL' },
                    { label: 'Add Plan', icon: CalendarCheck, type: 'PLAN' },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => handleAction(action.type)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/70 text-foreground transition-colors text-left cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Go To Section
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  {[
                    { path: '/dashboard', label: 'Dashboard' },
                    { path: '/watch/movies', label: 'Movies' },
                    { path: '/watch/series', label: 'Series' },
                    { path: '/read', label: 'Readlist' },
                    { path: '/study', label: 'Studylist' },
                    { path: '/travel', label: 'Travel & Trips' },
                    { path: '/plans', label: 'Plans' },
                    { path: '/media', label: 'Media Library' },
                    { path: '/settings', label: 'Settings' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 text-foreground transition-colors cursor-pointer text-left"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
