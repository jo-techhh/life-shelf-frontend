import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import {
  CatalogMovie,
  CatalogBook,
  MovieStatus,
  ReadingStatus,
  Priority,
} from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RatingInput } from '@/components/ui/rating-input';
import { useToast } from '@/app/toast-context';
import { BookmarkPlus, Film, BookOpen, Star, Sparkles, Loader2 } from 'lucide-react';

export interface AddToShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogMovie | CatalogBook | null;
  type: 'movie' | 'book';
  onSuccess?: () => void;
}

export function AddToShelfModal({
  isOpen,
  onClose,
  item,
  type,
  onSuccess,
}: AddToShelfModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [movieStatus, setMovieStatus] = useState<MovieStatus>('PLANNED');
  const [bookStatus, setBookStatus] = useState<ReadingStatus>('PLANNED');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [currentPage, setCurrentPage] = useState<number | ''>('');

  const addMovieMutation = useMutation({
    mutationFn: (movieId: string) =>
      catalogApi.addMovieToShelf(movieId, {
        status: movieStatus,
        priority,
        rating: rating !== null ? rating : undefined,
        notes: notes.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`"${data.title}" added to your Movie shelf!`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add movie to shelf');
    },
  });

  const addBookMutation = useMutation({
    mutationFn: (bookId: string) =>
      catalogApi.addBookToShelf(bookId, {
        status: bookStatus,
        priority,
        rating: rating !== null ? rating : undefined,
        notes: notes.trim() || undefined,
        currentPage: typeof currentPage === 'number' ? currentPage : undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reading'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`"${data.title}" added to your Readlist!`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add book to shelf');
    },
  });

  if (!item) return null;

  const isMovie = type === 'movie';
  const poster = item.mediaAsset?.secureUrl || item.mediaAsset?.url;
  const isSubmitting = addMovieMutation.isPending || addBookMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMovie) {
      addMovieMutation.mutate(item.id);
    } else {
      addBookMutation.mutate(item.id);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Add to Personal Shelf`}
      description={`Add "${item.title}" from curated catalog to your collection`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
        {/* Item preview card */}
        <div className="flex gap-4 p-3 rounded-2xl border border-border/70 bg-secondary/40 items-center">
          <div className="w-16 h-22 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/60">
            {poster ? (
              <img src={poster} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                {isMovie ? <Film className="w-6 h-6 opacity-40" /> : <BookOpen className="w-6 h-6 opacity-40" />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated {isMovie ? 'Movie' : 'Book'}</span>
            </div>
            <h4 className="font-semibold text-foreground text-sm truncate">{item.title}</h4>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {isMovie
                ? [(item as CatalogMovie).releaseYear, (item as CatalogMovie).genre, (item as CatalogMovie).director]
                    .filter(Boolean)
                    .join(' · ')
                : [(item as CatalogBook).author, (item as CatalogBook).genre, (item as CatalogBook).totalPages ? `${(item as CatalogBook).totalPages} pages` : null]
                    .filter(Boolean)
                    .join(' · ')}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Initial Status</label>
            {isMovie ? (
              <Select
                value={movieStatus}
                onChange={(e) => setMovieStatus(e.target.value as MovieStatus)}
                options={[
                  { label: 'Want to Watch (Planned)', value: 'PLANNED' },
                  { label: 'Currently Watching', value: 'WATCHING' },
                  { label: 'Already Watched', value: 'WATCHED' },
                  { label: 'Dropped', value: 'DROPPED' },
                ]}
              />
            ) : (
              <Select
                value={bookStatus}
                onChange={(e) => setBookStatus(e.target.value as ReadingStatus)}
                options={[
                  { label: 'Want to Read (Planned)', value: 'PLANNED' },
                  { label: 'Currently Reading', value: 'READING' },
                  { label: 'Finished (Completed)', value: 'COMPLETED' },
                  { label: 'Dropped', value: 'DROPPED' },
                ]}
              />
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Priority</label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              options={[
                { label: 'High Priority', value: 'HIGH' },
                { label: 'Medium Priority', value: 'MEDIUM' },
                { label: 'Low Priority', value: 'LOW' },
              ]}
            />
          </div>
        </div>

        {/* Current page (for books) */}
        {!isMovie && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Current Page {(item as CatalogBook).totalPages ? `(out of ${(item as CatalogBook).totalPages})` : ''}
            </label>
            <Input
              type="number"
              min={0}
              max={(item as CatalogBook).totalPages || undefined}
              placeholder="0"
              value={currentPage}
              onChange={(e) => {
                const val = e.target.value;
                setCurrentPage(val === '' ? '' : parseInt(val, 10));
              }}
              className="h-9.5 text-xs"
            />
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Your Rating (Optional)</label>
          <RatingInput
            value={rating}
            onChange={(val) => setRating(val)}
            max={10}
            size="md"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Personal Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any personal thoughts, reminders, or why you want to watch/read this..."
            rows={2}
            className="text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                Add to My Shelf
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
