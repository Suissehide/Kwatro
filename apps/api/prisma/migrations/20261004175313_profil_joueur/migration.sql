-- CreateEnum
CREATE TYPE "AvatarStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlayVibe" AS ENUM ('CHILL', 'COMPETITIVE', 'TEACHER', 'BEGINNER', 'HOMEBREW', 'SOCIAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "avatarStatus" "AvatarStatus",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "vibes" "PlayVibe"[] DEFAULT ARRAY[]::"PlayVibe"[];
