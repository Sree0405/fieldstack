/*
  Warnings:

  - You are about to drop the column `role` on the `permissions` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user_roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId,collectionId,action]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,roleId]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `user_roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- Insert default roles
INSERT INTO "roles" ("id", "name", "displayName", "description", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'admin', 'Administrator', 'Full access to all features', NOW(), NOW()),
  (gen_random_uuid(), 'editor', 'Editor', 'Can create and edit content', NOW(), NOW()),
  (gen_random_uuid(), 'viewer', 'Viewer', 'Read-only access', NOW(), NOW());

-- DropIndex
DROP INDEX "permissions_role_collectionId_action_key";

-- DropIndex
DROP INDEX "user_roles_userId_role_key";

-- AlterTable - Add temporary roleId column
ALTER TABLE "user_roles" ADD COLUMN "roleId" TEXT;

-- Migrate data from role enum to roleId foreign key for user_roles
UPDATE "user_roles" ur SET "roleId" = r."id" 
FROM "roles" r 
WHERE LOWER(r."name") = LOWER(ur."role"::text);

-- Ensure all roleId are set before making it NOT NULL
DELETE FROM "user_roles" WHERE "roleId" IS NULL;

-- AlterTable - Make roleId NOT NULL and drop old role column
ALTER TABLE "user_roles" DROP COLUMN "role",
ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable - Add temporary roleId column for permissions
ALTER TABLE "permissions" ADD COLUMN "roleId" TEXT;

-- Migrate data from role enum to roleId foreign key for permissions
UPDATE "permissions" p SET "roleId" = r."id" 
FROM "roles" r 
WHERE LOWER(r."name") = LOWER(p."role"::text);

-- Ensure all roleId are set before making it NOT NULL
DELETE FROM "permissions" WHERE "roleId" IS NULL;

-- AlterTable - Make roleId NOT NULL and drop old role column
ALTER TABLE "permissions" DROP COLUMN "role",
ALTER COLUMN "roleId" SET NOT NULL;

-- DropEnum
DROP TYPE "app_role";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_roleId_collectionId_action_key" ON "permissions"("roleId", "collectionId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
