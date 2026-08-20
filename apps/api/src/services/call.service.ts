import { callRepository } from "../repositories/call.repository";
import type { CallQueryInput } from "../validators/call.validator";
import type { CallStatus } from "@prisma/client";
import { NotFoundError } from "../errors";

/**
 * Call business logic.
 */
export const callService = {
  /**
   * List calls for a company with pagination and filtering.
   */
  async getCalls(companyId: string, query: CallQueryInput) {
    const { page, limit, sort, order, status, purchaseOrderId, vendorId } =
      query;

    const skip = (page - 1) * limit;
    const orderBy = { [sort]: order };

    const [calls, total] = await Promise.all([
      callRepository.findAll(companyId, {
        skip,
        take: limit,
        orderBy,
        status: status as CallStatus | undefined,
        purchaseOrderId,
        vendorId,
      }),
      callRepository.count(
        companyId,
        status as CallStatus | undefined,
        purchaseOrderId,
        vendorId
      ),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      calls,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  /**
   * Get a single call by ID, scoped to a company.
   */
  async getCallById(companyId: string, id: string) {
    const call = await callRepository.findById(companyId, id);
    if (!call) {
      throw new NotFoundError("Call", id);
    }
    return call;
  },
};
