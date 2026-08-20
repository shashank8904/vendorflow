/**
 * Shared API types used across all modules.
 */

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<PaginatedData<T>> {}

export interface PaginationParams {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  search?: string;
}

export interface PrismaPageParams {
  skip: number;
  take: number;
  orderBy: Record<string, "asc" | "desc">;
}

// ─── Filter params ───────────────────────────────────────────────────────────

export interface BaseQueryParams extends PaginationParams {
  [key: string]: unknown;
}
