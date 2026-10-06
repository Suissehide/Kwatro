-- CreateTable
CREATE TABLE "KwoteChange" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "roomId" TEXT,
    "kwoteBefore" INTEGER NOT NULL,
    "kwoteAfter" INTEGER NOT NULL,
    "place" INTEGER NOT NULL,
    "opponentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KwoteChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KwoteChange_profileId_createdAt_idx" ON "KwoteChange"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "KwoteChange" ADD CONSTRAINT "KwoteChange_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerGameProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KwoteChange" ADD CONSTRAINT "KwoteChange_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
