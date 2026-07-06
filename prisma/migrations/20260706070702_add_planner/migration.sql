-- CreateTable
CREATE TABLE "PlannerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER,
    "notes" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "checklistItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannerEntry_userId_date_idx" ON "PlannerEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "PlannerEntry" ADD CONSTRAINT "PlannerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerEntry" ADD CONSTRAINT "PlannerEntry_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
