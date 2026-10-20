/*
  Warnings:

  - Made the column `country` on table `CommonName` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CommonName" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT '';
