import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Priority, TravelPlace, TravelStatus, Trip, TripStatus } from '@/types';

export interface TravelPlaceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: TravelStatus;
  priority?: Priority;
  tagId?: string;
  sortBy?: 'createdAt' | 'name' | 'estimatedBudget' | 'targetDate';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTravelPlaceDto {
  name: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  description?: string | null;
  priority?: Priority;
  status?: TravelStatus;
  estimatedBudget?: number | null;
  targetDate?: string | null;
  notes?: string | null;
  mediaAssetId?: string | null;
  tagIds?: string[];
}

export type UpdateTravelPlaceDto = Partial<CreateTravelPlaceDto>;

export interface TripQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TripStatus;
  sortBy?: 'createdAt' | 'name' | 'startDate' | 'budget';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTripDto {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  status?: TripStatus;
  notes?: string | null;
  mediaAssetId?: string | null;
  places?: { placeId: string; order?: number; notes?: string | null }[];
}

export type UpdateTripDto = Partial<Omit<CreateTripDto, 'places'>>;

export const travelApi = {
  // Places
  async listPlaces(params?: TravelPlaceQueryParams): Promise<PaginatedResponse<TravelPlace>> {
    const res = await apiClient.get<PaginatedResponse<TravelPlace>>('/travel/places', { params });
    return res.data;
  },

  async getPlace(id: string): Promise<TravelPlace> {
    const res = await apiClient.get<ApiResponse<TravelPlace>>(`/travel/places/${id}`);
    return res.data.data;
  },

  async createPlace(data: CreateTravelPlaceDto): Promise<TravelPlace> {
    const res = await apiClient.post<ApiResponse<TravelPlace>>('/travel/places', data);
    return res.data.data;
  },

  async updatePlace(id: string, data: UpdateTravelPlaceDto): Promise<TravelPlace> {
    const res = await apiClient.patch<ApiResponse<TravelPlace>>(`/travel/places/${id}`, data);
    return res.data.data;
  },

  async deletePlace(id: string): Promise<void> {
    await apiClient.delete(`/travel/places/${id}`);
  },

  // Trips
  async listTrips(params?: TripQueryParams): Promise<PaginatedResponse<Trip>> {
    const res = await apiClient.get<PaginatedResponse<Trip>>('/travel/trips', { params });
    return res.data;
  },

  async getTrip(id: string): Promise<Trip> {
    const res = await apiClient.get<ApiResponse<Trip>>(`/travel/trips/${id}`);
    return res.data.data;
  },

  async createTrip(data: CreateTripDto): Promise<Trip> {
    const res = await apiClient.post<ApiResponse<Trip>>('/travel/trips', data);
    return res.data.data;
  },

  async updateTrip(id: string, data: UpdateTripDto): Promise<Trip> {
    const res = await apiClient.patch<ApiResponse<Trip>>(`/travel/trips/${id}`, data);
    return res.data.data;
  },

  async deleteTrip(id: string): Promise<void> {
    await apiClient.delete(`/travel/trips/${id}`);
  },

  async addPlaceToTrip(tripId: string, data: { placeId: string; order?: number; notes?: string | null }): Promise<Trip> {
    const res = await apiClient.post<ApiResponse<Trip>>(`/travel/trips/${tripId}/places`, data);
    return res.data.data;
  },

  async removePlaceFromTrip(tripId: string, placeId: string): Promise<void> {
    await apiClient.delete(`/travel/trips/${tripId}/places/${placeId}`);
  },
};
