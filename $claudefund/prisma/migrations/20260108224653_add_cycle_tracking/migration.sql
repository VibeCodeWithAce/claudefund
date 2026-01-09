-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Idea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "fundedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cycleId" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Idea" ("createdAt", "description", "email", "fundedAt", "id", "likes", "status", "title") SELECT "createdAt", "description", "email", "fundedAt", "id", "likes", "status", "title" FROM "Idea";
DROP TABLE "Idea";
ALTER TABLE "new_Idea" RENAME TO "Idea";
CREATE INDEX "Idea_status_idx" ON "Idea"("status");
CREATE INDEX "Idea_likes_idx" ON "Idea"("likes");
CREATE INDEX "Idea_cycleId_idx" ON "Idea"("cycleId");
CREATE INDEX "Idea_email_cycleId_idx" ON "Idea"("email", "cycleId");
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "submissionsPaused" BOOLEAN NOT NULL DEFAULT false,
    "winnerSelectionPaused" BOOLEAN NOT NULL DEFAULT false,
    "lastWinnerSelection" DATETIME,
    "nextSelectionTime" DATETIME,
    "currentCycle" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Settings" ("id", "lastWinnerSelection", "nextSelectionTime", "submissionsPaused", "winnerSelectionPaused") SELECT "id", "lastWinnerSelection", "nextSelectionTime", "submissionsPaused", "winnerSelectionPaused" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
