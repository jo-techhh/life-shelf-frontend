import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Movie, MediaAsset, MovieStatus, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RatingInput } from '@/components/ui/rating-input';
import { ImagePicker } from '@/components/media/image-picker';

const movieFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  releaseYear: z.coerce.number().int().min(1880).max(2100).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  duration: z.coerce.number().int().positive().optional().nullable(),
  director: z.string().max(100).optional().nullable(),
  cast: z.string().max(500).optional().nullable(),
  genre: z.string().max(100).optional().nullable(),
  status: z.enum(['PLANNED', 'WATCHING', 'WATCHED', 'DROPPED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  rating: z.coerce.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
});

export type MovieFormValues = z.infer<typeof movieFormSchema>;

export interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MovieFormValues) => void;
  initialData?: Movie | null;
  isLoading?: boolean;
}

export function MovieFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: MovieFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      description: '',
      releaseYear: null,
      language: '',
      duration: null,
      director: '',
      cast: '',
      genre: '',
      status: 'PLANNED',
      priority: 'MEDIUM',
      rating: null,
      notes: '',
      mediaAssetId: null,
    },
  });

  const ratingValue = watch('rating');
  const mediaAssetId = watch('mediaAssetId');

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        releaseYear: initialData.releaseYear || null,
        language: initialData.language || '',
        duration: initialData.duration || null,
        director: initialData.director || '',
        cast: initialData.cast || '',
        genre: initialData.genre || '',
        status: initialData.status,
        priority: initialData.priority,
        rating: initialData.rating || null,
        notes: initialData.notes || '',
        mediaAssetId: initialData.mediaAssetId || null,
      });
    } else {
      reset({
        title: '',
        description: '',
        releaseYear: null,
        language: '',
        duration: null,
        director: '',
        cast: '',
        genre: '',
        status: 'PLANNED',
        priority: 'MEDIUM',
        rating: null,
        notes: '',
        mediaAssetId: null,
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Movie' : 'Add Movie to LifeShelf'}
      description={
        isEditing
          ? 'Update details for this movie.'
          : 'Add a movie you want to watch or have watched.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Image Picker */}
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <ImagePicker
              value={mediaAssetId}
              currentAsset={initialData?.mediaAsset}
              onChange={(id: string | null) => setValue('mediaAssetId', id)}
            />
          </div>

          {/* Right Columns: Movie Details */}
          <div className="md:col-span-2 flex flex-col gap-3.5">
            <Input
              label="Title *"
              placeholder="e.g. Interstellar"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Release Year"
                type="number"
                placeholder="2024"
                error={errors.releaseYear?.message}
                {...register('releaseYear')}
              />
              <Input
                label="Duration (mins)"
                type="number"
                placeholder="169"
                error={errors.duration?.message}
                {...register('duration')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Genre"
                placeholder="Sci-Fi, Adventure"
                error={errors.genre?.message}
                {...register('genre')}
              />
              <Input
                label="Language"
                placeholder="English"
                error={errors.language?.message}
                {...register('language')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Status"
                error={errors.status?.message}
                {...register('status')}
                options={[
                  { label: 'Planned', value: 'PLANNED' },
                  { label: 'Watching', value: 'WATCHING' },
                  { label: 'Watched', value: 'WATCHED' },
                  { label: 'Dropped', value: 'DROPPED' },
                ]}
              />

              <Select
                label="Priority"
                error={errors.priority?.message}
                {...register('priority')}
                options={[
                  { label: 'Low', value: 'LOW' },
                  { label: 'Medium', value: 'MEDIUM' },
                  { label: 'High', value: 'HIGH' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Director"
                placeholder="Christopher Nolan"
                error={errors.director?.message}
                {...register('director')}
              />
              <Input
                label="Cast"
                placeholder="Matthew McConaughey, Anne Hathaway"
                error={errors.cast?.message}
                {...register('cast')}
              />
            </div>

            <RatingInput
              label="Rating (out of 10)"
              max={10}
              value={ratingValue ?? 0}
              onChange={(val) => setValue('rating', val)}
            />
          </div>
        </div>

        {/* Description & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <Textarea
            label="Overview / Description"
            placeholder="Plot summary or what caught your attention..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Personal Notes / Thoughts"
            placeholder="Your takeaway, favorite quote, or recommendation..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Save Movie'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
