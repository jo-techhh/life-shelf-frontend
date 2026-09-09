export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MovieStatus = 'PLANNED' | 'WATCHING' | 'WATCHED' | 'DROPPED';
export type SeriesStatus = 'PLANNED' | 'WATCHING' | 'WATCHED' | 'DROPPED';

export type ReadingType =
  | 'BOOK'
  | 'ARTICLE'
  | 'PAPER'
  | 'BLOG'
  | 'DOCUMENTATION'
  | 'OTHER';

export type ReadingStatus = 'PLANNED' | 'READING' | 'COMPLETED' | 'DROPPED';

export type StudyType =
  | 'COURSE'
  | 'TECHNOLOGY'
  | 'SKILL'
  | 'TOPIC'
  | 'CERTIFICATION'
  | 'BOOK'
  | 'TUTORIAL'
  | 'OTHER';

export type StudyStatus = 'PLANNED' | 'LEARNING' | 'COMPLETED' | 'DROPPED';

export type TravelStatus = 'WANT_TO_VISIT' | 'PLANNING' | 'VISITED';
export type TripStatus = 'PLANNING' | 'BOOKED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type PlanType =
  | 'MOVIE'
  | 'SERIES_EPISODE'
  | 'READING'
  | 'STUDY'
  | 'TRAVEL'
  | 'OTHER';

export type PlanStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MediaAsset {
  id: string;
  userId?: string | null;
  name: string;
  type: string;
  provider: string;
  publicId: string;
  url: string;
  secureUrl: string;
  metadata?: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CloudStorageConfig {
  id: string;
  provider: string;
  cloudName: string;
  apiKeyMasked: string;
  isConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId?: string;
  name: string;
  color?: string | null;
  _count?: {
    movieTags?: number;
    seriesTags?: number;
    readingTags?: number;
    studyTags?: number;
    travelPlaceTags?: number;
    planTags?: number;
  };
}

export interface Movie {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  releaseYear?: number | null;
  language?: string | null;
  duration?: number | null;
  director?: string | null;
  cast?: string | null;
  rating?: number | null;
  status: MovieStatus;
  priority: Priority;
  genre?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  tags?: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title?: string | null;
  description?: string | null;
  duration?: number | null;
  watched: boolean;
  watchedAt?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title?: string | null;
  description?: string | null;
  episodes: Episode[];
  createdAt: string;
  updatedAt: string;
}

export interface SeriesProgress {
  totalEpisodes: number;
  watchedEpisodes: number;
  percentage: number;
  completedSeasons: number;
  nextUnwatchedEpisode?: {
    seasonNumber: number;
    episodeNumber: number;
    title?: string | null;
    episodeId: string;
  } | null;
}

export interface Series {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  releaseYear?: number | null;
  language?: string | null;
  genre?: string | null;
  rating?: number | null;
  status: SeriesStatus;
  priority: Priority;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  seasons: Season[];
  tags?: { tag: Tag }[];
  progress?: SeriesProgress;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  author?: string | null;
  type: ReadingType;
  status: ReadingStatus;
  progress: number;
  totalPages?: number | null;
  currentPage?: number | null;
  rating?: number | null;
  priority: Priority;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  tags?: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyResource {
  id: string;
  studyItemId: string;
  title: string;
  url?: string | null;
  type?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: StudyType;
  status: StudyStatus;
  progress: number;
  priority: Priority;
  targetDate?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  resources?: StudyResource[];
  tags?: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelPlace {
  id: string;
  userId: string;
  name: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  description?: string | null;
  priority: Priority;
  status: TravelStatus;
  estimatedBudget?: number | null;
  targetDate?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  tags?: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
}

export interface TripPlace {
  id: string;
  tripId: string;
  placeId: string;
  place: TravelPlace;
  order: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  status: TripStatus;
  notes?: string | null;
  mediaAssetId?: string | null;
  mediaAsset?: MediaAsset | null;
  tripPlaces: TripPlace[];
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: PlanType;
  scheduledDate?: string | null;
  priority: Priority;
  status: PlanStatus;
  notes?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  tags?: { tag: Tag }[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardContinueWatchingItem {
  type: 'MOVIE' | 'SERIES';
  id: string;
  title: string;
  mediaAsset?: MediaAsset | null;
  progress?: SeriesProgress;
  updatedAt: string;
}

export interface DashboardData {
  counts: {
    movies: number;
    series: number;
    reading: number;
    study: number;
    travel: number;
    plans: number;
  };
  continueWatching: DashboardContinueWatchingItem[];
  continueReading: ReadingItem[];
  continueStudying: StudyItem[];
  upcomingPlans: Plan[];
  recentlyCompleted: Array<{
    category: 'MOVIE' | 'READING' | 'STUDY';
    id: string;
    title: string;
    updatedAt: string;
    mediaAsset?: MediaAsset | null;
    type?: string;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}
