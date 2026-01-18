export interface SystemFieldConfig {
    hasTimestamps?: boolean;
    hasSoftDelete?: boolean;
    hasVersioning?: boolean;
    hasCreatedBy?: boolean;
    hasUpdatedBy?: boolean;
    hasMetadata?: boolean;
    hasSlug?: boolean;
    hasStatus?: boolean;
    hasVisibility?: boolean;
}
export declare class SchemaGeneratorService {
    /**
     * Generate CREATE TABLE SQL for a collection
     */
    generateCreateTableSQL(tableName: string, fields: Array<{
        name: string;
        type: string;
        required: boolean;
    }>, systemConfig?: SystemFieldConfig): string;
    /**
     * Build column definitions for table creation
     */
    private buildColumns;
    /**
     * Generate field definition for a single field
     */
    generateFieldDefinition(fieldType: string, required: boolean, name: string): string;
    /**
     * Generate ALTER TABLE SQL to add a column
     */
    generateAddColumnSQL(tableName: string, fieldName: string, fieldType: string, required: boolean): string;
    /**
     * Generate ALTER TABLE SQL to drop a column
     */
    generateDropColumnSQL(tableName: string, fieldName: string): string;
    /**
     * Generate ALTER TABLE SQL to modify a column
     */
    generateModifyColumnSQL(tableName: string, fieldName: string, newFieldType: string): string;
    /**
     * Generate ALTER TABLE SQL to add an index
     */
    generateAddIndexSQL(tableName: string, fieldName: string, isUnique?: boolean): string;
    /**
     * Generate ALTER TABLE SQL to drop an index
     */
    generateDropIndexSQL(tableName: string, fieldName: string): string;
    /**
     * Generate indexes for a collection table
     */
    generateIndexesSQL(tableName: string, fields: Array<{
        name: string;
        indexed?: boolean;
        unique?: boolean;
        searchable?: boolean;
    }>, systemConfig?: SystemFieldConfig): string;
    /**
     * Generate trigger for auto-updating updated_at
     */
    generateUpdatedAtTriggerSQL(tableName: string): string;
    /**
     * Convert field name to database column name (snake_case)
     */
    private toDbColumnName;
    /**
     * Get default value for a field type
     */
    private getDefaultValueForType;
    /**
     * Generate system fields for a collection
     */
    generateSystemFields(systemConfig?: SystemFieldConfig): Array<{
        name: string;
        type: string;
        isSystem: boolean;
    }>;
}
//# sourceMappingURL=schema-generator.service.d.ts.map