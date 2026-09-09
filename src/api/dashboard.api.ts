import { apiClient } from './client';
import { ApiResponse, DashboardData } from '@/types';

export const dashboardApi = {
  async getDashboard(): Promise<DashboardData> {
    const res = await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    return res.data.data;
  },
};
