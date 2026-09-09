import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StudyItem, StudyStatus, StudyType, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components/media/image-picker';

const studyFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['COURSE', 'TECHNOLOGY', 'SKILL', 'TOPIC', 'CERTIFICATION', 'BOOK', 'TUTORIAL', 'OTHER']),
  status: z.enum(['PLANNED', 'LEARNING', 'COMPLETED', 'DROPPED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  progress: z.coerce.number().int().min(0).max(100).optional().default(0),
  targetDate: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
});

export type StudyFormValues = z.infer<typeof studyFormSchema>;

export interface StudyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: StudyFormValues) => void;
  initialData?: StudyItem | null;
  isLoading?: boolean;
}

export function StudyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: StudyFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudyFormValues>({
    resolver: zodResolver(studyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'TECHNOLOGY',
      status: 'PLANNED',
      priority: 'MEDIUM',
      progress: 0,
      targetDate: '',
      notes: '',
      mediaAssetId: null,
    },
  });

  const mediaAssetId = watch('mediaAssetId');

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        type: initialData.type,
        status: initialData.status,
        priority: initialData.priority,
        progress: initialData.progress || 0,
        targetDate: initialData.targetDate ? initialData.targetDate.split('T')[0] : '',
        notes: initialData.notes || '',
        mediaAssetId: initialData.mediaAssetId || null,
      });
    } else {
      reset({
        title: '',
        description: '',
        type: 'TECHNOLOGY',
        status: 'PLANNED',
        priority: 'MEDIUM',
        progress: 0,
        targetDate: '',
        notes: '',
        mediaAssetId: null,
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Study Topic' : 'Add Study Topic'}
      description="Track technologies, courses, skills, certifications, and learning materials."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <ImagePicker
              value={mediaAssetId}
              currentAsset={initialData?.mediaAsset}
              onChange={(id: string | null) => setValue('mediaAssetId', id)}
              label="Topic Icon / Cover"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3.5">
            <Input
              label="Topic / Skill / Course Name *"
              placeholder="e.g. FastAPI or Distributed Systems"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type"
                error={errors.type?.message}
                {...register('type')}
                options={[
                  { label: 'Technology', value: 'TECHNOLOGY' },
                  { label: 'Course', value: 'COURSE' },
                  { label: 'Skill', value: 'SKILL' },
                  { label: 'Topic', value: 'TOPIC' },
                  { label: 'Certification', value: 'CERTIFICATION' },
                  { label: 'Tutorial', value: 'TUTORIAL' },
                  { label: 'Book', value: 'BOOK' },
                  { label: 'Other', value: 'OTHER' },
                ]}
              />

              <Select
                label="Status"
                error={errors.status?.message}
                {...register('status')}
                options={[
                  { label: 'Planned', value: 'PLANNED' },
                  { label: 'Learning', value: 'LEARNING' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'Dropped', value: 'DROPPED' },
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Progress % (0-100)"
                type="number"
                min={0}
                max={100}
                error={errors.progress?.message}
                {...register('progress')}
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

              <Input
                label="Target Date"
                type="date"
                error={errors.targetDate?.message}
                {...register('targetDate')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <Textarea
            label="Overview & Learning Goals"
            placeholder="What will you learn? Why is this valuable?"
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Study Notes / Synthesis"
            placeholder="Key concepts, architecture notes, commands..."
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
            {isEditing ? 'Save Changes' : 'Save Topic'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
