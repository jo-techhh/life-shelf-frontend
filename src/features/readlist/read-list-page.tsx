import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { readlistApi } from '@/api/readlist.api';
import { ReadingItem, ReadingStatus, ReadingType, Priority } from '@/types';
import { ReadFormModal, ReadingFormValues } from './read-form-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CardSkeletonGrid } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/app/toast-context';
import { BookOpen, Plus, Search, Star, Minus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export function ReadListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('add') === 'true');
  const [editingItem, setEditingItem] = useState<ReadingItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['readlist', page, statusFilter, typeFilter, search],
    queryFn: () =>
      readlistApi.list({
        page,
        limit: 18,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as ReadingStatus) : undefined,
        type: typeFilter !== 'ALL' ? (typeFilter as ReadingType) : undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (values: ReadingFormValues) => readlistApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readlist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Added to readlist');
      setIsFormOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ReadingFormValues> }) =>
      readlistApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readlist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => readlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readlist'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Item deleted');
      setDeleteItemId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Quick page step update (+ / - 5 or 10 pages)
  const handlePageStep = (item: ReadingItem, delta: number) => {
    if (!item.totalPages) {
      // Step percentage
      const nextPct = Math.min(100, Math.max(0, (item.progress || 0) + delta));
      const nextStatus = nextPct === 100 ? 'COMPLETED' : nextPct > 0 ? 'READING' : item.status;
      updateMutation.mutate({
        id: item.id,
        values: { progress: nextPct, status: nextStatus },
      });
      return;
    }

    const current = item.currentPage || 0;
    const nextVal = Math.min(item.totalPages, Math.max(0, current + delta));
    const nextPct = Math.round((nextVal / item.totalPages) * 100);
    const nextStatus = nextVal >= item.totalPages ? 'COMPLETED' : nextVal > 0 ? 'READING' : item.status;

    updateMutation.mutate({
      id: item.id,
      values: {
        currentPage: nextVal,
        progress: nextPct,
        status: nextStatus,
      },
    });
  };

  const handleFormSubmit = (values: ReadingFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-primary" />
            Readlist
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Books, articles, research papers, and technical documentation with page & percentage tracking.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          size="sm"
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add to Readlist
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-card/60 border border-border/60 p-4 rounded-2xl shadow-sm">
        <Tabs
          activeTab={statusFilter}
          onChange={(tab) => {
            setStatusFilter(tab);
            setPage(1);
          }}
          tabs={[
            { id: 'ALL', label: 'All' },
            { id: 'PLANNED', label: 'Planned' },
            { id: 'READING', label: 'Reading' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'DROPPED', label: 'Dropped' },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, author..."
              className="pl-9 h-10 text-xs"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 text-xs w-36"
            options={[
              { label: 'All Formats', value: 'ALL' },
              { label: 'Book', value: 'BOOK' },
              { label: 'Article', value: 'ARTICLE' },
              { label: 'Paper', value: 'PAPER' },
              { label: 'Blog', value: 'BLOG' },
              { label: 'Documentation', value: 'DOCUMENTATION' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />
        </div>
      </div>

      {/* Reading Grid */}
      {isLoading ? (
        <CardSkeletonGrid count={12} aspect="poster" />
      ) : isError ? (
        <ErrorState
          title="Failed to load readlist"
          message="Could not reach the server."
          onRetry={() => refetch()}
        />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.data.map((item) => {
              const cover = item.mediaAsset?.secureUrl || item.mediaAsset?.url;
              const hasPages = item.totalPages && item.totalPages > 0;

              return (
                <div
                  key={item.id}
                  className="group flex flex-col rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                >
                  {/* Card Cover & Header */}
                  <div className="relative aspect-[3/2] sm:aspect-[4/3] w-full bg-muted/40 overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 p-4">
                        <BookOpen className="w-10 h-10 mb-1" />
                        <span className="text-[11px] font-bold uppercase">{item.type}</span>
                      </div>
                    )}

                    <div className="absolute top-2.5 right-2.5">
                      <StatusBadge status={item.status} />
                    </div>

                    {item.rating ? (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background/90 backdrop-blur-md text-foreground text-xs font-bold shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Body & Progress Controls */}
                  <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        <span>{item.type}</span>
                        {item.priority && (
                          <>
                            <span>·</span>
                            <PriorityBadge priority={item.priority} />
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground mt-1 line-clamp-1">
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          by {item.author}
                        </p>
                      )}
                    </div>

                    {/* Interactive Progress Bar & Quick Steppers */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {hasPages ? (
                          <span className="font-semibold text-foreground">
                            Page {item.currentPage || 0} / {item.totalPages}
                          </span>
                        ) : (
                          <span className="font-semibold text-foreground">Progress</span>
                        )}
                        <span className="font-bold text-primary">{item.progress}%</span>
                      </div>

                      <ProgressBar
                        value={item.progress}
                        size="sm"
                        variant={item.progress === 100 ? 'success' : 'primary'}
                      />

                      {/* Direct [-] and [+] step controls */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handlePageStep(item, hasPages ? -5 : -10)}
                            className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
                            title={hasPages ? '-5 pages' : '-10%'}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePageStep(item, hasPages ? 5 : 10)}
                            className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
                            title={hasPages ? '+5 pages' : '+10%'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteItemId(item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border/60 text-xs text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="Nothing to read yet"
          description={
            search || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No reading items match your current filters.'
              : 'Add a book, article, paper, or documentation you want to read.'
          }
          actionLabel="Add to Readlist"
          onAction={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Form Modal */}
      <ReadFormModal
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

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteItemId}
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => deleteItemId && deleteMutation.mutate(deleteItemId)}
        title="Delete Reading Item?"
        description="This book or article will be removed from your LifeShelf."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
