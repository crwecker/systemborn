-- CreateEnum
CREATE TYPE "StoryEntryType" AS ENUM ('BOSS_INTRODUCTION', 'BATTLE_ACTION', 'BOSS_DEFEAT', 'BOSS_RESPAWN', 'MILESTONE');

-- CreateTable
CREATE TABLE "BattleStory" (
    "id" TEXT NOT NULL,
    "realmBossId" TEXT NOT NULL,
    "entryType" "StoryEntryType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleStory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BattleStory" ADD CONSTRAINT "BattleStory_realmBossId_fkey" FOREIGN KEY ("realmBossId") REFERENCES "RealmBoss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
