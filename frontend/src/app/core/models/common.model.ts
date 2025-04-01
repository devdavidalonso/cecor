// src/app/core/models/common.model.ts

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
  
  export interface ApiError {
    code: string;
    message: string;
    details?: any;
  }