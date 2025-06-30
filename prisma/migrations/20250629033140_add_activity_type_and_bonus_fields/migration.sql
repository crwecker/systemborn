-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('READING', 'WRITING', 'REVIEW', 'TIER_ASSIGNMENT', 'READING_STATUS', 'BOSS_VICTORY');

-- AlterTable
ALTER TABLE "BattleActivity" ADD COLUMN     "activityType" "ActivityType" NOT NULL DEFAULT 'READING',
ADD COLUMN     "isBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceActivityId" TEXT;
