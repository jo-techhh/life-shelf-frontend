import { apiClient } from './client';
import { ApiResponse, AuthResponse, User } from '@/types';

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  avatarUrl?: string;
}

export const authApi = {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  async getMe(): Promise<{ user: User; cloudStorageConfigured: boolean }> {
    const res = await apiClient.get<ApiResponse<{ user: User; cloudStorageConfigured: boolean }>>('/auth/me');
    return res.data.data;
  },

  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const res = await apiClient.patch<ApiResponse<User>>('/auth/profile', data);
    return res.data.data;
  },

  async changePassword(data: ChangePasswordDto): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
    return res.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
