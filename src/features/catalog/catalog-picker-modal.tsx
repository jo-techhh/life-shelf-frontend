import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import { CatalogMovie, CatalogBook } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Film, BookOpen, BookmarkPlus, Sparkles, Loader2 } from 'lucide-react';
import { AddToShelfModal } from './add-to-shelf-modal';

export interface CatalogPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'movie' | 'book';
  onAdded?: () => void;
}

export function CatalogPickerModal({
  isOpen,
  onClose,
  type,
  onAdded,
}: CatalogPickerModalProps) {
  const isMovie = type === 'movie';
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogMovie | CatalogBook | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Query catalog movies
  const { data: moviesData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['catalog', 'movies', 'picker', search],
    queryFn: () => catalogApi.listMovies({ search: search.trim() || undefined, limit: 30 }),
    enabled: isOpen && isMovie,
  });

  // Query catalog books
  const { data: booksData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['catalog', 'books', 'picker', search],
    queryFn: () => catalogApi.listBooks({ search: search.trim() || undefined, limit: 30 }),
    enabled: isOpen && !isMovie,
  });

  const isLoading = isMovie ? isLoadingMovies : isLoadingBooks;
  const items = isMovie ? moviesData?.data || [] : booksData?.data || [];

  const handleSelectItem = (item: CatalogMovie | CatalogBook) => {
    setSelectedItem(item);
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    onClose();
    onAdded?.();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={`Select from Curated ${isMovie ? 'Movies' : 'Books'}`}
        description={`Pick a popular ${isMovie ? 'movie' : 'book'} curated by admin to quickly add to your shelf with official artwork and details.`}
        size="lg"
      >
        <div className="flex flex-col gap-4 pt-1">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search curated ${isMovie ? 'movies by title, director, genre...' : 'books by title, author, genre...'}`}
              className="pl-9 h-9.5 text-xs bg-secondary/50"
            />
          </div>

          {/* Results list / grid */}
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Loading curated collection...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                {isMovie ? <Film className="w-8 h-8 opacity-40" /> : <BookOpen className="w-8 h-8 opacity-40" />}
                <p className="text-sm font-medium text-foreground">No curated items found</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {search ? `No results matching "${search}".` : 'No curated items available in the catalog yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => {
                  const poster = item.mediaAsset?.secureUrl || item.mediaAsset?.url;
                  const movie = isMovie ? (item as CatalogMovie) : null;
                  const book = !isMovie ? (item as CatalogBook) : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border/70 hover:border-primary/50 hover:bg-secondary/40 transition-all cursor-pointer group text-left"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-20 rounded-xl overflow-hidden bg-secondary shrink-0 border border-border/60">
                        {poster ? (
                          <img src={poster} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            {isMovie ? <Film className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] text-primary font-medium mb-0.5">
                          <Sparkles className="w-3 h-3" />
                          <span>Curated</span>
                        </div>
                        <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {isMovie
                            ? [movie?.releaseYear, movie?.genre, movie?.director].filter(Boolean).join(' · ')
                            : [book?.author, book?.genre, book?.totalPages ? `${book.totalPages}p` : null].filter(Boolean).join(' · ')}
                        </p>
                        {item.description && (
                          <p className="text-[10px] text-muted-foreground/80 line-clamp-1 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="shrink-0 h-8 px-2.5 text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Add to Shelf Config Modal */}
      {selectedItem && (
        <AddToShelfModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          item={selectedItem}
          type={type}
          onSuccess={handleAddSuccess}
        />
      )}
    </>
  );
}
