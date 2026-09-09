import { apiClient } from './client';
import { ApiResponse, Episode, PaginatedResponse, Priority, Season, Series, SeriesStatus } from '@/types';

export interface SeriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SeriesStatus;
  priority?: Priority;
  genre?: string;
  tagId?: string;
  sortBy?: 'createdAt' | 'title' | 'rating' | 'releaseYear';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEpisodeDto {
  episodeNumber: number;
  title?: string | null;
  description?: string | null;
  duration?: number | null;
  note?: string | null;
}

export interface CreateSeasonDto {
  seasonNumber: number;
  title?: string | null;
  description?: string | null;
  episodes?: CreateEpisodeDto[];
}

export interface CreateSeriesDto {
  title: string;
  description?: string | null;
  releaseYear?: number | null;
  language?: string | null;
  genre?: string | null;
  rating?: number | null;
  status?: SeriesStatus;
  priority?: Priority;
  notes?: string | null;
  mediaAssetId?: string | null;
  tagIds?: string[];
  seasons?: CreateSeasonDto[];
}

export type UpdateSeriesDto = Partial<Omit<CreateSeriesDto, 'seasons'>>;

export const seriesApi = {
  async list(params?: SeriesQueryParams): Promise<PaginatedResponse<Series>> {
    const res = await apiClient.get<PaginatedResponse<Series>>('/series', { params });
    return res.data;
  },

  async getById(id: string): Promise<Series> {
    const res = await apiClient.get<ApiResponse<Series>>(`/series/${id}`);
    return res.data.data;
  },

  async create(data: CreateSeriesDto): Promise<Series> {
    const res = await apiClient.post<ApiResponse<Series>>('/series', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateSeriesDto): Promise<Series> {
    const res = await apiClient.patch<ApiResponse<Series>>(`/series/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/series/${id}`);
  },

  // Seasons
  async addSeason(seriesId: string, data: { seasonNumber: number; title?: string | null; description?: string | null }): Promise<Season> {
    const res = await apiClient.post<ApiResponse<Season>>(`/series/${seriesId}/seasons`, data);
    return res.data.data;
  },

  async updateSeason(seasonId: string, data: { seasonNumber?: number; title?: string | null; description?: string | null }): Promise<Season> {
    const res = await apiClient.patch<ApiResponse<Season>>(`/seasons/${seasonId}`, data);
    return res.data.data;
  },

  async deleteSeason(seasonId: string): Promise<void> {
    await apiClient.delete(`/seasons/${seasonId}`);
  },

  // Episodes
  async addEpisode(seasonId: string, data: CreateEpisodeDto): Promise<Episode> {
    const res = await apiClient.post<ApiResponse<Episode>>(`/seasons/${seasonId}/episodes`, data);
    return res.data.data;
  },

  async updateEpisode(episodeId: string, data: Partial<CreateEpisodeDto> & { watched?: boolean }): Promise<Episode> {
    const res = await apiClient.patch<ApiResponse<Episode>>(`/episodes/${episodeId}`, data);
    return res.data.data;
  },

  async deleteEpisode(episodeId: string): Promise<void> {
    await apiClient.delete(`/episodes/${episodeId}`);
  },

  async markWatched(episodeId: string, note?: string | null): Promise<Episode> {
    const res = await apiClient.post<ApiResponse<Episode>>(`/episodes/${episodeId}/watched`, { note });
    return res.data.data;
  },

  async unmarkWatched(episodeId: string): Promise<Episode> {
    const res = await apiClient.delete<ApiResponse<Episode>>(`/episodes/${episodeId}/watched`);
    return res.data.data;
  },
};
