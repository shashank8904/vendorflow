import type { Response } from "express";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginatedData,
  PaginationMeta,
} from "../types/api.types";

/**
 * Standardized API response builder.
 * Every response from the API passes through these methods to ensure
 * a consistent envelope format.
 */
export const ApiResponseBuilder = {
  /**
   * Send a success response.
   */
  success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
  ): void {
    const body: ApiSuccessResponse<T> = {
      success: true,
      message,
      data,
    };
    res.status(statusCode).json(body);
  },

  /**
   * Send an error response.
   */
  error(
    res: Response,
    message = "An error occurred",
    statusCode = 500,
    errors: string[] = []
  ): void {
    const body: ApiErrorResponse = {
      success: false,
      message,
      errors,
    };
    res.status(statusCode).json(body);
  },

  /**
   * Send a paginated success response.
   */
  paginated<T>(
    res: Response,
    items: T[],
    pagination: PaginationMeta,
    message = "Success"
  ): void {
    const body: PaginatedResponse<T> = {
      success: true,
      message,
      data: {
        items,
        pagination,
      },
    };
    res.status(200).json(body);
  },

  /**
   * Send a 201 Created response.
   */
  created<T>(res: Response, data: T, message = "Created successfully"): void {
    ApiResponseBuilder.success(res, data, message, 201);
  },

  /**
   * Send a 204 No Content response.
   */
  noContent(res: Response): void {
    res.status(204).send();
  },
} as const;
