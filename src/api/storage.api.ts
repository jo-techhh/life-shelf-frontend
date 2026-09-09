import { apiClient } from './client';
import { ApiResponse, CloudStorageConfig } from '@/types';

export interface ConfigureCloudinaryDto {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export const storageApi = {
  async getConfig(): Promise<CloudStorageConfig | null> {
    const res = await apiClient.get<ApiResponse<CloudStorageConfig | null>>('/storage');
    return res.data.data;
  },

  async configureCloudinary(data: ConfigureCloudinaryDto): Promise<CloudStorageConfig> {
    const res = await apiClient.post<ApiResponse<CloudStorageConfig>>('/storage/cloudinary', data);
    return res.data.data;
  },

  async deleteConfig(): Promise<void> {
    await apiClient.delete('/storage/cloudinary');
  },
};
