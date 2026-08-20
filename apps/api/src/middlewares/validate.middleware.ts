import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

/**
 * Generic Zod validation middleware factory.
 *
 * Validates `req.body`, `req.query`, and/or `req.params` against the
 * provided Zod schemas. If validation fails, the ZodError is forwarded
 * to the global error handler.
 *
 * Uses Object.defineProperty to safely set parsed and coerced values
 * on Express 5's read-only getters for query, params, and body.
 *
 * @example
 * router.post("/", validate({ body: createVendorSchema }), controller.create);
 * router.get("/", validate({ query: vendorQuerySchema }), controller.getAll);
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.params) {
      const parsedParams = schemas.params.parse(req.params);
      Object.defineProperty(req, "params", {
        value: parsedParams,
        writable: true,
        configurable: true,
      });
    }

    if (schemas.query) {
      const parsedQuery = schemas.query.parse(req.query);
      Object.defineProperty(req, "query", {
        value: parsedQuery,
        writable: true,
        configurable: true,
      });
    }

    if (schemas.body) {
      const parsedBody = schemas.body.parse(req.body);
      Object.defineProperty(req, "body", {
        value: parsedBody,
        writable: true,
        configurable: true,
      });
    }

    next();
  };
}
