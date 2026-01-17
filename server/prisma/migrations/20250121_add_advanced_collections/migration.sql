-- AlterTable: Add advanced field properties to Field model
ALTER TABLE "fields" ADD COLUMN "displayName" VARCHAR(255),
ADD COLUMN "unique" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "indexed" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "searchable" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "sortable" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN "filterable" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN "description" TEXT,
ADD COLUMN "placeholder" VARCHAR(255),
ADD COLUMN "helpText" TEXT,
ADD COLUMN "pattern" VARCHAR(500),
ADD COLUMN "minLength" INTEGER,
ADD COLUMN "maxLength" INTEGER,
ADD COLUMN "minValue" DECIMAL(10,2),
ADD COLUMN "maxValue" DECIMAL(10,2),
ADD COLUMN "options" JSONB,
ADD COLUMN "relationCollectionId" VARCHAR(255),
ADD COLUMN "relationType" VARCHAR(50),
ADD COLUMN "allowedFileTypes" VARCHAR(255),
ADD COLUMN "maxFileSize" INTEGER,
ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "isReadOnly" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT FALSE;

-- AlterTable: Add system field configurations to Collection model
ALTER TABLE "collections" ADD COLUMN "description" TEXT,
ADD COLUMN "hasTimestamps" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN "hasSoftDelete" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasVersioning" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasCreatedBy" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasUpdatedBy" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasMetadata" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasSlug" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasStatus" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN "hasVisibility" BOOLEAN NOT NULL DEFAULT FALSE;

-- Create notification_type enum
CREATE TYPE notification_type AS ENUM (
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'COLLECTION_CREATED',
  'COLLECTION_UPDATED',
  'RECORD_CREATED',
  'RECORD_UPDATED',
  'RECORD_DELETED',
  'PERMISSION_CHANGED'
);

-- CreateTable: AuditLog
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "collectionId" VARCHAR(255) NOT NULL,
  "recordId" VARCHAR(255) NOT NULL,
  "action" VARCHAR(50) NOT NULL,
  "userId" VARCHAR(255),
  "oldData" JSONB,
  "newData" JSONB,
  "changes" TEXT,
  "ip" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_audit_logs_collection_record" ON "audit_logs" ("collectionId", "recordId");
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" ("userId");

-- CreateTable: Notification
CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(255) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" notification_type NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "data" JSONB,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "readAt" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "idx_notifications_user_read" ON "notifications" ("userId", "read");

-- Update FieldType enum to support advanced types
ALTER TYPE "field_type" RENAME TO "field_type_old";

CREATE TYPE "field_type" AS ENUM (
  'STRING',
  'TEXT',
  'INTEGER',
  'DECIMAL',
  'FLOAT',
  'BOOLEAN',
  'DATE',
  'TIME',
  'DATETIME',
  'TIMESTAMP',
  'EMAIL',
  'URL',
  'PHONE',
  'UUID',
  'JSON',
  'JSONB',
  'IMAGE',
  'VIDEO',
  'FILE',
  'ENUM',
  'RELATION',
  'TOGGLE',
  'SELECT',
  'MULTISELECT',
  'CHECKBOX',
  'RADIO',
  'BELONGS_TO',
  'HAS_ONE',
  'HAS_MANY',
  'MANY_TO_MANY',
  'SLUG',
  'MARKDOWN',
  'RICH_TEXT',
  'COLOR',
  'CURRENCY',
  'PERCENTAGE',
  'RATING',
  'AUTO_INCREMENT',
  'SERIAL'
);

-- Convert existing field_type values
ALTER TABLE "fields" ALTER COLUMN "type" TYPE "field_type" USING (
  CASE 
    WHEN "type"::text = 'TEXT' THEN 'TEXT'::"field_type"
    WHEN "type"::text = 'NUMBER' THEN 'INTEGER'::"field_type"
    WHEN "type"::text = 'BOOLEAN' THEN 'BOOLEAN'::"field_type"
    WHEN "type"::text = 'DATETIME' THEN 'DATETIME'::"field_type"
    WHEN "type"::text = 'FILE' THEN 'FILE'::"field_type"
    WHEN "type"::text = 'RELATION' THEN 'RELATION'::"field_type"
    ELSE 'TEXT'::"field_type"
  END
);

DROP TYPE "field_type_old";

