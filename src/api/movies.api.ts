import { apiClient } from './client';
import { ApiResponse, Movie, MovieStatus, PaginatedResponse, Priority } from '@/types';

export interface MovieQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: MovieStatus;
  priority?: Priority;
  genre?: string;
  tagId?: string;
  sortBy?: 'createdAt' | 'title' | 'rating' | 'releaseYear';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMovieDto {
  title: string;
  description?: string | null;
  releaseYear?: number | null;
  language?: string | null;
  duration?: number | null;
  director?: string | null;
  cast?: string | null;
  rating?: number | null;
  status?: MovieStatus;
  priority?: Priority;
  genre?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  tagIds?: string[];
}

export type UpdateMovieDto = Partial<CreateMovieDto>;

export const moviesApi = {
  async list(params?: MovieQueryParams): Promise<PaginatedResponse<Movie>> {
    const res = await apiClient.get<PaginatedResponse<Movie>>('/movies', { params });
    return res.data;
  },

  async getById(id: string): Promise<Movie> {
    const res = await apiClient.get<ApiResponse<Movie>>(`/movies/${id}`);
    return res.data.data;
  },

  async create(data: CreateMovieDto): Promise<Movie> {
    const res = await apiClient.post<ApiResponse<Movie>>('/movies', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateMovieDto): Promise<Movie> {
    const res = await apiClient.patch<ApiResponse<Movie>>(`/movies/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/movies/${id}`);
  },
};
