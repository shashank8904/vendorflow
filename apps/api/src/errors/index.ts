import { AppError } from "./app-error";

export { AppError } from "./app-error";

// ─── 400 Bad Request ─────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: string[] = []) {
    super(message, 400, true, errors);
  }
}

// ─── 401 Unauthorized ────────────────────────────────────────────────────────

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

// ─── 403 Forbidden ───────────────────────────────────────────────────────────

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

// ─── 404 Not Found ───────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(entity = "Resource", id?: string) {
    const message = id ? `${entity} with id '${id}' not found` : `${entity} not found`;
    super(message, 404);
  }
}

// ─── 409 Conflict ────────────────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

// ─── 500 Internal Server Error ───────────────────────────────────────────────

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, false);
  }
}
