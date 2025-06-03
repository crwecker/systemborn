/*
  Warnings:

  - A unique constraint covering the columns `[bookId,createdAt]` on the table `BookStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookStats_bookId_createdAt_key" ON "BookStats"("bookId", "createdAt");
