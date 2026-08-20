/*
  Warnings:

  - Added the required column `contactPerson` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "notes" TEXT;
