import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { plansApi } from '@/api/plans.api';
import { Plan, PlanStatus, PlanType } from '@/types';
import { PlanFormModal, PlanFormValues } from './plan-form-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { PriorityBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Calendar,
  Film,
  Tv,
  BookOpen,
  GraduationCap,
  Compass,
  FileText,
  Trash2,
  Edit2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewTab, setViewTab] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('add') === 'true');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['plans', typeFilter, search],
    queryFn: () =>
      plansApi.list({
        type: typeFilter !== 'ALL' ? (typeFilter as PlanType) : undefined,
        search: search.trim() || undefined,
        limit: 100,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: PlanFormValues) =>
      plansApi.create({
        ...values,
        scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Plan scheduled');
      setIsFormOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<PlanFormValues> }) =>
      plansApi.update(id, {
        ...values,
        scheduledDate: values.scheduledDate ? new Date(values.scheduledDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsFormOpen(false);
      setEditingPlan(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Toggle complete mutation
  const toggleComplete = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      plansApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Plan removed');
      setDeletePlanId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Filter plans based on viewTab
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredPlans = (data?.data || []).filter((plan) => {
    const isCompleted = plan.status === 'COMPLETED';
    const planDateStr = plan.scheduledDate ? plan.scheduledDate.split('T')[0] : null;

    if (viewTab === 'COMPLETED') {
      return isCompleted;
    }
    if (viewTab === 'TODAY') {
      return !isCompleted && planDateStr === todayStr;
    }
    if (viewTab === 'UPCOMING') {
      return !isCompleted && (!planDateStr || planDateStr >= todayStr);
    }
    // ALL
    return true;
  });

  const getTypeIcon = (type: PlanType) => {
    switch (type) {
      case 'MOVIE':
        return <Film className="w-4 h-4 text-amber-500" />;
      case 'SERIES_EPISODE':
        return <Tv className="w-4 h-4 text-rose-500" />;
      case 'READING':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'STUDY':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'TRAVEL':
        return <Compass className="w-4 h-4 text-emerald-500" />;
      default:
        return <CalendarCheck className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        icon={<CalendarCheck className="w-5 h-5" />}
        title="Plans & To-Do"
        description="Personal to-do list connecting items on your shelf with your day-to-day schedule."
        action={
          <Button
            onClick={() => {
              setEditingPlan(null);
              setIsFormOpen(true);
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </Button>
        }
      />

      {/* Tabs & Filter Bar */}
      <FilterBar
        tabs={
          <Tabs
            activeTab={viewTab}
            onChange={setViewTab}
            tabs={[
              { id: 'TODAY', label: 'Today' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'ALL', label: 'All Plans' },
              { id: 'COMPLETED', label: 'Completed' },
            ]}
          />
        }
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="pl-9 h-9.5 text-xs bg-card"
            />
          </div>
        }
        filters={
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9.5 text-xs w-44 bg-card"
            options={[
              { label: 'All Shelf Types', value: 'ALL' },
              { label: 'Movie', value: 'MOVIE' },
              { label: 'Series', value: 'SERIES_EPISODE' },
              { label: 'Reading', value: 'READING' },
              { label: 'Study & Tech', value: 'STUDY' },
              { label: 'Travel', value: 'TRAVEL' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />
        }
      />

      {/* Plans List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-18 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load plans"
          message="Could not connect to the server."
          onRetry={() => refetch()}
        />
      ) : filteredPlans.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filteredPlans.map((plan) => {
            const isCompleted = plan.status === 'COMPLETED';

            return (
              <div
                key={plan.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-muted/30 border-border/40 text-muted-foreground'
                    : 'bg-card border-border/70 hover:border-primary/40 text-foreground shadow-xs'
                }`}
              >
                {/* Left check and content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() =>
                      toggleComplete.mutate({
                        id: plan.id,
                        status: isCompleted ? 'PLANNED' : 'COMPLETED',
                      })
                    }
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-primary" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary text-[11px] font-semibold text-muted-foreground">
                        {getTypeIcon(plan.type)}
                        <span className="capitalize">{plan.type.toLowerCase().replace('_', ' ')}</span>
                      </div>
                      <PriorityBadge priority={plan.priority} />
                      {plan.scheduledDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(plan.scheduledDate)}
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-semibold text-sm mt-1.5 ${
                        isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {plan.title}
                    </h3>

                    {plan.notes && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5 bg-secondary/30 p-2 rounded-xl">
                        <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{plan.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsFormOpen(true);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Edit plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletePlanId(plan.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarCheck className="w-6 h-6" />}
          title={
            viewTab === 'TODAY'
              ? 'No plans for today'
              : viewTab === 'COMPLETED'
              ? 'No completed plans yet'
              : 'No plans found'
          }
          description="Schedule things you want to watch, read, study, or explore on your personal calendar."
          actionLabel="Add Plan"
          onAction={() => {
            setEditingPlan(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Plan Form Modal */}
      <PlanFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlan(null);
          setSearchParams({});
        }}
        onSubmit={(values) => {
          if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        initialData={editingPlan}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={() => deletePlanId && deleteMutation.mutate(deletePlanId)}
        title="Delete Plan?"
        description="This scheduled plan will be removed."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
