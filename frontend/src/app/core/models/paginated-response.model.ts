// src/app/core/models/paginated-response.model.ts
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }