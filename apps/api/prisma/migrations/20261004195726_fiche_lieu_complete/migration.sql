-- CreateEnum
CREATE TYPE "ClosureKind" AS ENUM ('CLOSED', 'SPECIAL_HOURS');

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "accessibility" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "boardGameCount" INTEGER,
ADD COLUMN     "boardGameNote" TEXT,
ADD COLUMN     "boardGames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "quarter" TEXT,
ADD COLUMN     "tcgNote" TEXT,
ADD COLUMN     "transitInfo" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "VenueClosure" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "kind" "ClosureKind" NOT NULL DEFAULT 'CLOSED',
    "label" TEXT NOT NULL,
    "note" TEXT,
    "opensAtMinute" INTEGER,
    "closesAtMinute" INTEGER,

    CONSTRAINT "VenueClosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenuePhoto" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VenuePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenueClosure_venueId_endsOn_idx" ON "VenueClosure"("venueId", "endsOn");

-- CreateIndex
CREATE INDEX "VenuePhoto_venueId_order_idx" ON "VenuePhoto"("venueId", "order");

-- AddForeignKey
ALTER TABLE "VenueClosure" ADD CONSTRAINT "VenueClosure_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePhoto" ADD CONSTRAINT "VenuePhoto_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
