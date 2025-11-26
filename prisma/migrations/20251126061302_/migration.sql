/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Knowhow" ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
ADD COLUMN     "fileId" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FileToWorkLog" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FileToWorkLog_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FileToWorkLog_B_index" ON "_FileToWorkLog"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knowhow" ADD CONSTRAINT "Knowhow_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToWorkLog" ADD CONSTRAINT "_FileToWorkLog_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToWorkLog" ADD CONSTRAINT "_FileToWorkLog_B_fkey" FOREIGN KEY ("B") REFERENCES "WorkLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
