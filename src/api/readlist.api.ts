import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Priority, ReadingItem, ReadingStatus, ReadingType } from '@/types';

export interface ReadingQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ReadingType;
  status?: ReadingStatus;
  priority?: Priority;
  tagId?: string;
  sortBy?: 'createdAt' | 'title' | 'progress' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReadingItemDto {
  title: string;
  description?: string | null;
  author?: string | null;
  type?: ReadingType;
  status?: ReadingStatus;
  progress?: number;
  totalPages?: number | null;
  currentPage?: number | null;
  rating?: number | null;
  priority?: Priority;
  notes?: string | null;
  mediaAssetId?: string | null;
  tagIds?: string[];
}

export type UpdateReadingItemDto = Partial<CreateReadingItemDto>;

export const readlistApi = {
  async list(params?: ReadingQueryParams): Promise<PaginatedResponse<ReadingItem>> {
    const res = await apiClient.get<PaginatedResponse<ReadingItem>>('/readlist', { params });
    return res.data;
  },

  async getById(id: string): Promise<ReadingItem> {
    const res = await apiClient.get<ApiResponse<ReadingItem>>(`/readlist/${id}`);
    return res.data.data;
  },

  async create(data: CreateReadingItemDto): Promise<ReadingItem> {
    const res = await apiClient.post<ApiResponse<ReadingItem>>('/readlist', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateReadingItemDto): Promise<ReadingItem> {
    const res = await apiClient.patch<ApiResponse<ReadingItem>>(`/readlist/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/readlist/${id}`);
  },
};
