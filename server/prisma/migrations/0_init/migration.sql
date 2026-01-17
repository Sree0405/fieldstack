/*
  Warnings:

  - You are about to drop the `collections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `relations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `collection_status` type. If the type is not empty, all the data it contains will be lost.
  - You are about to drop the `app_role` type. If the type is not empty, all the data it contains will be lost.
  - You are about to drop the `field_type` type. If the type is not empty, all the data it contains will be lost.
  - You are about to drop the `permission_action` type. If the type is not empty, all the data it contains will be lost.
  - You are about to drop the `relation_type` type. If the type is not empty, all the data it contains will be lost.

*/
-- DropEnum
DROP TYPE IF EXISTS "app_role";
DROP TYPE IF EXISTS "collection_status";
DROP TYPE IF EXISTS "field_type";
DROP TYPE IF EXISTS "permission_action";
DROP TYPE IF EXISTS "relation_type";

-- DropTable
DROP TABLE IF EXISTS "permissions";
DROP TABLE IF EXISTS "fields";
DROP TABLE IF EXISTS "relations";
DROP TABLE IF EXISTS "collections";
DROP TABLE IF EXISTS "user_roles";
DROP TABLE IF EXISTS "profiles";

-- CreateEnum
CREATE TYPE "app_role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER', 'CUSTOM');
CREATE TYPE "collection_status" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "field_type" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'DATETIME', 'FILE', 'RELATION');
CREATE TYPE "permission_action" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE');
CREATE TYPE "relation_type" AS ENUM ('ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY');

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "status" "collection_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fields" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dbColumn" TEXT NOT NULL,
    "type" "field_type" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "uiComponent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relations" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "relatedCollectionId" TEXT NOT NULL,
    "relationType" "relation_type" NOT NULL,
    "onDelete" TEXT NOT NULL DEFAULT 'cascade',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "app_role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "role" "app_role" NOT NULL,
    "collectionId" TEXT NOT NULL,
    "action" "permission_action" NOT NULL,
    "condition" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");
CREATE UNIQUE INDEX "collections_tableName_key" ON "collections"("tableName");

-- CreateIndex
CREATE UNIQUE INDEX "fields_collectionId_name_key" ON "fields"("collectionId", "name");
CREATE UNIQUE INDEX "fields_collectionId_dbColumn_key" ON "fields"("collectionId", "dbColumn");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_role_key" ON "user_roles"("userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_role_collectionId_action_key" ON "permissions"("role", "collectionId", "action");

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
