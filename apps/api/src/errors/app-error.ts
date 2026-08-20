/**
 * Base application error class.
 * All custom errors extend this so the global error handler can distinguish
 * operational errors (user-facing) from unexpected crashes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: string[];

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Preserve proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
