import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/api/dashboard.api';
import { plansApi } from '@/api/plans.api';
import { useAuth } from '@/app/auth-context';
import { useToast } from '@/app/toast-context';
import { ProgressBar } from '@/components/ui/progress-bar';
import { PriorityBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/loading-skeleton';
import { ErrorState } from '@/components/common/error-state';
import {
  Film,
  Tv,
  BookOpen,
  GraduationCap,
  Compass,
  CalendarCheck,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard(),
  });

  // Toggle plan completion mutation
  const togglePlanMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'COMPLETED' | 'PLANNED' }) =>
      plansApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated');
    },
  });

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <ErrorState
          title="Could not load your dashboard"
          message="Make sure your LifeShelf backend is running on port 5000."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* 1. Greeting & Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
              {getGreeting()}, {user?.displayName || user?.username || 'Friend'} 👋
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s on your shelf today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/plans?add=true')}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            Plan Day
          </Button>
          <Button
            onClick={() => navigate('/watch/movies?add=true')}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add to Shelf
          </Button>
        </div>
      </div>

      {/* 2. Shelf Counts Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Movies',
            count: data?.counts?.movies ?? 0,
            icon: Film,
            to: '/watch/movies',
            color: 'text-amber-500 bg-amber-500/10',
          },
          {
            label: 'Series',
            count: data?.counts?.series ?? 0,
            icon: Tv,
            to: '/watch/series',
            color: 'text-rose-500 bg-rose-500/10',
          },
          {
            label: 'Reading',
            count: data?.counts?.reading ?? 0,
            icon: BookOpen,
            to: '/read',
            color: 'text-blue-500 bg-blue-500/10',
          },
          {
            label: 'Study',
            count: data?.counts?.study ?? 0,
            icon: GraduationCap,
            to: '/study',
            color: 'text-indigo-500 bg-indigo-500/10',
          },
          {
            label: 'Travel',
            count: data?.counts?.travel ?? 0,
            icon: Compass,
            to: '/travel',
            color: 'text-emerald-500 bg-emerald-500/10',
          },
          {
            label: 'Plans',
            count: data?.counts?.plans ?? 0,
            icon: CalendarCheck,
            to: '/plans',
            color: 'text-violet-500 bg-violet-500/10',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-5 w-8 mb-1" />
                ) : (
                  <span className="font-bold text-lg text-foreground font-display leading-tight block">
                    {item.count}
                  </span>
                )}
                <span className="text-xs text-muted-foreground truncate block">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Continue Watching & Continue Reading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Watching */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <h2 className="font-semibold text-base text-foreground font-display">
                Continue Watching
              </h2>
            </div>
            <Link to="/watch/movies" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <Skeleton className="w-14 h-20 rounded-xl" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            ) : data?.continueWatching && data.continueWatching.length > 0 ? (
              data.continueWatching.map((item) => {
                const isSeries = item.type === 'SERIES';
                const progressPct = item.progress?.percentage ?? 0;
                const nextEp = item.progress?.nextUnwatchedEpisode;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/50 hover:border-primary/40 bg-secondary/20 hover:bg-secondary/40 transition-all group"
                  >
                    {/* Poster thumbnail */}
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/60">
                      {item.mediaAsset?.secureUrl || item.mediaAsset?.url ? (
                        <img
                          src={item.mediaAsset.secureUrl || item.mediaAsset.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {isSeries ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
                          {isSeries ? 'Series' : 'Movie'}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {item.title}
                        </h3>
                      </div>

                      {isSeries ? (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">
                            {nextEp
                              ? `Season ${nextEp.seasonNumber} · Episode ${nextEp.episodeNumber}`
                              : 'All caught up!'}
                          </p>
                          <ProgressBar value={progressPct} showText size="sm" className="mt-1.5" />
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Currently watching</p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        navigate(isSeries ? `/watch/series/${item.id}` : `/watch/movies/${item.id}`)
                      }
                      className="shrink-0"
                    >
                      Continue
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No active movies or series currently marked as Watching.{' '}
                <Link to="/watch/movies" className="text-primary underline">
                  Start one
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Continue Reading */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-base text-foreground font-display">
                Continue Reading
              </h2>
            </div>
            <Link to="/read" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <Skeleton className="w-14 h-20 rounded-xl" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            ) : data?.continueReading && data.continueReading.length > 0 ? (
              data.continueReading.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/50 hover:border-primary/40 bg-secondary/20 hover:bg-secondary/40 transition-all group"
                >
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/60">
                    {book.mediaAsset?.secureUrl || book.mediaAsset?.url ? (
                      <img
                        src={book.mediaAsset.secureUrl || book.mediaAsset.url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {book.author ? `by ${book.author}` : book.type}
                    </p>

                    <div className="mt-2">
                      {book.totalPages && book.currentPage !== null ? (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Page {book.currentPage} of {book.totalPages}</span>
                          <span>{book.progress}%</span>
                        </div>
                      ) : null}
                      <ProgressBar value={book.progress} size="sm" />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate('/read')}
                    className="shrink-0"
                  >
                    Read
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No books or articles in progress.{' '}
                <Link to="/read" className="text-primary underline">
                  Pick up something from your readlist
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Continue Learning & Upcoming Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-base text-foreground font-display">
                Continue Learning
              </h2>
            </div>
            <Link to="/study" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5 mt-1">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))
            ) : data?.continueStudying && data.continueStudying.length > 0 ? (
              data.continueStudying.map((study) => (
                <div
                  key={study.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {study.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.2 rounded bg-secondary uppercase font-bold">
                        {study.type}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar value={study.progress} showText size="sm" />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/study')}
                    className="shrink-0"
                  >
                    Study
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No active learning topics.{' '}
                <Link to="/study" className="text-primary underline">
                  Add a course or technology
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Plans */}
        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-base text-foreground font-display">
                Upcoming Plans
              </h2>
            </div>
            <Link to="/plans" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-2xl" />
              ))
            ) : data?.upcomingPlans && data.upcomingPlans.length > 0 ? (
              data.upcomingPlans.map((plan) => {
                const isCompleted = plan.status === 'COMPLETED';

                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() =>
                          togglePlanMutation.mutate({
                            id: plan.id,
                            status: isCompleted ? 'PLANNED' : 'COMPLETED',
                          })
                        }
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${isCompleted ? 'text-emerald-500 fill-emerald-500/20' : 'text-muted-foreground/50'}`}
                        />
                      </button>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium text-foreground truncate ${
                            isCompleted ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {plan.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                          {plan.scheduledDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(plan.scheduledDate)}
                            </span>
                          )}
                          <span className="capitalize">{plan.type.toLowerCase().replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <PriorityBadge priority={plan.priority} />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No upcoming plans scheduled.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/plans?add=true')}
                  className="text-primary underline cursor-pointer"
                >
                  Create a plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recently Completed Activity */}
      {data?.recentlyCompleted && data.recentlyCompleted.length > 0 && (
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-base text-foreground font-display">
              Recently Completed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentlyCompleted.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-secondary/20"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Completed in {item.category.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
