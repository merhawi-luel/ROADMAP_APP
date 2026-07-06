-- CreateTable
CREATE TABLE "SocialLinks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedin" TEXT,
    "instagram" TEXT,
    "telegram" TEXT,
    "leetcode" TEXT,
    "codeforces" TEXT,
    "github" TEXT,
    "x" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLinks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinks_userId_key" ON "SocialLinks"("userId");

-- AddForeignKey
ALTER TABLE "SocialLinks" ADD CONSTRAINT "SocialLinks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
