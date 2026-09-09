import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReadingItem, ReadingStatus, ReadingType, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RatingInput } from '@/components/ui/rating-input';
import { ImagePicker } from '@/components/media/image-picker';

const readingFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['BOOK', 'ARTICLE', 'PAPER', 'BLOG', 'DOCUMENTATION', 'OTHER']),
  status: z.enum(['PLANNED', 'READING', 'COMPLETED', 'DROPPED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  totalPages: z.coerce.number().int().positive().optional().nullable(),
  currentPage: z.coerce.number().int().min(0).optional().nullable(),
  progress: z.coerce.number().int().min(0).max(100).optional().default(0),
  rating: z.coerce.number().min(0).max(10).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
});

export type ReadingFormValues = z.infer<typeof readingFormSchema>;

export interface ReadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ReadingFormValues) => void;
  initialData?: ReadingItem | null;
  isLoading?: boolean;
}

export function ReadFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ReadFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReadingFormValues>({
    resolver: zodResolver(readingFormSchema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
      type: 'BOOK',
      status: 'PLANNED',
      priority: 'MEDIUM',
      totalPages: null,
      currentPage: 0,
      progress: 0,
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
        author: initialData.author || '',
        description: initialData.description || '',
        type: initialData.type,
        status: initialData.status,
        priority: initialData.priority,
        totalPages: initialData.totalPages || null,
        currentPage: initialData.currentPage || 0,
        progress: initialData.progress || 0,
        rating: initialData.rating || null,
        notes: initialData.notes || '',
        mediaAssetId: initialData.mediaAssetId || null,
      });
    } else {
      reset({
        title: '',
        author: '',
        description: '',
        type: 'BOOK',
        status: 'PLANNED',
        priority: 'MEDIUM',
        totalPages: null,
        currentPage: 0,
        progress: 0,
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
      title={isEditing ? 'Edit Reading Item' : 'Add to Readlist'}
      description="Add a book, article, research paper, or documentation to your reading list."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <ImagePicker
              value={mediaAssetId}
              currentAsset={initialData?.mediaAsset}
              onChange={(id: string | null) => setValue('mediaAssetId', id)}
              label="Book / Article Cover"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3.5">
            <Input
              label="Title *"
              placeholder="e.g. Clean Code"
              error={errors.title?.message}
              {...register('title')}
            />

            <Input
              label="Author"
              placeholder="Robert C. Martin"
              error={errors.author?.message}
              {...register('author')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Format / Type"
                error={errors.type?.message}
                {...register('type')}
                options={[
                  { label: 'Book', value: 'BOOK' },
                  { label: 'Article', value: 'ARTICLE' },
                  { label: 'Paper', value: 'PAPER' },
                  { label: 'Blog', value: 'BLOG' },
                  { label: 'Documentation', value: 'DOCUMENTATION' },
                  { label: 'Other', value: 'OTHER' },
                ]}
              />

              <Select
                label="Status"
                error={errors.status?.message}
                {...register('status')}
                options={[
                  { label: 'Planned', value: 'PLANNED' },
                  { label: 'Reading', value: 'READING' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Dropped', value: 'DROPPED' },
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Current Page"
                type="number"
                min={0}
                placeholder="0"
                error={errors.currentPage?.message}
                {...register('currentPage')}
              />
              <Input
                label="Total Pages"
                type="number"
                min={1}
                placeholder="464"
                error={errors.totalPages?.message}
                {...register('totalPages')}
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

            <RatingInput
              label="Rating (out of 10)"
              max={10}
              value={ratingValue ?? 0}
              onChange={(val) => setValue('rating', val)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <Textarea
            label="Description / Summary"
            placeholder="What is this piece about? Key takeaways..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Personal Notes"
            placeholder="Quotes, key learnings, or annotations..."
            rows={3}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Save to Readlist'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
