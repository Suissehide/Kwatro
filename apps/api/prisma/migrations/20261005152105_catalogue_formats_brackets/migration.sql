-- AlterTable
ALTER TABLE "GameFormat" ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "hasBrackets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxPlayers" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "minPlayers" INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "bracket" INTEGER;
