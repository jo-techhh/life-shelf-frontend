import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/api/movies.api';
import { MovieStatus } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovieFormModal, MovieFormValues } from './movie-form-modal';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  ArrowLeft,
  Film,
  Star,
  Clock,
  Globe,
  User,
  Users,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: movie, isLoading, isError, refetch } = useQuery({
    queryKey: ['movies', id],
    queryFn: () => moviesApi.getById(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: Partial<MovieFormValues>) => moviesApi.update(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie updated');
      setIsEditOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => moviesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie deleted');
      navigate('/watch/movies');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 py-4">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
          <div className="md:col-span-2 flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Movie not found"
          message="We couldn't locate this movie in your LifeShelf."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to="/watch/movies">
            <Button variant="outline" size="sm">
              Back to Movies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const poster = movie.mediaAsset?.secureUrl || movie.mediaAsset?.url;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      {/* Back link */}
      <div>
        <Link
          to="/watch/movies"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Movies
        </Link>
      </div>

      {/* Main Movie Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto md:mx-0 rounded-2xl overflow-hidden border border-border/80 bg-muted/40 shadow-md">
          {poster ? (
            <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Film className="w-12 h-12 mb-2" />
              <span className="text-xs">No cover image</span>
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={movie.status} />
              <PriorityBadge priority={movie.priority} />
              {movie.genre && (
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {movie.genre}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
              {movie.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
              {movie.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {movie.releaseYear}
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {movie.duration} mins
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {movie.language}
                </span>
              )}
              {movie.rating ? (
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </span>
              ) : null}
            </div>
          </div>

          {/* Cast & Crew Info */}
          {(movie.director || movie.cast) && (
            <div className="flex flex-col gap-2 py-3 border-y border-border/60 text-xs">
              {movie.director && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Director:</span>
                  <span className="font-medium text-foreground">{movie.director}</span>
                </div>
              )}
              {movie.cast && (
                <div className="flex items-start gap-2">
                  <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground shrink-0">Cast:</span>
                  <span className="font-medium text-foreground">{movie.cast}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => setIsEditOpen(true)} size="sm" variant="outline" className="gap-2">
              <Edit2 className="w-3.5 h-3.5" />
              Edit Movie
            </Button>
            <Button
              onClick={() => setIsDeleteOpen(true)}
              size="sm"
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>

            {/* Quick Status toggle */}
            <div className="ml-auto">
              <select
                value={movie.status}
                onChange={(e) =>
                  updateMutation.mutate({ status: e.target.value as MovieStatus })
                }
                className="h-8 text-xs font-medium rounded-xl border border-input bg-card px-3 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PLANNED">Mark as Planned</option>
                <option value="WATCHING">Mark as Watching</option>
                <option value="WATCHED">Mark as Watched</option>
                <option value="DROPPED">Mark as Dropped</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Thoughts */}
      <div className="flex flex-col gap-6 mt-4">
        {movie.description && (
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Overview
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {movie.description}
            </p>
          </div>
        )}

        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Personal Notes & Reflection
          </h2>
          {movie.notes ? (
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {movie.notes}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No notes written yet. Click &quot;Edit Movie&quot; to add your thoughts or favorite quotes.
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <MovieFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(values) => updateMutation.mutate(values)}
        initialData={movie}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={`Delete "${movie.title}"?`}
        description="This movie will be permanently removed from your LifeShelf."
        confirmLabel="Delete Movie"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
