import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TravelPlace, TravelStatus, Priority } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components/media/image-picker';

const placeFormSchema = z.object({
  name: z.string().min(1, 'Place name is required').max(200),
  country: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['WANT_TO_VISIT', 'PLANNING', 'VISITED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedBudget: z.coerce.number().min(0).optional().nullable(),
  targetDate: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  mediaAssetId: z.string().optional().nullable(),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

export interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PlaceFormValues) => void;
  initialData?: TravelPlace | null;
  isLoading?: boolean;
}

export function PlaceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: PlaceFormModalProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: '',
      country: '',
      state: '',
      city: '',
      description: '',
      status: 'WANT_TO_VISIT',
      priority: 'MEDIUM',
      estimatedBudget: null,
      targetDate: '',
      notes: '',
      mediaAssetId: null,
    },
  });

  const mediaAssetId = watch('mediaAssetId');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        country: initialData.country || '',
        state: initialData.state || '',
        city: initialData.city || '',
        description: initialData.description || '',
        status: initialData.status,
        priority: initialData.priority,
        estimatedBudget: initialData.estimatedBudget || null,
        targetDate: initialData.targetDate ? initialData.targetDate.split('T')[0] : '',
        notes: initialData.notes || '',
        mediaAssetId: initialData.mediaAssetId || null,
      });
    } else {
      reset({
        name: '',
        country: '',
        state: '',
        city: '',
        description: '',
        status: 'WANT_TO_VISIT',
        priority: 'MEDIUM',
        estimatedBudget: null,
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
      title={isEditing ? 'Edit Destination' : 'Add Destination to LifeShelf'}
      description="Where in the world do you want to explore?"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center sm:items-start">
            <ImagePicker
              value={mediaAssetId}
              currentAsset={initialData?.mediaAsset}
              onChange={(id: string | null) => setValue('mediaAssetId', id)}
              label="Destination Photo"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3.5">
            <Input
              label="Destination Name *"
              placeholder="e.g. Kyoto or Munnar"
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Country"
                placeholder="Japan"
                error={errors.country?.message}
                {...register('country')}
              />
              <Input
                label="State / Region"
                placeholder="Kansai"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="City"
                placeholder="Kyoto"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Status"
                error={errors.status?.message}
                {...register('status')}
                options={[
                  { label: 'Want to Visit', value: 'WANT_TO_VISIT' },
                  { label: 'Planning Trip', value: 'PLANNING' },
                  { label: 'Visited', value: 'VISITED' },
                ]}
              />

              <Select
                label="Priority"
                error={errors.priority?.message}
                {...register('priority')}
                options={[
                  { label: 'High Priority', value: 'HIGH' },
                  { label: 'Medium Priority', value: 'MEDIUM' },
                  { label: 'Low Priority', value: 'LOW' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Estimated Budget (₹ / $)"
                type="number"
                placeholder="120000"
                error={errors.estimatedBudget?.message}
                {...register('estimatedBudget')}
              />
              <Input
                label="Target Date / Month"
                type="date"
                error={errors.targetDate?.message}
                {...register('targetDate')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
          <Textarea
            label="Overview & Places to See"
            placeholder="Key spots, temples, mountains, food to try..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
          <Textarea
            label="Travel Notes & Packing"
            placeholder="Best season to visit, transit passes, tips..."
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
            {isEditing ? 'Save Changes' : 'Save Place'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
