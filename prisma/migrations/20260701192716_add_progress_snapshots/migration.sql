-- CreateTable
CREATE TABLE "ProgressSnapshot" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "completedItems" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProgressSnapshot_roadmapId_createdAt_idx" ON "ProgressSnapshot"("roadmapId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProgressSnapshot" ADD CONSTRAINT "ProgressSnapshot_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
