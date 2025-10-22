/*
  Warnings:

  - You are about to drop the column `full_text` on the `Knowhow` table. All the data in the column will be lost.
  - You are about to drop the column `sensitivity` on the `Knowhow` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Knowhow` table. All the data in the column will be lost.
  - Added the required column `visibility` to the `Knowhow` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'SUMMARY_ONLY', 'RESTRICTED');

-- AlterTable
ALTER TABLE "Knowhow" DROP COLUMN "full_text",
DROP COLUMN "sensitivity",
DROP COLUMN "tags",
ADD COLUMN     "fullText" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL;

-- CreateTable
CREATE TABLE "_InterestTagToKnowhow" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InterestTagToKnowhow_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InterestTagToKnowhow_B_index" ON "_InterestTagToKnowhow"("B");

-- AddForeignKey
ALTER TABLE "_InterestTagToKnowhow" ADD CONSTRAINT "_InterestTagToKnowhow_A_fkey" FOREIGN KEY ("A") REFERENCES "InterestTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterestTagToKnowhow" ADD CONSTRAINT "_InterestTagToKnowhow_B_fkey" FOREIGN KEY ("B") REFERENCES "Knowhow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
