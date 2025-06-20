-- CreateEnum
CREATE TYPE "Realm" AS ENUM ('XIANXIA', 'GAMELIT', 'APOCALYPSE', 'ISEKAI');

-- CreateTable
CREATE TABLE "RealmBoss" (
    "id" TEXT NOT NULL,
    "realm" "Realm" NOT NULL,
    "name" TEXT NOT NULL,
    "maxHitpoints" INTEGER NOT NULL DEFAULT 10000,
    "currentHitpoints" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealmBoss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "realmBossId" TEXT NOT NULL,
    "minutesRead" INTEGER NOT NULL,
    "bookId" TEXT,
    "damage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RealmBoss_realm_key" ON "RealmBoss"("realm");

-- AddForeignKey
ALTER TABLE "BattleActivity" ADD CONSTRAINT "BattleActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleActivity" ADD CONSTRAINT "BattleActivity_realmBossId_fkey" FOREIGN KEY ("realmBossId") REFERENCES "RealmBoss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleActivity" ADD CONSTRAINT "BattleActivity_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
