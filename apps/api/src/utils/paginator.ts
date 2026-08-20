import type { PaginationMeta, PrismaPageParams } from "../types/api.types";
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  DEFAULT_SORT,
  DEFAULT_ORDER,
} from "../constants";

/**
 * Parse raw query params into Prisma-compatible pagination params.
 */
export function buildPaginationParams(query: {
  page?: unknown;
  limit?: unknown;
  sort?: unknown;
  order?: unknown;
}): PrismaPageParams & { page: number; limit: number } {
  const page = Math.max(Number(query.page) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT
  );
  const sort = (typeof query.sort === "string" && query.sort) || DEFAULT_SORT;
  const order =
    typeof query.order === "string" && query.order === "asc" ? "asc" : DEFAULT_ORDER;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sort]: order },
  };
}

/**
 * Build pagination metadata from total count and current page params.
 */
export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
