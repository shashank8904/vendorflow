-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_companyId_deletedAt_isRead_idx" ON "Notification"("companyId", "deletedAt", "isRead");

-- CreateIndex
CREATE INDEX "Notification_companyId_userId_idx" ON "Notification"("companyId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_entity_idx" ON "AuditLog"("companyId", "entity");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Call_purchaseOrderId_idx" ON "Call"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Call_vendorId_idx" ON "Call"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_deletedAt_idx" ON "PurchaseOrder"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_status_idx" ON "PurchaseOrder"("companyId", "status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_vendorId_idx" ON "PurchaseOrder"("companyId", "vendorId");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Vendor_companyId_deletedAt_idx" ON "Vendor"("companyId", "deletedAt");

-- CreateIndex
CREATE INDEX "Vendor_companyId_email_idx" ON "Vendor"("companyId", "email");

-- CreateIndex
CREATE INDEX "Vendor_companyId_phone_idx" ON "Vendor"("companyId", "phone");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
