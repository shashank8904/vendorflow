import { vendorRepository } from "../repositories/vendor.repository";
import { auditLogService } from "./audit-log.service";
import { ConflictError, NotFoundError } from "../errors";
import { AUDIT_ACTIONS, ENTITIES } from "../constants";
import { buildPaginationParams, buildPaginationMeta } from "../utils/paginator";
import type { CreateVendorInput, UpdateVendorInput, VendorQueryInput } from "../validators/vendor.validator";

/**
 * Vendor business logic.
 */
class VendorService {
  /**
   * Create a new vendor with duplicate checks.
   */
  async createVendor(companyId: string, data: CreateVendorInput) {
    // Check duplicate email
    if (data.email) {
      const emailExists = await vendorRepository.existsByEmail(companyId, data.email);
      if (emailExists) {
        throw new ConflictError(`A vendor with email '${data.email}' already exists`);
      }
    }

    // Check duplicate phone
    const phoneExists = await vendorRepository.existsByPhone(companyId, data.phone);
    if (phoneExists) {
      throw new ConflictError(`A vendor with phone '${data.phone}' already exists`);
    }

    const vendor = await vendorRepository.create(companyId, data);

    // Audit log (fire and forget)
    auditLogService
      .log(companyId, AUDIT_ACTIONS.VENDOR_CREATED, ENTITIES.VENDOR, vendor.id, { data })
      .catch(() => {});

    return vendor;
  }

  /**
   * List vendors with pagination, search, and filtering.
   */
  async getVendors(companyId: string, query: VendorQueryInput) {
    const { skip, take, orderBy, page, limit } = buildPaginationParams(query);

    const [vendors, totalItems] = await Promise.all([
      vendorRepository.findAll(companyId, {
        skip,
        take,
        orderBy,
        search: query.search,
        status: query.status,
      }),
      vendorRepository.count(companyId, query.search, query.status),
    ]);

    const pagination = buildPaginationMeta(totalItems, page, limit);
    return { vendors, pagination };
  }

  /**
   * Get a single vendor by ID.
   */
  async getVendorById(companyId: string, id: string) {
    const vendor = await vendorRepository.findById(companyId, id);
    if (!vendor) {
      throw new NotFoundError("Vendor", id);
    }
    return vendor;
  }

  /**
   * Update a vendor with duplicate checks.
   */
  async updateVendor(companyId: string, id: string, data: UpdateVendorInput) {
    // Ensure the vendor exists
    await this.getVendorById(companyId, id);

    // Check duplicate email (excluding current vendor)
    if (data.email) {
      const emailExists = await vendorRepository.existsByEmail(companyId, data.email, id);
      if (emailExists) {
        throw new ConflictError(`A vendor with email '${data.email}' already exists`);
      }
    }

    // Check duplicate phone (excluding current vendor)
    if (data.phone) {
      const phoneExists = await vendorRepository.existsByPhone(companyId, data.phone, id);
      if (phoneExists) {
        throw new ConflictError(`A vendor with phone '${data.phone}' already exists`);
      }
    }

    const vendor = await vendorRepository.update(companyId, id, data);

    auditLogService
      .log(companyId, AUDIT_ACTIONS.VENDOR_UPDATED, ENTITIES.VENDOR, id, { changes: data })
      .catch(() => {});

    return vendor;
  }

  /**
   * Soft-delete a vendor.
   */
  async deleteVendor(companyId: string, id: string) {
    await this.getVendorById(companyId, id);
    await vendorRepository.softDelete(companyId, id);

    auditLogService
      .log(companyId, AUDIT_ACTIONS.VENDOR_DELETED, ENTITIES.VENDOR, id)
      .catch(() => {});
  }
}

export const vendorService = new VendorService();