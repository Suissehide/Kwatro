-- KWT-8 : modèle de données J1 (fiche lieu, événements, inscriptions).
-- Migration générée par Prisma puis ajustée à la main :
--   * les jeux de Event.gameId sont recopiés dans _EventGames AVANT la suppression de la colonne ;
--   * Event.updatedAt est rempli pour les lignes existantes ;
--   * contrôles CHECK (non gérés par Prisma) sur les valeurs métier.

-- CreateEnum
CREATE TYPE "RegistrationMode" AS ENUM ('NONE', 'IN_APP', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CANCELLED');

-- AlterTable : nouveaux champs de la fiche lieu
ALTER TABLE "Venue" ADD COLUMN     "description" TEXT,
ADD COLUMN     "kwatroPerk" TEXT,
ADD COLUMN     "minSpendCents" INTEGER,
ADD COLUMN     "playFeeCents" INTEGER;

-- CreateTable
CREATE TABLE "VenueOpeningHours" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "opensAtMinute" INTEGER NOT NULL,
    "closesAtMinute" INTEGER NOT NULL,

    CONSTRAINT "VenueOpeningHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateTable
CREATE TABLE "_VenueGames" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_VenueGames_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventGames" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventGames_AB_pkey" PRIMARY KEY ("A","B")
);

-- Reprise des données : Event.gameId → _EventGames (A = Event, B = Game)
INSERT INTO "_EventGames" ("A", "B") SELECT "id", "gameId" FROM "Event" WHERE "gameId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_gameId_fkey";

-- AlterTable : updatedAt rempli pour les lignes existantes, puis sans valeur par défaut (géré par Prisma)
ALTER TABLE "Event" DROP COLUMN "gameId",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "registrationMode" "RegistrationMode" NOT NULL DEFAULT 'IN_APP',
ADD COLUMN     "seriesId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "VenueOpeningHours_venueId_idx" ON "VenueOpeningHours"("venueId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE INDEX "_VenueGames_B_index" ON "_VenueGames"("B");

-- CreateIndex
CREATE INDEX "_EventGames_B_index" ON "_EventGames"("B");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");

-- CreateIndex
CREATE INDEX "Event_seriesId_idx" ON "Event"("seriesId");

-- AddForeignKey
ALTER TABLE "VenueOpeningHours" ADD CONSTRAINT "VenueOpeningHours_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VenueGames" ADD CONSTRAINT "_VenueGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VenueGames" ADD CONSTRAINT "_VenueGames_B_fkey" FOREIGN KEY ("B") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventGames" ADD CONSTRAINT "_EventGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventGames" ADD CONSTRAINT "_EventGames_B_fkey" FOREIGN KEY ("B") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contrôles métier (la base refuse les valeurs incohérentes, quelle que soit l'origine de l'écriture)
ALTER TABLE "VenueOpeningHours" ADD CONSTRAINT "VenueOpeningHours_weekday_check" CHECK ("weekday" BETWEEN 1 AND 7);
ALTER TABLE "VenueOpeningHours" ADD CONSTRAINT "VenueOpeningHours_minutes_check"
  CHECK ("opensAtMinute" BETWEEN 0 AND 1439 AND "closesAtMinute" BETWEEN 0 AND 1439);
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_prices_check"
  CHECK (("playFeeCents" IS NULL OR "playFeeCents" >= 0) AND ("minSpendCents" IS NULL OR "minSpendCents" >= 0));
ALTER TABLE "Event" ADD CONSTRAINT "Event_values_check"
  CHECK (("capacity" IS NULL OR "capacity" > 0)
     AND ("priceCents" IS NULL OR "priceCents" >= 0)
     AND ("minAge" IS NULL OR "minAge" BETWEEN 0 AND 99)
     AND ("endsAt" IS NULL OR "endsAt" > "startsAt"));
ALTER TABLE "Event" ADD CONSTRAINT "Event_external_url_check"
  CHECK ("registrationMode" <> 'EXTERNAL' OR "externalUrl" IS NOT NULL);
