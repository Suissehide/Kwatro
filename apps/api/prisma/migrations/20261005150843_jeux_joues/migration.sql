-- CreateTable
CREATE TABLE "_PlayedGames" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlayedGames_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PlayedGames_B_index" ON "_PlayedGames"("B");

-- AddForeignKey
ALTER TABLE "_PlayedGames" ADD CONSTRAINT "_PlayedGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayedGames" ADD CONSTRAINT "_PlayedGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
