import { apiClient } from './client';
import { ApiResponse, Movie, Series, User } from '@/types';

export interface PublicWatchListUser {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface PublicWatchList {
  user: PublicWatchListUser;
  movies: Movie[];
  series: Series[];
}

export interface ShareStatusResponse {
  isActive: boolean;
  token?: string;
  shareUrl?: string;
  includeMovies?: boolean;
  includeSeries?: boolean;
}

export const shareApi = {
  async getStatus(): Promise<ShareStatusResponse> {
    const res = await apiClient.get<ApiResponse<ShareStatusResponse>>('/share/watch/status');
    return res.data.data;
  },

  async enable(): Promise<ShareStatusResponse> {
    const res = await apiClient.post<ApiResponse<ShareStatusResponse>>('/share/watch');
    return res.data.data;
  },

  async revoke(): Promise<void> {
    await apiClient.delete('/share/watch');
  },

  async getPublicWatchList(token: string): Promise<PublicWatchList> {
    const res = await apiClient.get<ApiResponse<PublicWatchList>>(`/public/watch/${token}`);
    return res.data.data;
  },
};
