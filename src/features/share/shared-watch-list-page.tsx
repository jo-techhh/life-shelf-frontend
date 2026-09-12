import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shareApi } from '@/api/share.api';
import { Movie, Series } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Film,
  Tv,
  Star,
  Search,
  ShieldAlert,
  SearchX,
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

type ItemType = 'ALL' | 'MOVIE' | 'SERIES';
type SortOption = 'rating-desc' | 'year-desc' | 'title-asc';

export function SharedWatchListPage() {
  const { token } = useParams<{ token: string }>();

  const [activeTab, setActiveTab] = useState<ItemType>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');

  // Fetch shared watched list
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['publicWatchList', token],
    queryFn: () => shareApi.getPublicWatchList(token!),
    enabled: !!token,
    retry: false,
  });

  const err = error as (Error & { status?: number; code?: string }) | null;
  const isRevoked =
    err?.status === 410 ||
    err?.code === 'SHARE_LINK_REVOKED' ||
    err?.message?.toLowerCase().includes('revoked');

  // Combine and filter items
  const combinedItems = useMemo(() => {
    if (!data) return [];

    const movieItems = (data.movies || []).map((m: Movie) => ({
      ...m,
      itemType: 'MOVIE' as const,
    }));

    const seriesItems = (data.series || []).map((s: Series) => ({
      ...s,
      itemType: 'SERIES' as const,
    }));

    let items = [...movieItems, ...seriesItems];

    // Filter by tab
    if (activeTab === 'MOVIE') {
      items = items.filter((item) => item.itemType === 'MOVIE');
    } else if (activeTab === 'SERIES') {
      items = items.filter((item) => item.itemType === 'SERIES');
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.genre?.toLowerCase().includes(q) ||
          ('director' in item && item.director?.toLowerCase().includes(q))
      );
    }

    // Sort items
    items.sort((a, b) => {
      if (sortBy === 'rating-desc') {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        return ratingB - ratingA;
      }
      if (sortBy === 'year-desc') {
        const yearA = a.releaseYear ?? 0;
        const yearB = b.releaseYear ?? 0;
        return yearB - yearA;
      }
      return a.title.localeCompare(b.title);
    });

    return items;
  }, [data, activeTab, search, sortBy]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/60 bg-card/40 backdrop-blur-md sticky top-0 z-20 py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="h-7 w-36 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-muted/60 rounded-lg animate-pulse" />
          </div>
        </header>

        <main className="max-w-6xl mx-auto w-full px-6 py-10 space-y-8 flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/60 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted/60 rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted/40 rounded animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 1. SPECIFIC REVOKED LINK STATE
  if (isError && isRevoked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/20">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Revoked Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Access Revoked
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              This Watch List is No Longer Public
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The owner of this list has revoked access or deactivated this share link. If you still need access, please ask the owner to generate a new link for you.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full gap-2">
                Sign In to LifeShelf
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground/60 pt-4">
            LifeShelf • Personal tracking for movies, series, books & life goals
          </p>
        </div>
      </div>
    );
  }

  // 2. INVALID / RUBBISH TOKEN 404 STATE
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-primary/20">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Not Found Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xl shadow-destructive/5">
            <SearchX className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
              404 Not Found
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Watch List Not Found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The share link you entered is invalid or does not exist. Please double-check the URL.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full gap-2">
                <Compass className="w-4 h-4" />
                Return to LifeShelf
              </Button>
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground/60 pt-4">
            LifeShelf • Personal tracking for movies, series, books & life goals
          </p>
        </div>
      </div>
    );
  }

  // 3. ACTIVE SHARED LIST VIEW
  const totalWatched = (data.movies?.length || 0) + (data.series?.length || 0);
  const ownerName = data.user.displayName || data.user.username;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-0 z-20 py-3.5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              LS
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              LifeShelf <span className="text-xs font-normal text-muted-foreground ml-1.5 hidden sm:inline">Shared Shelf</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/register">
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Create Your Shelf
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        {/* Profile & Shelf Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-card border border-border/70 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex items-center gap-4 relative z-10">
            {data.user.avatarUrl ? (
              <img
                src={data.user.avatarUrl}
                alt={ownerName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold font-display shadow-md">
                {ownerName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
                  {ownerName}&apos;s Watched Shelf
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Publicly shared watched collection • {totalWatched} title{totalWatched !== 1 ? 's' : ''} completed
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 sm:gap-6 border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6 relative z-10">
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-foreground font-mono">{data.movies?.length || 0}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <Film className="w-3 h-3 text-primary" /> Movies
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-foreground font-mono">{data.series?.length || 0}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <Tv className="w-3 h-3 text-primary" /> Series
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/50 text-xs w-fit">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'ALL'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({totalWatched})
            </button>
            <button
              onClick={() => setActiveTab('MOVIE')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'MOVIE'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies ({data.movies?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('SERIES')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'SERIES'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Series ({data.series?.length || 0})
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by title, genre..."
                className="pl-9 h-9 text-xs bg-card"
              />
            </div>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-9 text-xs w-36 bg-card"
              options={[
                { label: 'Highest Rated', value: 'rating-desc' },
                { label: 'Release Year', value: 'year-desc' },
                { label: 'Title (A-Z)', value: 'title-asc' },
              ]}
            />
          </div>
        </div>

        {/* Content Grid */}
        {combinedItems.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl p-6 space-y-2">
            <p className="text-sm font-semibold text-foreground">No watched items found</p>
            <p className="text-xs text-muted-foreground">
              {search ? 'Try adjusting your search filter' : 'No completed movies or series in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {combinedItems.map((item) => {
              const posterUrl = item.mediaAsset?.url || item.mediaAsset?.secureUrl;
              const isMovie = item.itemType === 'MOVIE';

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="group bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col"
                >
                  {/* Poster container */}
                  <div className="aspect-[2/3] bg-muted/50 relative overflow-hidden">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-muted-foreground/60 gap-1.5 bg-gradient-to-b from-muted/30 to-muted/80">
                        {isMovie ? <Film className="w-7 h-7" /> : <Tv className="w-7 h-7" />}
                        <span className="text-[10px] text-center font-medium">No Poster</span>
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white/90 flex items-center gap-1">
                      {isMovie ? <Film className="w-2.5 h-2.5 text-primary" /> : <Tv className="w-2.5 h-2.5 text-blue-400" />}
                      <span>{isMovie ? 'Film' : 'Series'}</span>
                    </div>

                    {/* Rating badge */}
                    {item.rating != null && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[11px] font-bold text-amber-400 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={item.title}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <span>{item.releaseYear || '—'}</span>
                        {item.genre && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.genre}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {'duration' in item && item.duration ? (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}m</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-6 text-center text-xs text-muted-foreground mt-12 bg-card/20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Shared via <strong className="text-foreground">LifeShelf</strong> • Personal Life Library
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" className="text-primary hover:underline font-medium">
              Start Your Own Shelf
            </Link>
            <Link to="/login" className="hover:text-foreground">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
