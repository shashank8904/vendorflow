import prisma from "../lib/prisma";
import type { CreateVendorInput, UpdateVendorInput } from "../validators/vendor.validator";
import type { Prisma } from "@prisma/client";

/**
 * Vendor data access layer.
 * All queries enforce companyId scoping and soft-delete filtering.
 */
export class VendorRepository {
  /**
   * Create a new vendor.
   */
  async create(companyId: string, data: CreateVendorInput) {
    return prisma.vendor.create({
      data: {
        companyId,
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        gstNumber: data.gstNumber,
        notes: data.notes,
      },
    });
  }

  /**
   * Find all vendors with pagination, search, and filtering.
   */
  async findAll(
    companyId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Record<string, "asc" | "desc">;
      search?: string;
      status?: "ACTIVE" | "INACTIVE";
    }
  ) {
    const where = this.buildWhereClause(companyId, params.search, params.status);

    return prisma.vendor.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });
  }

  /**
   * Count vendors matching the given filters.
   */
  async count(
    companyId: string,
    search?: string,
    status?: "ACTIVE" | "INACTIVE"
  ): Promise<number> {
    const where = this.buildWhereClause(companyId, search, status);
    return prisma.vendor.count({ where });
  }

  /**
   * Find a single vendor by ID within a company.
   */
  async findById(companyId: string, id: string) {
    return prisma.vendor.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        purchaseOrders: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            purchaseOrders: true,
            calls: true,
          },
        },
      },
    });
  }

  /**
   * Update a vendor.
   */
  async update(companyId: string, id: string, data: UpdateVendorInput) {
    return prisma.vendor.update({
      where: { id, companyId, deletedAt: null } as Prisma.VendorWhereUniqueInput,
      data,
    });
  }

  /**
   * Soft-delete a vendor by setting deletedAt.
   */
  async softDelete(companyId: string, id: string) {
    return prisma.vendor.update({
      where: { id, companyId, deletedAt: null } as Prisma.VendorWhereUniqueInput,
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check if a vendor with the given email exists in this company (excluding a specific ID).
   */
  async existsByEmail(
    companyId: string,
    email: string,
    excludeId?: string
  ): Promise<boolean> {
    const count = await prisma.vendor.count({
      where: {
        companyId,
        email,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Check if a vendor with the given phone exists in this company (excluding a specific ID).
   */
  async existsByPhone(
    companyId: string,
    phone: string,
    excludeId?: string
  ): Promise<boolean> {
    const count = await prisma.vendor.count({
      where: {
        companyId,
        phone,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return count > 0;
  }

  /**
   * Build Prisma where clause for vendor queries.
   */
  private buildWhereClause(
    companyId: string,
    search?: string,
    status?: "ACTIVE" | "INACTIVE"
  ): Prisma.VendorWhereInput {
    const where: Prisma.VendorWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    return where;
  }
}

export const vendorRepository = new VendorRepository();