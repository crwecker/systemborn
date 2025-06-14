-- CreateEnum
CREATE TYPE "ContributorType" AS ENUM ('AUTHOR', 'ILLUSTRATOR', 'PUBLISHER', 'EDITOR', 'TRANSLATOR', 'NARRATOR', 'COVER_ARTIST');

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "linkToContributor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookContributor" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "contributorType" "ContributorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookContributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookContributor_bookId_contributorId_contributorType_key" ON "BookContributor"("bookId", "contributorId", "contributorType");

-- AddForeignKey
ALTER TABLE "BookContributor" ADD CONSTRAINT "BookContributor_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookContributor" ADD CONSTRAINT "BookContributor_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
