-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "file_scans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "md5" TEXT NOT NULL,
    "sha1" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "signalsJson" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL,
    "nextStepsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "file_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "url_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "reasonsJson" TEXT NOT NULL,
    "tipsJson" TEXT NOT NULL,
    "metadataJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "url_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "file_scans_sha256_idx" ON "file_scans"("sha256");

-- CreateIndex
CREATE INDEX "file_scans_createdAt_idx" ON "file_scans"("createdAt");

-- CreateIndex
CREATE INDEX "file_scans_userId_idx" ON "file_scans"("userId");

-- CreateIndex
CREATE INDEX "url_checks_domain_idx" ON "url_checks"("domain");

-- CreateIndex
CREATE INDEX "url_checks_createdAt_idx" ON "url_checks"("createdAt");

-- CreateIndex
CREATE INDEX "url_checks_userId_idx" ON "url_checks"("userId");
