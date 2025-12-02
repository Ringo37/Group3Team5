-- AlterTable
ALTER TABLE "WorkLog" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '作業日誌';

-- CreateTable
CREATE TABLE "_WorkLogTags" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_WorkLogTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkLogTags_B_index" ON "_WorkLogTags"("B");

-- AddForeignKey
ALTER TABLE "_WorkLogTags" ADD CONSTRAINT "_WorkLogTags_A_fkey" FOREIGN KEY ("A") REFERENCES "InterestTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkLogTags" ADD CONSTRAINT "_WorkLogTags_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
