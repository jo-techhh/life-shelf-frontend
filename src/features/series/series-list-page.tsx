import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { seriesApi, CreateSeriesDto } from '@/api/series.api';
import { Series, SeriesStatus, Priority } from '@/types';
import { SeriesCard } from './series-card';
import { SeriesFormModal, SeriesFormValues } from './series-form-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageHeader } from '@/components/common/page-header';
import { FilterBar } from '@/components/common/filter-bar';
import { CardSkeletonGrid } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/app/toast-context';
import { Tv, Plus, Search, Share2 } from 'lucide-react';
import { ShareWatchListModal } from '../movies/share-watchlist-modal';

export function SeriesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'rating' | 'releaseYear'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('add') === 'true');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query series
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['series', page, statusFilter, priorityFilter, search, sortBy, sortOrder],
    queryFn: () =>
      seriesApi.list({
        page,
        limit: 18,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as SeriesStatus) : undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as Priority) : undefined,
        sortBy,
        sortOrder,
      }),
  });

  // Create series mutation
  const createMutation = useMutation({
    mutationFn: (values: SeriesFormValues) => {
      // If initialSeasonsCount is specified, generate initial seasons array
      const seasonsData =
        values.initialSeasonsCount && values.initialSeasonsCount > 0
          ? Array.from({ length: values.initialSeasonsCount }).map((_, sIdx) => ({
              seasonNumber: sIdx + 1,
              title: `Season ${sIdx + 1}`,
              episodes: Array.from({ length: values.initialEpisodesPerSeason || 10 }).map((_, eIdx) => ({
                episodeNumber: eIdx + 1,
                title: `Episode ${eIdx + 1}`,
              })),
            }))
          : undefined;

      const payload: CreateSeriesDto = {
        title: values.title,
        description: values.description,
        releaseYear: values.releaseYear,
        language: values.language,
        genre: values.genre,
        rating: values.rating,
        status: values.status,
        priority: values.priority,
        notes: values.notes,
        mediaAssetId: values.mediaAssetId,
        seasons: seasonsData,
      };

      return seriesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Series added to shelf');
      setIsFormOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update series mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<SeriesFormValues> }) =>
      seriesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Series updated');
      setIsFormOpen(false);
      setEditingSeries(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => seriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Series deleted');
      setDeleteSeriesId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleStatusChange = (id: string, newStatus: SeriesStatus) => {
    updateMutation.mutate({ id, values: { status: newStatus } });
  };

  const handleEdit = (series: Series) => {
    setEditingSeries(series);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: SeriesFormValues) => {
    if (editingSeries) {
      updateMutation.mutate({ id: editingSeries.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <PageHeader
        icon={<Tv className="w-5 h-5" />}
        title="TV Series"
        description="Track seasons, episodes, watch progress, and take episode notes."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Watched
            </Button>
            <Button
              onClick={() => {
                setEditingSeries(null);
                setIsFormOpen(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Series
            </Button>
          </div>
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
              { id: 'WATCHING', label: 'Watching' },
              { id: 'WATCHED', label: 'Watched' },
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
              placeholder="Search series by title, genre..."
              className="pl-9 h-9.5 text-xs bg-card"
            />
          </div>
        }
        filters={
          <>
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="h-9.5 text-xs w-32 bg-card"
              options={[
                { label: 'All Priorities', value: 'ALL' },
                { label: 'High Priority', value: 'HIGH' },
                { label: 'Medium Priority', value: 'MEDIUM' },
                { label: 'Low Priority', value: 'LOW' },
              ]}
            />

            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(by);
                setSortOrder(order);
                setPage(1);
              }}
              className="h-9.5 text-xs w-36 bg-card"
              options={[
                { label: 'Newest Added', value: 'createdAt-desc' },
                { label: 'Title (A-Z)', value: 'title-asc' },
                { label: 'Highest Rated', value: 'rating-desc' },
                { label: 'Release Year', value: 'releaseYear-desc' },
              ]}
            />
          </>
        }
      />

      {/* Main Grid View */}
      {isLoading ? (
        <CardSkeletonGrid count={12} aspect="poster" />
      ) : isError ? (
        <ErrorState
          title="Failed to load TV series"
          message="Could not reach the server. Please verify your connection."
          onRetry={() => refetch()}
        />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.data.map((item) => (
              <SeriesCard
                key={item.id}
                series={item}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteSeriesId(id)}
              />
            ))}
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
          icon={<Tv className="w-6 h-6" />}
          title="No series yet"
          description={
            search || statusFilter !== 'ALL'
              ? 'No series match your current search or filters.'
              : 'Add your favorite TV series to track seasons, episodes, and personal watch notes.'
          }
          actionLabel="Add Series"
          onAction={() => {
            setEditingSeries(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Add / Edit Modal */}
      <SeriesFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSeries(null);
          setSearchParams({});
        }}
        onSubmit={handleFormSubmit}
        initialData={editingSeries}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteSeriesId}
        onClose={() => setDeleteSeriesId(null)}
        onConfirm={() => deleteSeriesId && deleteMutation.mutate(deleteSeriesId)}
        title="Delete Series?"
        description="This series and all its seasons and episodes will be removed from your LifeShelf."
        confirmLabel="Delete Series"
        isLoading={deleteMutation.isPending}
      />

      {/* Share Watched List Modal */}
      <ShareWatchListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
