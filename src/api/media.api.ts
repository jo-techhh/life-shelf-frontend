import { apiClient } from './client';
import { ApiResponse, MediaAsset, PaginatedResponse } from '@/types';

export const mediaApi = {
  async listUserMedia(page = 1, limit = 20, search?: string): Promise<PaginatedResponse<MediaAsset>> {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;
    const res = await apiClient.get<PaginatedResponse<MediaAsset>>('/media', { params });
    return res.data;
  },

  async getDefaultAssets(): Promise<MediaAsset[]> {
    const res = await apiClient.get<ApiResponse<MediaAsset[]>>('/media/defaults');
    return res.data.data;
  },

  async uploadImage(file: File): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<MediaAsset>>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async deleteMedia(id: string): Promise<void> {
    await apiClient.delete(`/media/${id}`);
  },
};
