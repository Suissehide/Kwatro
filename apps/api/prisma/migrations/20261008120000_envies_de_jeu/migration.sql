-- AlterEnum
ALTER TYPE "NotificationTopic" ADD VALUE 'GAMES';

-- CreateEnum
CREATE TYPE "PlayWhen" AS ENUM ('EVENING', 'WEEKEND', 'ANY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "playWhen" "PlayWhen" NOT NULL DEFAULT 'ANY';

-- CreateTable
CREATE TABLE "PlayIntent" (
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayIntent_pkey" PRIMARY KEY ("userId","gameId")
);

-- CreateIndex
CREATE INDEX "PlayIntent_gameId_expiresAt_idx" ON "PlayIntent"("gameId", "expiresAt");

-- AddForeignKey
ALTER TABLE "PlayIntent" ADD CONSTRAINT "PlayIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayIntent" ADD CONSTRAINT "PlayIntent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
