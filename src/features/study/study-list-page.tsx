import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { studylistApi, CreateStudyResourceDto } from '@/api/studylist.api';
import { StudyItem, StudyStatus, StudyType, Priority } from '@/types';
import { StudyFormModal, StudyFormValues } from './study-form-modal';
import { StudyResourceModal } from './study-resource-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  GraduationCap,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Link as LinkIcon,
  Minus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function StudyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('add') === 'true');
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Resource modal state
  const [resourceTargetStudy, setResourceTargetStudy] = useState<StudyItem | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['studylist', page, statusFilter, typeFilter, search],
    queryFn: () =>
      studylistApi.list({
        page,
        limit: 18,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as StudyStatus) : undefined,
        type: typeFilter !== 'ALL' ? (typeFilter as StudyType) : undefined,
      }),
  });

  // Create study item mutation
  const createMutation = useMutation({
    mutationFn: (values: StudyFormValues) =>
      studylistApi.create({
        ...values,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studylist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Study topic added');
      setIsFormOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update study item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<StudyFormValues> }) =>
      studylistApi.update(id, {
        ...values,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studylist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studylistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studylist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Topic removed');
      setDeleteItemId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: ({ studyId, data }: { studyId: string; data: CreateStudyResourceDto }) =>
      studylistApi.addResource(studyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studylist'] });
      toast.success('Resource linked');
      setResourceTargetStudy(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => studylistApi.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studylist'] });
      toast.success('Resource removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Quick progress step (+10% / -10%)
  const handleProgressStep = (item: StudyItem, delta: number) => {
    const nextPct = Math.min(100, Math.max(0, item.progress + delta));
    const nextStatus = nextPct === 100 ? 'COMPLETED' : nextPct > 0 ? 'LEARNING' : item.status;
    updateMutation.mutate({
      id: item.id,
      values: { progress: nextPct, status: nextStatus },
    });
  };

  const handleFormSubmit = (values: StudyFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        icon={<GraduationCap className="w-5 h-5" />}
        title="Studylist"
        description="Technologies, courses, skills, and certifications with attached learning resources."
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Study Topic
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        tabs={
          <Tabs
            activeTab={statusFilter}
            onChange={(tab) => {
              setStatusFilter(tab);
              setPage(1);
            }}
            tabs={[
              { id: 'ALL', label: 'All' },
              { id: 'PLANNED', label: 'Planned' },
              { id: 'LEARNING', label: 'Learning' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'DROPPED', label: 'Dropped' },
            ]}
          />
        }
        search={
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by topic, skill, course..."
              className="pl-9 h-9.5 text-xs bg-card"
            />
          </div>
        }
        filters={
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-9.5 text-xs w-40 bg-card"
            options={[
              { label: 'All Types', value: 'ALL' },
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
        }
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load study list"
          message="Could not reach the server."
          onRetry={() => refetch()}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.data.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all gap-4"
            >
              {/* Header */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                      {item.type}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <h3 className="font-bold text-base text-foreground font-display mt-1">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.targetDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {formatDate(item.targetDate)}</span>
                  </div>
                )}
              </div>

              {/* Progress Stepper & Bar */}
              <div className="flex flex-col gap-2 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className="text-primary font-bold">{item.progress}%</span>
                </div>
                <ProgressBar
                  value={item.progress}
                  size="sm"
                  variant={item.progress === 100 ? 'success' : 'primary'}
                />

                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => handleProgressStep(item, -10)}
                    className="p-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                    title="-10%"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProgressStep(item, 10)}
                    className="p-1 rounded-lg bg-card border border-border/60 hover:bg-muted text-foreground transition-colors cursor-pointer"
                    title="+10%"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Learning Resources */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Resources ({item.resources?.length || 0})
                  </span>
                  <button
                    type="button"
                    onClick={() => setResourceTargetStudy(item)}
                    className="text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {item.resources && item.resources.length > 0 ? (
                    item.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/40 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <LinkIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          {res.url ? (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-primary transition-colors truncate flex items-center gap-1"
                            >
                              <span className="truncate">{res.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="font-medium text-foreground truncate">{res.title}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteResourceMutation.mutate(res.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          title="Remove resource"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      No resources attached yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setIsFormOpen(true);
                  }}
                  className="gap-1.5 text-xs h-8"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteItemId(item.id)}
                  className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<GraduationCap className="w-6 h-6" />}
          title="No study topics yet"
          description={
            search || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No topics match your current filters.'
              : 'Add courses, technologies, skills, or topics you want to learn.'
          }
          actionLabel="Add Study Topic"
          onAction={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      <StudyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setSearchParams({});
        }}
        onSubmit={handleFormSubmit}
        initialData={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Attach Resource Modal */}
      <StudyResourceModal
        isOpen={!!resourceTargetStudy}
        onClose={() => setResourceTargetStudy(null)}
        studyTitle={resourceTargetStudy?.title}
        onSubmit={(resourceData) => {
          if (resourceTargetStudy) {
            addResourceMutation.mutate({
              studyId: resourceTargetStudy.id,
              data: resourceData,
            });
          }
        }}
        isLoading={addResourceMutation.isPending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => deleteItemId && deleteMutation.mutate(deleteItemId)}
        title="Delete Study Topic?"
        description="This learning topic and its attached resources will be removed."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
