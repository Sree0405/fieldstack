"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const field_types_1 = require("./field-types");
let SchemaGeneratorService = class SchemaGeneratorService {
    /**
     * Generate CREATE TABLE SQL for a collection
     */
    generateCreateTableSQL(tableName, fields, systemConfig) {
        const columns = this.buildColumns(fields, systemConfig);
        return `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
    }
    /**
     * Build column definitions for table creation
     */
    buildColumns(fields, systemConfig) {
        const columns = [];
        // System ID column
        columns.push('"id" UUID PRIMARY KEY DEFAULT gen_random_uuid()');
        // User-defined fields
        for (const field of fields) {
            const pgType = (0, field_types_1.getPgType)(field.type);
            const nullability = field.required ? 'NOT NULL' : 'NULL';
            const dbColumnName = this.toDbColumnName(field.name);
            columns.push(`"${dbColumnName}" ${pgType} ${nullability}`);
        }
        // System fields
        if (systemConfig?.hasTimestamps !== false) {
            columns.push('"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()');
            columns.push('"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()');
        }
        if (systemConfig?.hasSoftDelete) {
            columns.push('"deleted_at" TIMESTAMP WITH TIME ZONE NULL');
        }
        if (systemConfig?.hasVersioning) {
            columns.push('"version" INTEGER NOT NULL DEFAULT 1');
        }
        if (systemConfig?.hasCreatedBy) {
            columns.push('"created_by" UUID NULL');
        }
        if (systemConfig?.hasUpdatedBy) {
            columns.push('"updated_by" UUID NULL');
        }
        if (systemConfig?.hasMetadata) {
            columns.push('"metadata" JSONB NULL');
        }
        if (systemConfig?.hasSlug) {
            columns.push('"slug" VARCHAR(255) NULL UNIQUE');
        }
        if (systemConfig?.hasStatus) {
            columns.push(`"status" VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'scheduled'))`);
        }
        if (systemConfig?.hasVisibility) {
            columns.push(`"visibility" VARCHAR(50) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'internal'))`);
        }
        return columns.join(', ');
    }
    /**
     * Generate field definition for a single field
     */
    generateFieldDefinition(fieldType, required, name) {
        const pgType = (0, field_types_1.getPgType)(fieldType);
        const nullability = required ? 'NOT NULL' : 'NULL';
        return `"${this.toDbColumnName(name)}" ${pgType} ${nullability}`;
    }
    /**
     * Generate ALTER TABLE SQL to add a column
     */
    generateAddColumnSQL(tableName, fieldName, fieldType, required) {
        const pgType = (0, field_types_1.getPgType)(fieldType);
        const nullability = required ? 'NOT NULL' : 'NULL';
        const dbColumnName = this.toDbColumnName(fieldName);
        // For NOT NULL columns on existing tables, we need a DEFAULT
        if (required) {
            const defaultValue = this.getDefaultValueForType(fieldType);
            return `ALTER TABLE "${tableName}" ADD COLUMN "${dbColumnName}" ${pgType} NOT NULL DEFAULT ${defaultValue};`;
        }
        return `ALTER TABLE "${tableName}" ADD COLUMN "${dbColumnName}" ${pgType} ${nullability};`;
    }
    /**
     * Generate ALTER TABLE SQL to drop a column
     */
    generateDropColumnSQL(tableName, fieldName) {
        const dbColumnName = this.toDbColumnName(fieldName);
        return `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${dbColumnName}";`;
    }
    /**
     * Generate ALTER TABLE SQL to modify a column
     */
    generateModifyColumnSQL(tableName, fieldName, newFieldType) {
        const dbColumnName = this.toDbColumnName(fieldName);
        const pgType = (0, field_types_1.getPgType)(newFieldType);
        return `
      ALTER TABLE "${tableName}"
      ALTER COLUMN "${dbColumnName}" SET DATA TYPE ${pgType};
    `;
    }
    /**
     * Generate ALTER TABLE SQL to add an index
     */
    generateAddIndexSQL(tableName, fieldName, isUnique = false) {
        const dbColumnName = this.toDbColumnName(fieldName);
        const indexName = `idx_${tableName}_${dbColumnName}`;
        const uniqueKeyword = isUnique ? 'UNIQUE' : '';
        return `CREATE ${uniqueKeyword} INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ("${dbColumnName}");`;
    }
    /**
     * Generate ALTER TABLE SQL to drop an index
     */
    generateDropIndexSQL(tableName, fieldName) {
        const dbColumnName = this.toDbColumnName(fieldName);
        const indexName = `idx_${tableName}_${dbColumnName}`;
        return `DROP INDEX IF EXISTS "${indexName}";`;
    }
    /**
     * Generate indexes for a collection table
     */
    generateIndexesSQL(tableName, fields, systemConfig) {
        const indexQueries = [];
        // Index user-defined fields
        for (const field of fields) {
            if (field.indexed || field.searchable) {
                const dbColumnName = this.toDbColumnName(field.name);
                const indexName = `idx_${tableName}_${dbColumnName}`;
                const uniqueKeyword = field.unique ? 'UNIQUE' : '';
                indexQueries.push(`CREATE ${uniqueKeyword} INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" ("${dbColumnName}");`);
            }
        }
        // Index system fields
        if (systemConfig?.hasSlug) {
            indexQueries.push(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_${tableName}_slug" ON "${tableName}" ("slug");`);
        }
        if (systemConfig?.hasStatus) {
            indexQueries.push(`CREATE INDEX IF NOT EXISTS "idx_${tableName}_status" ON "${tableName}" ("status");`);
        }
        if (systemConfig?.hasCreatedBy) {
            indexQueries.push(`CREATE INDEX IF NOT EXISTS "idx_${tableName}_created_by" ON "${tableName}" ("created_by");`);
        }
        if (systemConfig?.hasTimestamps !== false) {
            indexQueries.push(`CREATE INDEX IF NOT EXISTS "idx_${tableName}_created_at" ON "${tableName}" ("created_at");`);
        }
        return indexQueries.join('\n');
    }
    /**
     * Generate trigger for auto-updating updated_at
     */
    generateUpdatedAtTriggerSQL(tableName) {
        const triggerName = `${tableName}_update_updated_at`;
        const functionName = `update_updated_at_column()`;
        return `
      CREATE OR REPLACE FUNCTION ${functionName}
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS "${triggerName}" ON "${tableName}";
      CREATE TRIGGER "${triggerName}"
      BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW
      EXECUTE FUNCTION ${functionName};
    `;
    }
    /**
     * Convert field name to database column name (snake_case)
     */
    toDbColumnName(fieldName) {
        return fieldName
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
            .toLowerCase();
    }
    /**
     * Get default value for a field type
     */
    getDefaultValueForType(fieldType) {
        switch (fieldType) {
            case 'BOOLEAN':
            case 'TOGGLE':
            case 'CHECKBOX':
                return 'FALSE';
            case 'INTEGER':
            case 'DECIMAL':
            case 'FLOAT':
            case 'PERCENTAGE':
            case 'RATING':
            case 'AUTO_INCREMENT':
            case 'SERIAL':
                return '0';
            case 'STRING':
            case 'TEXT':
            case 'EMAIL':
            case 'URL':
            case 'PHONE':
            case 'SLUG':
            case 'ENUM':
            case 'SELECT':
            case 'COLOR':
                return "''";
            case 'JSON':
            case 'JSONB':
                return "'{}';";
            case 'MULTISELECT':
                return "'[]'";
            case 'DATE':
                return 'CURRENT_DATE';
            case 'DATETIME':
            case 'TIMESTAMP':
                return 'NOW()';
            default:
                return "''";
        }
    }
    /**
     * Generate system fields for a collection
     */
    generateSystemFields(systemConfig) {
        const systemFields = [];
        if (systemConfig?.hasTimestamps !== false) {
            systemFields.push({ name: 'created_at', type: 'TIMESTAMP', isSystem: true });
            systemFields.push({ name: 'updated_at', type: 'TIMESTAMP', isSystem: true });
        }
        if (systemConfig?.hasSoftDelete) {
            systemFields.push({ name: 'deleted_at', type: 'DATETIME', isSystem: true });
        }
        if (systemConfig?.hasVersioning) {
            systemFields.push({ name: 'version', type: 'INTEGER', isSystem: true });
        }
        if (systemConfig?.hasCreatedBy) {
            systemFields.push({ name: 'created_by', type: 'UUID', isSystem: true });
        }
        if (systemConfig?.hasUpdatedBy) {
            systemFields.push({ name: 'updated_by', type: 'UUID', isSystem: true });
        }
        if (systemConfig?.hasMetadata) {
            systemFields.push({ name: 'metadata', type: 'JSONB', isSystem: true });
        }
        if (systemConfig?.hasSlug) {
            systemFields.push({ name: 'slug', type: 'SLUG', isSystem: true });
        }
        if (systemConfig?.hasStatus) {
            systemFields.push({ name: 'status', type: 'ENUM', isSystem: true });
        }
        if (systemConfig?.hasVisibility) {
            systemFields.push({ name: 'visibility', type: 'ENUM', isSystem: true });
        }
        return systemFields;
    }
};
exports.SchemaGeneratorService = SchemaGeneratorService;
exports.SchemaGeneratorService = SchemaGeneratorService = __decorate([
    (0, common_1.Injectable)()
], SchemaGeneratorService);
