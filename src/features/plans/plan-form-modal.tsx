import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plan, PlanStatus, PlanType, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const planFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['MOVIE', 'SERIES_EPISODE', 'READING', 'STUDY', 'TRAVEL', 'OTHER']),
  scheduledDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(5000).optional().nullable(),
});

export type PlanFormValues = z.infer<typeof planFormSchema>;

export interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PlanFormValues) => void;
  initialData?: Plan | null;
  isLoading?: boolean;
}

export function PlanFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: PlanFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'OTHER',
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      status: 'PLANNED',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || '',
        type: initialData.type,
        scheduledDate: initialData.scheduledDate ? initialData.scheduledDate.split('T')[0] : '',
        priority: initialData.priority,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        type: 'OTHER',
        scheduledDate: new Date().toISOString().split('T')[0],
        priority: 'MEDIUM',
        status: 'PLANNED',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Plan' : 'Add to LifeShelf Plans'}
      description="Schedule things you want to watch, read, study, or experience."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="What do you want to do? *"
          placeholder="e.g. Read Clean Code Chapter 4 or Watch Interstellar"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category / Shelf Type"
            error={errors.type?.message}
            {...register('type')}
            options={[
              { label: 'General / Other', value: 'OTHER' },
              { label: 'Movie', value: 'MOVIE' },
              { label: 'Series / Episode', value: 'SERIES_EPISODE' },
              { label: 'Reading', value: 'READING' },
              { label: 'Study & Learning', value: 'STUDY' },
              { label: 'Travel Place', value: 'TRAVEL' },
            ]}
          />

          <Input
            label="Scheduled Date"
            type="date"
            error={errors.scheduledDate?.message}
            {...register('scheduledDate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            error={errors.priority?.message}
            {...register('priority')}
            options={[
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
              { label: 'Low', value: 'LOW' },
            ]}
          />

          <Select
            label="Status"
            error={errors.status?.message}
            {...register('status')}
            options={[
              { label: 'Planned', value: 'PLANNED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>

        <Textarea
          label="Notes / Instructions"
          placeholder="Specific chapter numbers, timestamps, or reminders..."
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Save Plan'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
