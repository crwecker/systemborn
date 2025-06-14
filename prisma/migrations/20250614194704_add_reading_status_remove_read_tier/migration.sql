/*
  Warnings:

  - The values [READ] on the enum `TierLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('WANT_TO_READ', 'READING', 'FINISHED');

-- AlterEnum
BEGIN;
CREATE TYPE "TierLevel_new" AS ENUM ('SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F');
ALTER TABLE "BookTier" ALTER COLUMN "tier" TYPE "TierLevel_new" USING ("tier"::text::"TierLevel_new");
ALTER TYPE "TierLevel" RENAME TO "TierLevel_old";
ALTER TYPE "TierLevel_new" RENAME TO "TierLevel";
DROP TYPE "TierLevel_old";
COMMIT;

-- AlterTable
ALTER TABLE "BookTier" ADD COLUMN     "readingStatus" "ReadingStatus" NOT NULL DEFAULT 'FINISHED';
