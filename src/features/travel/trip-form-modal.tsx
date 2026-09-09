import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trip, TripStatus } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const tripFormSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(['PLANNING', 'BOOKED', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(5000).optional().nullable(),
});

export type TripFormValues = z.infer<typeof tripFormSchema>;

export interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TripFormValues) => void;
  initialData?: Trip | null;
  isLoading?: boolean;
}

export function TripFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: TripFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: null,
      status: 'PLANNING',
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        budget: initialData.budget || null,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: null,
        status: 'PLANNING',
        notes: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Trip Itinerary' : 'Create New Trip'}
      description="Plan multi-destination trips and track budgets and dates."
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Trip Name *"
          placeholder="e.g. Japan Autumn Adventure 2027"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Total Budget (₹ / $)"
            type="number"
            placeholder="120000"
            error={errors.budget?.message}
            {...register('budget')}
          />
          <Select
            label="Status"
            error={errors.status?.message}
            {...register('status')}
            options={[
              { label: 'Planning', value: 'PLANNING' },
              { label: 'Booked', value: 'BOOKED' },
              { label: 'Ongoing', value: 'ONGOING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>

        <Textarea
          label="Trip Overview"
          placeholder="Route highlights, key sights..."
          rows={2}
          error={errors.description?.message}
          {...register('description')}
        />

        <Textarea
          label="Notes & Flights"
          placeholder="Hotel bookings, flight numbers, packing lists..."
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Trip'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
