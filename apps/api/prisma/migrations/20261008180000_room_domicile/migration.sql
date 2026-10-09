-- AlterEnum
ALTER TYPE "ReportReason" ADD VALUE 'SAFETY';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "homeSafetyVersion" INTEGER;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "homeAddressEncrypted",
ADD COLUMN     "fuzzyLat" DOUBLE PRECISION,
ADD COLUMN     "fuzzyLng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "RoomPrivateAddress" (
    "roomId" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "keyVersion" INTEGER NOT NULL,

    CONSTRAINT "RoomPrivateAddress_pkey" PRIMARY KEY ("roomId")
);

-- AddForeignKey
ALTER TABLE "RoomPrivateAddress" ADD CONSTRAINT "RoomPrivateAddress_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

