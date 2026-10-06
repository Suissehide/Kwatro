-- CreateTable
CREATE TABLE "RatingChange" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "roomId" TEXT,
    "ratingBefore" INTEGER NOT NULL,
    "ratingAfter" INTEGER NOT NULL,
    "place" INTEGER NOT NULL,
    "opponentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RatingChange_profileId_createdAt_idx" ON "RatingChange"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "RatingChange" ADD CONSTRAINT "RatingChange_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerGameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingChange" ADD CONSTRAINT "RatingChange_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
