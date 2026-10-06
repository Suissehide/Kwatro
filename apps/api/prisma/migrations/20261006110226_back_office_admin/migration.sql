-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('PENDING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ReportResolution" AS ENUM ('DISMISSED', 'WARNED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdminActionKind" AS ENUM ('REPORT_DISMISS', 'REPORT_WARN', 'REPORT_SUSPEND', 'USER_SUSPEND', 'USER_UNSUSPEND', 'AVATAR_APPROVE', 'AVATAR_REJECT', 'VENUE_UPDATE', 'EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_CANCEL', 'GAME_MERGE');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "resolution" "ReportResolution";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedReason" TEXT,
ADD COLUMN     "suspendedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "status" "VenueStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminActionKind" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAction_targetId_idx" ON "AdminAction"("targetId");

-- CreateIndex
CREATE INDEX "AdminAction_createdAt_idx" ON "AdminAction"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
