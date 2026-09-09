import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Priority, StudyItem, StudyResource, StudyStatus, StudyType } from '@/types';

export interface StudyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: StudyType;
  status?: StudyStatus;
  priority?: Priority;
  tagId?: string;
  sortBy?: 'createdAt' | 'title' | 'progress' | 'targetDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStudyResourceDto {
  title: string;
  url?: string | null;
  type?: string | null;
  notes?: string | null;
}

export interface CreateStudyItemDto {
  title: string;
  description?: string | null;
  type?: StudyType;
  status?: StudyStatus;
  progress?: number;
  priority?: Priority;
  targetDate?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  tagIds?: string[];
  resources?: CreateStudyResourceDto[];
}

export type UpdateStudyItemDto = Partial<Omit<CreateStudyItemDto, 'resources'>>;

export const studylistApi = {
  async list(params?: StudyQueryParams): Promise<PaginatedResponse<StudyItem>> {
    const res = await apiClient.get<PaginatedResponse<StudyItem>>('/studylist', { params });
    return res.data;
  },

  async getById(id: string): Promise<StudyItem> {
    const res = await apiClient.get<ApiResponse<StudyItem>>(`/studylist/${id}`);
    return res.data.data;
  },

  async create(data: CreateStudyItemDto): Promise<StudyItem> {
    const res = await apiClient.post<ApiResponse<StudyItem>>('/studylist', data);
    return res.data.data;
  },

  async update(id: string, data: UpdateStudyItemDto): Promise<StudyItem> {
    const res = await apiClient.patch<ApiResponse<StudyItem>>(`/studylist/${id}`, data);
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/studylist/${id}`);
  },

  async addResource(studyId: string, data: CreateStudyResourceDto): Promise<StudyResource> {
    const res = await apiClient.post<ApiResponse<StudyResource>>(`/studylist/${studyId}/resources`, data);
    return res.data.data;
  },

  async updateResource(resourceId: string, data: Partial<CreateStudyResourceDto>): Promise<StudyResource> {
    const res = await apiClient.patch<ApiResponse<StudyResource>>(`/studylist/resources/${resourceId}`, data);
    return res.data.data;
  },

  async deleteResource(resourceId: string): Promise<void> {
    await apiClient.delete(`/studylist/resources/${resourceId}`);
  },
};
