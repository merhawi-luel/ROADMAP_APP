/*
  Warnings:

  - You are about to drop the column `duration` on the `PlannerEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlannerEntry" DROP COLUMN "duration",
ADD COLUMN     "timeFrom" TEXT,
ADD COLUMN     "timeTo" TEXT;
