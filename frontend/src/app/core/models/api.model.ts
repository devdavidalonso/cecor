export interface PaginatedResponse<T> {
    data: T[];
    totalItems: number;
    totalPages: number;
    page: number;
    pageSize: number;
  }