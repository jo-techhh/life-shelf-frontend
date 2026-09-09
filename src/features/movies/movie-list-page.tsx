import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { moviesApi } from '@/api/movies.api';
import { Movie, MovieStatus, Priority } from '@/types';
import { MovieCard } from './movie-card';
import { MovieFormModal, MovieFormValues } from './movie-form-modal';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardSkeletonGrid } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useToast } from '@/app/toast-context';
import { Film, Plus, Search } from 'lucide-react';

export function MovieListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'rating' | 'releaseYear'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  // Form modal & delete states
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('add') === 'true');
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deleteMovieId, setDeleteMovieId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query movies
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['movies', page, statusFilter, priorityFilter, search, sortBy, sortOrder],
    queryFn: () =>
      moviesApi.list({
        page,
        limit: 18,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as MovieStatus) : undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as Priority) : undefined,
        sortBy,
        sortOrder,
      }),
  });

  // Create movie mutation
  const createMutation = useMutation({
    mutationFn: (values: MovieFormValues) => moviesApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Movie added to shelf');
      setIsFormOpen(false);
      setSearchParams({});
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update movie mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<MovieFormValues> }) =>
      moviesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Movie updated');
      setIsFormOpen(false);
      setEditingMovie(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete movie mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => moviesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Movie deleted');
      setDeleteMovieId(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleStatusChange = (id: string, newStatus: MovieStatus) => {
    updateMutation.mutate({ id, values: { status: newStatus } });
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: MovieFormValues) => {
    if (editingMovie) {
      updateMutation.mutate({ id: editingMovie.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
            <Film className="w-7 h-7 text-primary" />
            Movies
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Collect, organize, rate, and track films you want to watch or have seen.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingMovie(null);
            setIsFormOpen(true);
          }}
          size="sm"
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Movie
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-card/60 border border-border/60 p-4 rounded-2xl shadow-sm">
        {/* Status Tabs */}
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

        {/* Search & Sort row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search movies by title, director, cast..."
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 text-xs w-32"
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
              className="h-10 text-xs w-36"
              options={[
                { label: 'Newest Added', value: 'createdAt-desc' },
                { label: 'Title (A-Z)', value: 'title-asc' },
                { label: 'Highest Rated', value: 'rating-desc' },
                { label: 'Release Year', value: 'releaseYear-desc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <CardSkeletonGrid count={12} aspect="poster" />
      ) : isError ? (
        <ErrorState
          title="Failed to load movies"
          message="Could not reach the server. Please verify your connection."
          onRetry={() => refetch()}
        />
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.data.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteMovieId(id)}
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
          icon={<Film className="w-6 h-6" />}
          title="No movies yet"
          description={
            search || statusFilter !== 'ALL'
              ? 'No movies match your current search or filters.'
              : 'Your shelf is waiting for its first movie. Add something you want to watch or recently loved!'
          }
          actionLabel="Add Movie"
          onAction={() => {
            setEditingMovie(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Add / Edit Modal */}
      <MovieFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMovie(null);
          setSearchParams({});
        }}
        onSubmit={handleFormSubmit}
        initialData={editingMovie}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteMovieId}
        onClose={() => setDeleteMovieId(null)}
        onConfirm={() => deleteMovieId && deleteMutation.mutate(deleteMovieId)}
        title="Delete Movie?"
        description="This movie will be removed from your LifeShelf. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
