/*
  Warnings:

  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hasCreatedBy` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasMetadata` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasSlug` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasSoftDelete` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasStatus` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasTimestamps` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasUpdatedBy` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasVersioning` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `hasVisibility` on the `collections` table. All the data in the column will be lost.
  - You are about to drop the column `allowedFileTypes` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `defaultValue` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `filterable` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `helpText` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `indexed` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `isHidden` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `isReadOnly` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `maxFileSize` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `maxLength` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `maxValue` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `minLength` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `minValue` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `pattern` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `placeholder` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `relationCollectionId` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `relationType` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `searchable` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `sortable` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `uiComponent` on the `fields` table. All the data in the column will be lost.
  - You are about to drop the column `unique` on the `fields` table. All the data in the column will be lost.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "collectionId" SET DATA TYPE TEXT,
ALTER COLUMN "recordId" SET DATA TYPE TEXT,
ALTER COLUMN "action" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "ip" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "collections" DROP COLUMN "hasCreatedBy",
DROP COLUMN "hasMetadata",
DROP COLUMN "hasSlug",
DROP COLUMN "hasSoftDelete",
DROP COLUMN "hasStatus",
DROP COLUMN "hasTimestamps",
DROP COLUMN "hasUpdatedBy",
DROP COLUMN "hasVersioning",
DROP COLUMN "hasVisibility";

-- AlterTable
ALTER TABLE "fields" DROP COLUMN "allowedFileTypes",
DROP COLUMN "defaultValue",
DROP COLUMN "description",
DROP COLUMN "displayName",
DROP COLUMN "filterable",
DROP COLUMN "helpText",
DROP COLUMN "indexed",
DROP COLUMN "isHidden",
DROP COLUMN "isReadOnly",
DROP COLUMN "isSystem",
DROP COLUMN "maxFileSize",
DROP COLUMN "maxLength",
DROP COLUMN "maxValue",
DROP COLUMN "minLength",
DROP COLUMN "minValue",
DROP COLUMN "options",
DROP COLUMN "pattern",
DROP COLUMN "placeholder",
DROP COLUMN "relationCollectionId",
DROP COLUMN "relationType",
DROP COLUMN "searchable",
DROP COLUMN "sortable",
DROP COLUMN "uiComponent",
DROP COLUMN "unique";

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "readAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_audit_logs_collection_record" RENAME TO "audit_logs_collectionId_recordId_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_user_id" RENAME TO "audit_logs_userId_idx";

-- RenameIndex
ALTER INDEX "idx_notifications_user_read" RENAME TO "notifications_userId_read_idx";
