import { Link } from 'react-router-dom';
import { Movie, MovieStatus } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Film, Star, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export interface MovieCardProps {
  movie: Movie;
  onStatusChange: (id: string, newStatus: MovieStatus) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
}

export function MovieCard({ movie, onStatusChange, onEdit, onDelete }: MovieCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const poster = movie.mediaAsset?.secureUrl || movie.mediaAsset?.url;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200">
      {/* Poster image container */}
      <Link to={`/watch/movies/${movie.id}`} className="relative aspect-[2/3] w-full bg-secondary/50 overflow-hidden block">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 p-4 text-center">
            <Film className="w-9 h-9 mb-2 opacity-60" />
            <span className="text-xs font-medium line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Rating overlay badge */}
        {movie.rating ? (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background/90 backdrop-blur-md text-foreground text-xs font-bold shadow-2xs border border-border/50">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        ) : null}

        {/* Status indicator top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={movie.status} />
        </div>
      </Link>

      {/* Info footer */}
      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
        <div>
          <Link
            to={`/watch/movies/${movie.id}`}
            className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 block"
          >
            {movie.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.releaseYear && movie.genre && <span>·</span>}
            {movie.genre && <span className="truncate">{movie.genre}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <PriorityBadge priority={movie.priority} />

          {/* Quick Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-40 rounded-xl border border-border bg-card p-1 shadow-xl z-30 text-xs animate-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                  Status
                </div>
                {(['PLANNED', 'WATCHING', 'WATCHED', 'DROPPED'] as MovieStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onStatusChange(movie.id, s);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                      movie.status === s ? 'font-semibold text-primary bg-primary/10' : 'hover:bg-muted text-foreground'
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
                    onEdit(movie);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(movie.id);
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
