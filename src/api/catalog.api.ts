import { apiClient } from './client';
import {
  ApiResponse,
  CatalogMovie,
  CatalogBook,
  CreateCatalogMovieDto,
  UpdateCatalogMovieDto,
  CreateCatalogBookDto,
  UpdateCatalogBookDto,
  AddMovieToShelfDto,
  AddBookToShelfDto,
  CatalogQueryParams,
  PaginatedResponse,
  Movie,
  ReadingItem,
  MediaAsset,
} from '@/types';

export const catalogApi = {
  // ==========================================
  // Movies Catalog
  // ==========================================
  async listMovies(params?: CatalogQueryParams): Promise<PaginatedResponse<CatalogMovie>> {
    const res = await apiClient.get<PaginatedResponse<CatalogMovie>>('/catalog/movies', { params });
    return res.data;
  },

  async getMovieById(id: string): Promise<CatalogMovie> {
    const res = await apiClient.get<ApiResponse<CatalogMovie>>(`/catalog/movies/${id}`);
    return res.data.data;
  },

  async createMovie(data: CreateCatalogMovieDto): Promise<CatalogMovie> {
    const res = await apiClient.post<ApiResponse<CatalogMovie>>('/catalog/movies', data);
    return res.data.data;
  },

  async updateMovie(id: string, data: UpdateCatalogMovieDto): Promise<CatalogMovie> {
    const res = await apiClient.put<ApiResponse<CatalogMovie>>(`/catalog/movies/${id}`, data);
    return res.data.data;
  },

  async deleteMovie(id: string): Promise<void> {
    await apiClient.delete(`/catalog/movies/${id}`);
  },

  async addMovieToShelf(id: string, options?: AddMovieToShelfDto): Promise<Movie> {
    const res = await apiClient.post<ApiResponse<Movie>>(`/catalog/movies/${id}/add-to-shelf`, options || {});
    return res.data.data;
  },

  // ==========================================
  // Books Catalog
  // ==========================================
  async listBooks(params?: CatalogQueryParams): Promise<PaginatedResponse<CatalogBook>> {
    const res = await apiClient.get<PaginatedResponse<CatalogBook>>('/catalog/books', { params });
    return res.data;
  },

  async getBookById(id: string): Promise<CatalogBook> {
    const res = await apiClient.get<ApiResponse<CatalogBook>>(`/catalog/books/${id}`);
    return res.data.data;
  },

  async createBook(data: CreateCatalogBookDto): Promise<CatalogBook> {
    const res = await apiClient.post<ApiResponse<CatalogBook>>('/catalog/books', data);
    return res.data.data;
  },

  async updateBook(id: string, data: UpdateCatalogBookDto): Promise<CatalogBook> {
    const res = await apiClient.put<ApiResponse<CatalogBook>>(`/catalog/books/${id}`, data);
    return res.data.data;
  },

  async deleteBook(id: string): Promise<void> {
    await apiClient.delete(`/catalog/books/${id}`);
  },

  async addBookToShelf(id: string, options?: AddBookToShelfDto): Promise<ReadingItem> {
    const res = await apiClient.post<ApiResponse<ReadingItem>>(`/catalog/books/${id}/add-to-shelf`, options || {});
    return res.data.data;
  },

  // ==========================================
  // Catalog Cover Upload (Admin)
  // ==========================================
  async uploadCover(file: File): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<MediaAsset>>('/catalog/upload-cover', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
};
