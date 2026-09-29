import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/api/catalog.api';
import {
  CatalogMovie,
  CatalogBook,
  ReadingType,
  MediaAsset,
} from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/app/toast-context';
import {
  UploadCloud,
  Film,
  BookOpen,
  Sparkles,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

export interface CatalogManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'movie' | 'book';
  initialData?: CatalogMovie | CatalogBook | null;
  onSuccess?: () => void;
}

export function CatalogManageModal({
  isOpen,
  onClose,
  type,
  initialData,
  onSuccess,
}: CatalogManageModalProps) {
  const isEditing = !!initialData;
  const isMovie = type === 'movie';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(null);
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);

  // Movie specific fields
  const [releaseYear, setReleaseYear] = useState<number | ''>('');
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');

  // Book specific fields
  const [author, setAuthor] = useState('');
  const [bookType, setBookType] = useState<ReadingType>('BOOK');
  const [totalPages, setTotalPages] = useState<number | ''>('');

  // Upload state
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setGenre(initialData.genre || '');
      setMediaAssetId(initialData.mediaAssetId || null);
      setPreviewPosterUrl(
        initialData.mediaAsset?.secureUrl || initialData.mediaAsset?.url || null
      );

      if (isMovie) {
        const m = initialData as CatalogMovie;
        setReleaseYear(m.releaseYear || '');
        setLanguage(m.language || '');
        setDuration(m.duration || '');
        setDirector(m.director || '');
        setCast(m.cast || '');
      } else {
        const b = initialData as CatalogBook;
        setAuthor(b.author || '');
        setBookType(b.type || 'BOOK');
        setTotalPages(b.totalPages || '');
      }
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setGenre('');
      setMediaAssetId(null);
      setPreviewPosterUrl(null);
      setReleaseYear('');
      setLanguage('');
      setDuration('');
      setDirector('');
      setCast('');
      setAuthor('');
      setBookType('BOOK');
      setTotalPages('');
    }
  }, [initialData, isMovie, isOpen]);

  // Mutations
  const createMovieMutation = useMutation({
    mutationFn: () =>
      catalogApi.createMovie({
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        releaseYear: typeof releaseYear === 'number' ? releaseYear : undefined,
        language: language.trim() || undefined,
        duration: typeof duration === 'number' ? duration : undefined,
        director: director.trim() || undefined,
        cast: cast.trim() || undefined,
        mediaAssetId: mediaAssetId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'movies'] });
      toast.success(`Curated movie "${data.title}" added to catalog`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMovieMutation = useMutation({
    mutationFn: () =>
      catalogApi.updateMovie(initialData!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        releaseYear: typeof releaseYear === 'number' ? releaseYear : undefined,
        language: language.trim() || undefined,
        duration: typeof duration === 'number' ? duration : undefined,
        director: director.trim() || undefined,
        cast: cast.trim() || undefined,
        mediaAssetId: mediaAssetId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'movies'] });
      toast.success(`Curated movie "${data.title}" updated`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createBookMutation = useMutation({
    mutationFn: () =>
      catalogApi.createBook({
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        author: author.trim() || undefined,
        type: bookType,
        totalPages: typeof totalPages === 'number' ? totalPages : undefined,
        mediaAssetId: mediaAssetId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'books'] });
      toast.success(`Curated book "${data.title}" added to catalog`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateBookMutation = useMutation({
    mutationFn: () =>
      catalogApi.updateBook(initialData!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        genre: genre.trim() || undefined,
        author: author.trim() || undefined,
        type: bookType,
        totalPages: typeof totalPages === 'number' ? totalPages : undefined,
        mediaAssetId: mediaAssetId || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog', 'books'] });
      toast.success(`Curated book "${data.title}" updated`);
      onClose();
      onSuccess?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WEBP formats are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image size must not exceed 5MB');
      return;
    }

    try {
      setIsUploadingCover(true);
      const asset = await catalogApi.uploadCover(file);
      setMediaAssetId(asset.id);
      setPreviewPosterUrl(asset.secureUrl || asset.url);
      toast.success('Curated catalog cover uploaded');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to upload cover');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const isSaving =
    createMovieMutation.isPending ||
    updateMovieMutation.isPending ||
    createBookMutation.isPending ||
    updateBookMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (isMovie) {
      if (isEditing) {
        updateMovieMutation.mutate();
      } else {
        createMovieMutation.mutate();
      }
    } else {
      if (isEditing) {
        updateBookMutation.mutate();
      } else {
        createBookMutation.mutate();
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Curated ${isMovie ? 'Movie' : 'Book'}` : `Add New Curated ${isMovie ? 'Movie' : 'Book'}`}
      description="Curated items are published to the public catalog so users can easily add them to their shelves."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-1 overflow-y-auto max-h-[75vh] pr-1">
        {/* Top: Cover Upload + Essential Info */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Cover upload area */}
          <div className="sm:w-44 flex flex-col items-center">
            <label className="text-xs font-medium text-foreground mb-1.5 self-start">
              Cover Poster
            </label>
            <div className="relative aspect-[2/3] w-36 sm:w-full rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-secondary/30 flex flex-col items-center justify-center overflow-hidden transition-colors group">
              {previewPosterUrl ? (
                <>
                  <img
                    src={previewPosterUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-white">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] h-7"
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setMediaAssetId(null);
                        setPreviewPosterUrl(null);
                      }}
                      className="text-[11px] h-7"
                    >
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer"
                >
                  {isUploadingCover ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-muted-foreground/60 mb-2 group-hover:text-primary transition-colors" />
                  )}
                  <span className="text-[11px] font-medium text-foreground">
                    {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
                  </span>
                  <span className="text-[9px] text-muted-foreground mt-0.5">JPG, PNG, WEBP</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Core Info */}
          <div className="flex-1 flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isMovie ? 'e.g., Inception, Interstellar...' : 'e.g., Atomic Habits, Dune...'}
                className="h-9.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Genre</label>
                <Input
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g., Sci-Fi, Drama, Non-Fiction"
                  className="h-9.5 text-xs"
                />
              </div>

              {isMovie ? (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Release Year</label>
                  <Input
                    type="number"
                    min={1888}
                    max={2040}
                    value={releaseYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReleaseYear(val === '' ? '' : parseInt(val, 10));
                    }}
                    placeholder="e.g., 2024"
                    className="h-9.5 text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Type</label>
                  <Select
                    value={bookType}
                    onChange={(e) => setBookType(e.target.value as ReadingType)}
                    options={[
                      { label: 'Book', value: 'BOOK' },
                      { label: 'Article', value: 'ARTICLE' },
                      { label: 'Research Paper', value: 'PAPER' },
                      { label: 'Blog', value: 'BLOG' },
                      { label: 'Documentation', value: 'DOCUMENTATION' },
                      { label: 'Other', value: 'OTHER' },
                    ]}
                  />
                </div>
              )}
            </div>

            {isMovie ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Director</label>
                  <Input
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="e.g., Christopher Nolan"
                    className="h-9.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Language</label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., English, Japanese"
                    className="h-9.5 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Author</label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., James Clear, Frank Herbert"
                    className="h-9.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Total Pages</label>
                  <Input
                    type="number"
                    min={1}
                    value={totalPages}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalPages(val === '' ? '' : parseInt(val, 10));
                    }}
                    placeholder="e.g., 320"
                    className="h-9.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Movie Extra: Duration & Cast */}
        {isMovie && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Duration (minutes)</label>
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => {
                  const val = e.target.value;
                  setDuration(val === '' ? '' : parseInt(val, 10));
                }}
                placeholder="e.g., 148"
                className="h-9.5 text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">Cast</label>
              <Input
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="e.g., Leonardo DiCaprio, Joseph Gordon-Levitt"
                className="h-9.5 text-xs"
              />
            </div>
          </div>
        )}

        {/* Description / Synopsis */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Synopsis / Overview</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief overview or synopsis for this title..."
            rows={3}
            className="text-xs"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSaving || isUploadingCover} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Publish to Catalog'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
