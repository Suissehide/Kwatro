-- Renommage Kwatro → Lucko : avantage partenaire et score Elo (LK)
ALTER TABLE "Venue" RENAME COLUMN "kwatroPerk" TO "luckoPerk";
ALTER TABLE "PlayerGameProfile" RENAME COLUMN "kwote" TO "rating";
