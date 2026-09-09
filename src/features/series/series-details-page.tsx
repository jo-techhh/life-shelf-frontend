import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesApi } from '@/api/series.api';
import { Episode, SeriesStatus } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { SeriesFormModal, SeriesFormValues } from './series-form-modal';
import { EpisodeNoteModal } from './episode-note-modal';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/common/loading-skeleton';
import { useToast } from '@/app/toast-context';
import {
  ArrowLeft,
  Tv,
  Star,
  Plus,
  CheckCircle2,
  Circle,
  FileText,
  Trash2,
  Edit2,
  Calendar,
  Globe,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function SeriesDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState<number>(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Episode note modal state
  const [noteEpisode, setNoteEpisode] = useState<Episode | null>(null);

  // Add Season / Episode modal state
  const [isAddSeasonOpen, setIsAddSeasonOpen] = useState(false);
  const [newSeasonNumber, setNewSeasonNumber] = useState<number>(1);
  const [newSeasonTitle, setNewSeasonTitle] = useState<string>('');

  const [isAddEpisodeOpen, setIsAddEpisodeOpen] = useState(false);
  const [newEpNumber, setNewEpNumber] = useState<number>(1);
  const [newEpTitle, setNewEpTitle] = useState<string>('');
  const [newEpDuration, setNewEpDuration] = useState<string>('');

  // Fetch Series
  const { data: series, isLoading, isError, refetch } = useQuery({
    queryKey: ['series', id],
    queryFn: () => seriesApi.getById(id!),
    enabled: !!id,
  });

  // Update series mutation
  const updateMutation = useMutation({
    mutationFn: (values: Partial<SeriesFormValues>) => seriesApi.update(id!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      toast.success('Series updated');
      setIsEditOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete series mutation
  const deleteMutation = useMutation({
    mutationFn: () => seriesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Series deleted');
      navigate('/watch/series');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Mark Watched / Unwatched mutation with optimistic updates
  const toggleEpisodeWatched = useMutation({
    mutationFn: ({ episodeId, watched }: { episodeId: string; watched: boolean }) =>
      watched ? seriesApi.unmarkWatched(episodeId) : seriesApi.markWatched(episodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Save Episode Note mutation
  const saveNoteMutation = useMutation({
    mutationFn: ({ episodeId, note }: { episodeId: string; note: string }) =>
      seriesApi.updateEpisode(episodeId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      toast.success('Episode note saved');
      setNoteEpisode(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add Season mutation
  const addSeasonMutation = useMutation({
    mutationFn: (data: { seasonNumber: number; title?: string }) =>
      seriesApi.addSeason(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      toast.success('Season added');
      setIsAddSeasonOpen(false);
      setNewSeasonTitle('');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add Episode mutation
  const addEpisodeMutation = useMutation({
    mutationFn: ({ seasonId, data }: { seasonId: string; data: { episodeNumber: number; title?: string; duration?: number } }) =>
      seriesApi.addEpisode(seasonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      toast.success('Episode added');
      setIsAddEpisodeOpen(false);
      setNewEpTitle('');
      setNewEpDuration('');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete Episode mutation
  const deleteEpisodeMutation = useMutation({
    mutationFn: (episodeId: string) => seriesApi.deleteEpisode(episodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['series', id] });
      toast.success('Episode removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 py-4">
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

  if (isError || !series) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <ErrorState
          title="Series not found"
          message="We couldn't locate this TV series."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to="/watch/series">
            <Button variant="outline" size="sm">
              Back to TV Series
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const poster = series.mediaAsset?.secureUrl || series.mediaAsset?.url;
  const progressPct = series.progress?.percentage ?? 0;
  const totalEps = series.progress?.totalEpisodes ?? 0;
  const watchedEps = series.progress?.watchedEpisodes ?? 0;
  const seasons = series.seasons || [];
  const currentSeason = seasons[selectedSeasonIdx] || seasons[0];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Back link */}
      <div>
        <Link
          to="/watch/series"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to TV Series
        </Link>
      </div>

      {/* Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto md:mx-0 rounded-2xl overflow-hidden border border-border/80 bg-muted/40 shadow-md">
          {poster ? (
            <img src={poster} alt={series.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Tv className="w-12 h-12 mb-2" />
              <span className="text-xs">No cover image</span>
            </div>
          )}
        </div>

        {/* Series info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={series.status} />
              <PriorityBadge priority={series.priority} />
              {series.genre && (
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {series.genre}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
              {series.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
              {series.releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {series.releaseYear}
                </span>
              )}
              {series.language && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {series.language}
                </span>
              )}
              {series.rating ? (
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {series.rating.toFixed(1)} / 10
                </span>
              ) : null}
              <span>
                {seasons.length} {seasons.length === 1 ? 'Season' : 'Seasons'} · {totalEps} Episodes
              </span>
            </div>
          </div>

          {/* Overall Progress Widget */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Overall Series Progress</span>
              <span className="font-bold text-primary">
                {watchedEps} / {totalEps} ({progressPct}%)
              </span>
            </div>
            <ProgressBar value={progressPct} size="md" variant={progressPct === 100 ? 'success' : 'primary'} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => setIsEditOpen(true)} size="sm" variant="outline" className="gap-2">
              <Edit2 className="w-3.5 h-3.5" />
              Edit Series
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

            <div className="ml-auto">
              <select
                value={series.status}
                onChange={(e) =>
                  updateMutation.mutate({ status: e.target.value as SeriesStatus })
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

      {/* Description */}
      {series.description && (
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Overview
          </h2>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {series.description}
          </p>
        </div>
      )}

      {/* Seasons & Episodes Interface */}
      <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="text-lg font-bold font-display text-foreground">
              Seasons & Episodes
            </h2>
            <p className="text-xs text-muted-foreground">
              Click checkboxes to mark episodes as watched and add notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewSeasonNumber(seasons.length + 1);
                setIsAddSeasonOpen(true);
              }}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Season
            </Button>
            {currentSeason && (
              <Button
                size="sm"
                onClick={() => {
                  setNewEpNumber((currentSeason.episodes?.length || 0) + 1);
                  setIsAddEpisodeOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Episode
              </Button>
            )}
          </div>
        </div>

        {/* Seasons Tabs */}
        {seasons.length > 0 ? (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {seasons.map((season, idx) => {
                const totalSeasonEps = season.episodes?.length || 0;
                const watchedSeasonEps = season.episodes?.filter((e) => e.watched).length || 0;
                const isSeasonComplete = totalSeasonEps > 0 && watchedSeasonEps === totalSeasonEps;

                return (
                  <button
                    key={season.id}
                    type="button"
                    onClick={() => setSelectedSeasonIdx(idx)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedSeasonIdx === idx
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-secondary/40 text-foreground border-border/70 hover:bg-secondary'
                    }`}
                  >
                    <span>{season.title || `Season ${season.seasonNumber}`}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        selectedSeasonIdx === idx
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : isSeasonComplete
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {watchedSeasonEps}/{totalSeasonEps}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Current Season Episodes List */}
            {currentSeason ? (
              <div className="flex flex-col gap-2 mt-2">
                {currentSeason.episodes && currentSeason.episodes.length > 0 ? (
                  currentSeason.episodes.map((ep) => {
                    const epCode = `S${String(currentSeason.seasonNumber).padStart(2, '0')}E${String(
                      ep.episodeNumber
                    ).padStart(2, '0')}`;

                    return (
                      <div
                        key={ep.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                          ep.watched
                            ? 'bg-muted/30 border-border/40 text-muted-foreground'
                            : 'bg-card border-border/70 hover:border-primary/40 text-foreground shadow-xs'
                        }`}
                      >
                        {/* Checkbox and title */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              toggleEpisodeWatched.mutate({
                                episodeId: ep.id,
                                watched: ep.watched,
                              })
                            }
                            className="mt-0.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                            aria-label={ep.watched ? 'Mark unwatched' : 'Mark watched'}
                          >
                            {ep.watched ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-primary" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                {epCode}
                              </span>
                              <span
                                className={`text-sm font-semibold truncate ${
                                  ep.watched ? 'line-through text-muted-foreground' : 'text-foreground'
                                }`}
                              >
                                {ep.title || `Episode ${ep.episodeNumber}`}
                              </span>
                            </div>

                            {/* Meta & Watched date */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                              {ep.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {ep.duration} mins
                                </span>
                              )}
                              {ep.watchedAt && (
                                <span>Watched on {formatDate(ep.watchedAt)}</span>
                              )}
                            </div>

                            {/* Personal Note Callout */}
                            {ep.note && (
                              <div className="mt-2 text-xs bg-secondary/60 text-foreground/90 p-2 rounded-xl flex items-start gap-2 border border-border/40">
                                <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                <span className="italic leading-relaxed">{ep.note}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Episode Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNoteEpisode(ep)}
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {ep.note ? 'Edit Note' : 'Add Note'}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteEpisodeMutation.mutate(ep.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            aria-label="Delete episode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No episodes added to this season yet. Click &quot;Add Episode&quot; above.
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-10 text-xs text-muted-foreground flex flex-col items-center gap-3">
            <p>This series doesn&apos;t have any seasons added yet.</p>
            <Button
              size="sm"
              onClick={() => {
                setNewSeasonNumber(1);
                setIsAddSeasonOpen(true);
              }}
            >
              Add Season 1
            </Button>
          </div>
        )}
      </div>

      {/* Episode Note Modal */}
      <EpisodeNoteModal
        isOpen={!!noteEpisode}
        onClose={() => setNoteEpisode(null)}
        episode={noteEpisode}
        seasonNumber={currentSeason?.seasonNumber}
        onSave={(episodeId, note) => saveNoteMutation.mutate({ episodeId, note })}
        isLoading={saveNoteMutation.isPending}
      />

      {/* Add Season Modal */}
      <Dialog
        isOpen={isAddSeasonOpen}
        onClose={() => setIsAddSeasonOpen(false)}
        title="Add Season"
        description={`Add a season to ${series.title}`}
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addSeasonMutation.mutate({
              seasonNumber: newSeasonNumber,
              title: newSeasonTitle.trim() || undefined,
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Season Number *"
            type="number"
            min={1}
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(parseInt(e.target.value, 10))}
            required
          />
          <Input
            label="Season Title (optional)"
            placeholder="e.g. Season 1 or Final Season"
            value={newSeasonTitle}
            onChange={(e) => setNewSeasonTitle(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddSeasonOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={addSeasonMutation.isPending}>
              Add Season
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Episode Modal */}
      <Dialog
        isOpen={isAddEpisodeOpen}
        onClose={() => setIsAddEpisodeOpen(false)}
        title={`Add Episode to Season ${currentSeason?.seasonNumber}`}
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!currentSeason) return;
            addEpisodeMutation.mutate({
              seasonId: currentSeason.id,
              data: {
                episodeNumber: newEpNumber,
                title: newEpTitle.trim() || undefined,
                duration: newEpDuration ? parseInt(newEpDuration, 10) : undefined,
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Episode Number *"
            type="number"
            min={1}
            value={newEpNumber}
            onChange={(e) => setNewEpNumber(parseInt(e.target.value, 10))}
            required
          />
          <Input
            label="Episode Title"
            placeholder="e.g. Pilot or Ozymandias"
            value={newEpTitle}
            onChange={(e) => setNewEpTitle(e.target.value)}
          />
          <Input
            label="Duration in minutes (optional)"
            type="number"
            placeholder="45"
            value={newEpDuration}
            onChange={(e) => setNewEpDuration(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddEpisodeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={addEpisodeMutation.isPending}>
              Add Episode
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Series Modal */}
      <SeriesFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(values) => updateMutation.mutate(values)}
        initialData={series}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Series Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={`Delete "${series.title}"?`}
        description="This series and all its recorded progress will be removed from your LifeShelf."
        confirmLabel="Delete Series"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
