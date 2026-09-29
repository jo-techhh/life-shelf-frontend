import { CatalogMovie, CatalogBook } from '@/types';
import { Button } from '@/components/ui/button';
import { Film, BookOpen, BookmarkPlus, Edit2, Trash2, Calendar, Clock, User, Sparkles } from 'lucide-react';

export interface CatalogItemCardProps {
  item: CatalogMovie | CatalogBook;
  type: 'movie' | 'book';
  isAdmin?: boolean;
  onAddToShelf: (item: CatalogMovie | CatalogBook, type: 'movie' | 'book') => void;
  onEdit?: (item: CatalogMovie | CatalogBook, type: 'movie' | 'book') => void;
  onDelete?: (item: CatalogMovie | CatalogBook, type: 'movie' | 'book') => void;
}

export function CatalogItemCard({
  item,
  type,
  isAdmin = false,
  onAddToShelf,
  onEdit,
  onDelete,
}: CatalogItemCardProps) {
  const isMovie = type === 'movie';
  const poster = item.mediaAsset?.secureUrl || item.mediaAsset?.url;

  const movie = isMovie ? (item as CatalogMovie) : null;
  const book = !isMovie ? (item as CatalogBook) : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200">
      {/* Poster area */}
      <div className="relative aspect-[2/3] w-full bg-secondary/50 overflow-hidden select-none">
        {poster ? (
          <img
            src={poster}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 p-4 text-center">
            {isMovie ? <Film className="w-10 h-10 mb-2 opacity-50" /> : <BookOpen className="w-10 h-10 mb-2 opacity-50" />}
            <span className="text-xs font-medium line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background/90 backdrop-blur-md text-[10px] font-semibold text-primary border border-border/50 shadow-2xs">
            <Sparkles className="w-3 h-3 text-primary" />
            Curated
          </span>
          {item.genre && (
            <span className="px-2 py-0.5 rounded-lg bg-background/85 backdrop-blur-md text-[10px] font-medium text-foreground/80 border border-border/40 truncate max-w-[100px]">
              {item.genre}
            </span>
          )}
        </div>

        {/* Admin Quick Action Menu floating on top right if admin */}
        {isAdmin && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-md p-1 rounded-xl border border-border/60 shadow-sm">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item, type);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Edit curated item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item, type);
                }}
                className="p-1 rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete curated item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Hover overlay with Add To Shelf button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <Button
            onClick={() => onAddToShelf(item, type)}
            size="sm"
            className="w-full gap-1.5 shadow-md text-xs font-semibold rounded-xl"
          >
            <BookmarkPlus className="w-4 h-4" />
            Add to My Shelf
          </Button>
        </div>
      </div>

      {/* Item metadata footer */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={item.title}>
          {item.title}
        </h3>

        {/* Sub-info */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
          {isMovie && movie?.releaseYear && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {movie.releaseYear}
            </span>
          )}
          {isMovie && movie?.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration}m
            </span>
          )}
          {!isMovie && book?.author && (
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{book.author}</span>
            </span>
          )}
          {!isMovie && book?.totalPages && (
            <span>{book.totalPages}p</span>
          )}
        </div>

        {item.description && (
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mt-0.5 leading-snug">
            {item.description}
          </p>
        )}

        {/* Always visible Add button on mobile / smaller viewports */}
        <div className="mt-auto pt-2 block sm:hidden">
          <Button
            onClick={() => onAddToShelf(item, type)}
            size="sm"
            variant="secondary"
            className="w-full gap-1.5 text-xs rounded-xl"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            Add to Shelf
          </Button>
        </div>
      </div>
    </div>
  );
}
