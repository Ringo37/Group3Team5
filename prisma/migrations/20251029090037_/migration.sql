/*
  Warnings:

  - Added the required column `name` to the `Farm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "name" TEXT NOT NULL;
