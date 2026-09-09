import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Plan, PlanStatus, PlanType, Priority } from '@/types';

export interface PlanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: PlanType;
  status?: PlanStatus;
  priority?: Priority;
  tagId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'scheduledDate' | 'createdAt' | 'title' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlanDto {
  title: string;
  description?: string | null;
  type?: PlanType;
  scheduledDate?: string | null;
  priority?: Priority;
  status?: PlanStatus;
  notes?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  tagIds?: string[];
}

export type UpdatePlanDto = Partial<CreatePlanDto>;

export const plansApi = {
  async list(params?: PlanQueryParams): Promise<PaginatedResponse<Plan>> {
    const res = await apiClient.get<PaginatedResponse<Plan>>('/plans', { params });
    return res.data;
  },

  async getById(id: string): Promise<Plan> {
    const res = await apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
    return res.data.data;
  },

  async create(data: CreatePlanDto): Promise<Plan> {
    const res = await apiClient.post<ApiResponse<Plan>>('/plans', data);
    return res.data.data;
  },

  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    const res = await apiClient.patch<ApiResponse<Plan>>(`/plans/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/plans/${id}`);
  },
};
