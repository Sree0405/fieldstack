-- CreateTable "files"
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable "site_info"
CREATE TABLE "site_info" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteTitle" TEXT,
    "siteDescription" TEXT,
    "siteUrl" TEXT,
    "logoId" TEXT,
    "faviconId" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "socialLinks" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_info_pkey" PRIMARY KEY ("id")
);

-- AlterTable "fields"
ALTER TABLE "fields" ADD COLUMN "isFileField" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "fields" ADD COLUMN "acceptedFileTypes" TEXT;
ALTER TABLE "fields" ADD COLUMN "maxFileSize" INTEGER;
ALTER TABLE "fields" ADD COLUMN "metadata" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "files_path_key" ON "files"("path");

