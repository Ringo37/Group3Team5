-- CreateTable
CREATE TABLE "_KnowhowAccess" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_KnowhowAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_KnowhowAccess_B_index" ON "_KnowhowAccess"("B");

-- CreateIndex
CREATE INDEX "AccessLog_knowhowId_idx" ON "AccessLog"("knowhowId");

-- CreateIndex
CREATE INDEX "AccessLog_userId_idx" ON "AccessLog"("userId");

-- CreateIndex
CREATE INDEX "Farm_cropId_idx" ON "Farm"("cropId");

-- CreateIndex
CREATE INDEX "Knowhow_farmId_idx" ON "Knowhow"("farmId");

-- CreateIndex
CREATE INDEX "Knowhow_userId_idx" ON "Knowhow"("userId");

-- CreateIndex
CREATE INDEX "NdaAgreement_providerId_idx" ON "NdaAgreement"("providerId");

-- CreateIndex
CREATE INDEX "NdaAgreement_learnerId_idx" ON "NdaAgreement"("learnerId");

-- CreateIndex
CREATE INDEX "WorkLog_farmId_idx" ON "WorkLog"("farmId");

-- CreateIndex
CREATE INDEX "WorkLog_userId_idx" ON "WorkLog"("userId");

-- CreateIndex
CREATE INDEX "WorkLog_date_idx" ON "WorkLog"("date");

-- AddForeignKey
ALTER TABLE "_KnowhowAccess" ADD CONSTRAINT "_KnowhowAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Knowhow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KnowhowAccess" ADD CONSTRAINT "_KnowhowAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
