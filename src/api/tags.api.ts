import { apiClient } from './client';
import { ApiResponse, Tag } from '@/types';

export interface TagWithCount extends Tag {
  itemCount?: number;
}

export const tagsApi = {
  async list(): Promise<TagWithCount[]> {
    const res = await apiClient.get<ApiResponse<TagWithCount[]>>('/tags');
    return res.data.data;
  },

  async create(data: { name: string; color?: string }): Promise<Tag> {
    const res = await apiClient.post<ApiResponse<Tag>>('/tags', data);
    return res.data.data;
  },

  async update(id: string, data: { name?: string; color?: string }): Promise<Tag> {
    const res = await apiClient.patch<ApiResponse<Tag>>(`/tags/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
