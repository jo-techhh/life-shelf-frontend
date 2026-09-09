import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Series, SeriesStatus } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Tv, Star, MoreVertical, Trash2, Edit2, Play } from 'lucide-react';

export interface SeriesCardProps {
  series: Series;
  onStatusChange: (id: string, status: SeriesStatus) => void;
  onEdit: (series: Series) => void;
  onDelete: (id: string) => void;
}

export function SeriesCard({ series, onStatusChange, onEdit, onDelete }: SeriesCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const poster = series.mediaAsset?.secureUrl || series.mediaAsset?.url;
  const progressPct = series.progress?.percentage ?? 0;
  const totalEps = series.progress?.totalEpisodes ?? 0;
  const watchedEps = series.progress?.watchedEpisodes ?? 0;
  const seasonsCount = series.seasons?.length ?? 0;
  const nextEp = series.progress?.nextUnwatchedEpisode;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200">
      {/* Poster */}
      <Link to={`/watch/series/${series.id}`} className="relative aspect-[16/9] sm:aspect-[2/3] w-full bg-muted/40 overflow-hidden block">
        {poster ? (
          <img
            src={poster}
            alt={series.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 p-4 text-center">
            <Tv className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium line-clamp-2">{series.title}</span>
          </div>
        )}

        {/* Rating overlay badge */}
        {series.rating ? (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background/90 backdrop-blur-md text-foreground text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{series.rating.toFixed(1)}</span>
          </div>
        ) : null}

        {/* Status top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={series.status} />
        </div>
      </Link>

      {/* Info & Progress Body */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between">
        <div>
          <Link
            to={`/watch/series/${series.id}`}
            className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
          >
            {series.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{seasonsCount} {seasonsCount === 1 ? 'Season' : 'Seasons'}</span>
            {totalEps > 0 && (
              <>
                <span>·</span>
                <span>{totalEps} Episodes</span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        {totalEps > 0 && (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>{watchedEps} / {totalEps} watched</span>
              <span>{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} size="sm" variant={progressPct === 100 ? 'success' : 'primary'} />
          </div>
        )}

        {/* Currently / Next unwatched */}
        {nextEp ? (
          <div className="rounded-xl bg-secondary/30 p-2 text-xs flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-muted-foreground block font-medium">Next:</span>
              <span className="font-semibold text-foreground truncate block">
                S{nextEp.seasonNumber} · E{nextEp.episodeNumber}
              </span>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/watch/series/${series.id}`)}
              className="h-7 text-xs px-2.5 gap-1 shrink-0"
            >
              <Play className="w-3 h-3 fill-current" />
              Watch
            </Button>
          </div>
        ) : null}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <PriorityBadge priority={series.priority} />

          {/* Quick Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-40 rounded-xl border border-border bg-card p-1 shadow-xl z-30 text-xs animate-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                  Status
                </div>
                {(['PLANNED', 'WATCHING', 'WATCHED', 'DROPPED'] as SeriesStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onStatusChange(series.id, s);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-md capitalize transition-colors ${
                      series.status === s ? 'font-semibold text-primary bg-primary/10' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {s.toLowerCase()}
                  </button>
                ))}

                <div className="my-1 border-t border-border/60" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(series);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(series.id);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
