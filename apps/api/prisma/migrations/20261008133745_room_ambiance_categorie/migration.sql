-- CreateEnum
CREATE TYPE "RoomVibe" AS ENUM ('CHILL', 'COMPETITIVE', 'BEGINNERS_WELCOME', 'LENDS_DECKS', 'ENGLISH_OK');

-- CreateEnum
CREATE TYPE "BoardGameCategory" AS ENUM ('STRATEGY', 'AMBIANCE', 'COOPERATIVE', 'FAMILY', 'INVESTIGATION', 'ROLE_PLAYING', 'WARGAME', 'PARTY');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "boardGameCategory" "BoardGameCategory",
ADD COLUMN     "vibes" "RoomVibe"[] DEFAULT ARRAY[]::"RoomVibe"[];
