CREATE TABLE "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "folio" TEXT NOT NULL,
  "shift" TEXT NOT NULL DEFAULT 'MANANA',
  "reportDate" DATETIME NOT NULL,
  "reportTime" TEXT NOT NULL,
  "generatedBy" TEXT NOT NULL DEFAULT '',
  "formData" TEXT NOT NULL,
  "calculations" TEXT NOT NULL,
  "totals" TEXT NOT NULL,
  "screenshot" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Report_folio_key" ON "Report"("folio");
CREATE INDEX "Report_reportDate_idx" ON "Report"("reportDate");
CREATE INDEX "Report_shift_idx" ON "Report"("shift");
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");
