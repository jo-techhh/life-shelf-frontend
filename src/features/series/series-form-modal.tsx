import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Series, SeriesStatus, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RatingInput } from '@/components/ui/rating-input';
import { ImagePicker } from '@/components/media/image-picker';

const seriesFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  releaseYear: z.coerce.number().int().min(1880).max(2100).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  genre: z.string().max(100).optional().nullable(),
  status: z.enum(['PLANNED', 'WATCHING', 'WATCHED', 'DROPPED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  rating: z.coerce.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
  initialSeasonsCount: z.coerce.number().int().min(0).max(50).optional(),
  initialEpisodesPerSeason: z.coerce.number().int().min(1).max(100).optional(),
});

export type SeriesFormValues = z.infer<typeof seriesFormSchema>;

export interface SeriesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SeriesFormValues) => void;
  initialData?: Series | null;
  isLoading?: boolean;
}

export function SeriesFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: SeriesFormModalProps) {
  const isEditing = !!initialData;
  const [initSeasons, setInitSeasons] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesFormSchema),
    defaultValues: {
      title: '',
      description: '',
      releaseYear: null,
      language: '',
      genre: '',
      status: 'PLANNED',
      priority: 'MEDIUM',
      rating: null,
      notes: '',
      mediaAssetId: null,
      initialSeasonsCount: 1,
      initialEpisodesPerSeason: 10,
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
        genre: initialData.genre || '',
        status: initialData.status,
        priority: initialData.priority,
        rating: initialData.rating || null,
        notes: initialData.notes || '',
        mediaAssetId: initialData.mediaAssetId || null,
      });
      setInitSeasons(false);
    } else {
      reset({
        title: '',
        description: '',
        releaseYear: null,
        language: '',
        genre: '',
        status: 'PLANNED',
        priority: 'MEDIUM',
        rating: null,
        notes: '',
        mediaAssetId: null,
        initialSeasonsCount: 1,
        initialEpisodesPerSeason: 10,
      });
      setInitSeasons(true);
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit TV Series' : 'Add Series to LifeShelf'}
      description={
        isEditing
          ? 'Update show details.'
          : 'Track a television series, seasons, episodes, and watch progress.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Poster */}
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <ImagePicker
              value={mediaAssetId}
              currentAsset={initialData?.mediaAsset}
              onChange={(id: string | null) => setValue('mediaAssetId', id)}
            />
          </div>

          {/* Right: Fields */}
          <div className="md:col-span-2 flex flex-col gap-3.5">
            <Input
              label="Series Title *"
              placeholder="e.g. Breaking Bad"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Release Year"
                type="number"
                placeholder="2008"
                error={errors.releaseYear?.message}
                {...register('releaseYear')}
              />
              <Input
                label="Language"
                placeholder="English"
                error={errors.language?.message}
                {...register('language')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Genre"
                placeholder="Drama, Crime, Thriller"
                error={errors.genre?.message}
                {...register('genre')}
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

            <RatingInput
              label="Rating (out of 10)"
              max={10}
              value={ratingValue ?? 0}
              onChange={(val) => setValue('rating', val)}
            />
          </div>
        </div>

        {/* Quick Seasons Init for new series */}
        {!isEditing && (
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Pre-create Seasons & Episodes</h4>
                <p className="text-[11px] text-muted-foreground">
                  Quickly set up seasons structure (can be edited anytime)
                </p>
              </div>
              <input
                type="checkbox"
                checked={initSeasons}
                onChange={(e) => setInitSeasons(e.target.checked)}
                className="rounded accent-primary w-4 h-4 cursor-pointer"
              />
            </div>

            {initSeasons && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50 animate-in fade-in">
                <Input
                  label="Number of Seasons"
                  type="number"
                  min={1}
                  max={25}
                  {...register('initialSeasonsCount')}
                />
                <Input
                  label="Episodes per Season"
                  type="number"
                  min={1}
                  max={50}
                  {...register('initialEpisodesPerSeason')}
                />
              </div>
            )}
          </div>
        )}

        {/* Description & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <Textarea
            label="Description / Plot"
            placeholder="Series premise or why you want to watch it..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Personal Notes"
            placeholder="Your thoughts, season opinions, etc..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Save Series'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
