/**
 * Field type mappings and configurations for CMS collections
 * Maps each FieldType to PostgreSQL column types and validation rules
 */
export declare enum FieldTypeCategory {
    BASIC = "basic",
    DATE = "date",
    MEDIA = "media",
    RELATION = "relation",
    SELECTION = "selection",
    ADVANCED = "advanced",
    SYSTEM = "system"
}
export interface FieldTypeConfig {
    name: string;
    category: FieldTypeCategory;
    postgresType: string;
    jsType: string;
    uiComponent: string;
    searchable: boolean;
    sortable: boolean;
    filterable: boolean;
    allowsNull: boolean;
    description: string;
}
export declare const FIELD_TYPE_MAP: Record<string, FieldTypeConfig>;
/**
 * Get PostgreSQL type for a given field type
 */
export declare function getPgType(fieldType: string): string;
/**
 * Get UI component for a given field type
 */
export declare function getUIComponent(fieldType: string): string;
/**
 * Check if field type is searchable
 */
export declare function isSearchable(fieldType: string): boolean;
/**
 * Check if field type is sortable
 */
export declare function isSortable(fieldType: string): boolean;
/**
 * Check if field type is filterable
 */
export declare function isFilterable(fieldType: string): boolean;
/**
 * Get all field types by category
 */
export declare function getFieldTypesByCategory(category: FieldTypeCategory): string[];
//# sourceMappingURL=field-types.d.ts.map