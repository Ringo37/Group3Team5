/*
  Warnings:

  - You are about to drop the column `farmType` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the column `mainCrops` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the `_OrganizationToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cropId` to the `Farm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_OrganizationToUser" DROP CONSTRAINT "_OrganizationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Farm" DROP COLUMN "farmType",
DROP COLUMN "mainCrops",
ADD COLUMN     "cropId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."_OrganizationToUser";

-- CreateTable
CREATE TABLE "Crop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OwnedOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OwnedOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Organization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Organization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE INDEX "_OwnedOrganization_B_index" ON "_OwnedOrganization"("B");

-- CreateIndex
CREATE INDEX "_Organization_B_index" ON "_Organization"("B");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OwnedOrganization" ADD CONSTRAINT "_OwnedOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OwnedOrganization" ADD CONSTRAINT "_OwnedOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Organization" ADD CONSTRAINT "_Organization_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Organization" ADD CONSTRAINT "_Organization_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
