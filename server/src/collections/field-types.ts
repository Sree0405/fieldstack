/**
 * Field type mappings and configurations for CMS collections
 * Maps each FieldType to PostgreSQL column types and validation rules
 */

export enum FieldTypeCategory {
  BASIC = 'basic',
  DATE = 'date',
  MEDIA = 'media',
  RELATION = 'relation',
  SELECTION = 'selection',
  ADVANCED = 'advanced',
  SYSTEM = 'system',
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

export const FIELD_TYPE_MAP: Record<string, FieldTypeConfig> = {
  // Basic types
  STRING: {
    name: 'String',
    category: FieldTypeCategory.BASIC,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'text-input',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Short text field (max 255 characters)',
  },
  TEXT: {
    name: 'Text',
    category: FieldTypeCategory.BASIC,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'textarea',
    searchable: true,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Long text field (unlimited)',
  },
  INTEGER: {
    name: 'Integer',
    category: FieldTypeCategory.BASIC,
    postgresType: 'INTEGER',
    jsType: 'number',
    uiComponent: 'number-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Whole number field',
  },
  DECIMAL: {
    name: 'Decimal',
    category: FieldTypeCategory.BASIC,
    postgresType: 'DECIMAL(10,2)',
    jsType: 'number',
    uiComponent: 'decimal-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Decimal number field (2 decimal places)',
  },
  FLOAT: {
    name: 'Float',
    category: FieldTypeCategory.BASIC,
    postgresType: 'FLOAT',
    jsType: 'number',
    uiComponent: 'number-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Floating point number',
  },
  BOOLEAN: {
    name: 'Boolean',
    category: FieldTypeCategory.BASIC,
    postgresType: 'BOOLEAN',
    jsType: 'boolean',
    uiComponent: 'toggle',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'True/False toggle',
  },

  // Date/Time types
  DATE: {
    name: 'Date',
    category: FieldTypeCategory.DATE,
    postgresType: 'DATE',
    jsType: 'string',
    uiComponent: 'date-picker',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Date field (YYYY-MM-DD)',
  },
  TIME: {
    name: 'Time',
    category: FieldTypeCategory.DATE,
    postgresType: 'TIME',
    jsType: 'string',
    uiComponent: 'time-picker',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Time field (HH:MM:SS)',
  },
  DATETIME: {
    name: 'DateTime',
    category: FieldTypeCategory.DATE,
    postgresType: 'TIMESTAMP',
    jsType: 'string',
    uiComponent: 'datetime-picker',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Date and time field',
  },
  TIMESTAMP: {
    name: 'Timestamp',
    category: FieldTypeCategory.DATE,
    postgresType: 'TIMESTAMP WITH TIME ZONE',
    jsType: 'string',
    uiComponent: 'datetime-picker',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: false,
    description: 'Timestamp with timezone (auto-managed)',
  },

  // Data types
  EMAIL: {
    name: 'Email',
    category: FieldTypeCategory.BASIC,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'email-input',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Email address field',
  },
  URL: {
    name: 'URL',
    category: FieldTypeCategory.BASIC,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'url-input',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'URL field',
  },
  PHONE: {
    name: 'Phone',
    category: FieldTypeCategory.BASIC,
    postgresType: 'VARCHAR(20)',
    jsType: 'string',
    uiComponent: 'phone-input',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Phone number field',
  },
  UUID: {
    name: 'UUID',
    category: FieldTypeCategory.BASIC,
    postgresType: 'UUID',
    jsType: 'string',
    uiComponent: 'text-input',
    searchable: true,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'UUID field',
  },
  JSON: {
    name: 'JSON',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'JSON',
    jsType: 'object',
    uiComponent: 'json-editor',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'JSON data field',
  },
  JSONB: {
    name: 'JSONB',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'JSONB',
    jsType: 'object',
    uiComponent: 'json-editor',
    searchable: false,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'Binary JSON data field (queryable)',
  },

  // Media types
  IMAGE: {
    name: 'Image',
    category: FieldTypeCategory.MEDIA,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'image-upload',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Image file upload',
  },
  VIDEO: {
    name: 'Video',
    category: FieldTypeCategory.MEDIA,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'video-upload',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Video file upload',
  },
  FILE: {
    name: 'File',
    category: FieldTypeCategory.MEDIA,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'file-upload',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'File upload',
  },

  // Selection types
  ENUM: {
    name: 'Enum',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'select',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Single select from predefined options',
  },
  TOGGLE: {
    name: 'Toggle',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'BOOLEAN',
    jsType: 'boolean',
    uiComponent: 'toggle',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'On/Off toggle switch',
  },
  SELECT: {
    name: 'Select',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'select',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Select from dropdown list',
  },
  MULTISELECT: {
    name: 'MultiSelect',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'TEXT[]',
    jsType: 'string[]',
    uiComponent: 'multi-select',
    searchable: false,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'Select multiple options',
  },
  CHECKBOX: {
    name: 'Checkbox',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'BOOLEAN',
    jsType: 'boolean',
    uiComponent: 'checkbox',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Checkbox field',
  },
  RADIO: {
    name: 'Radio',
    category: FieldTypeCategory.SELECTION,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'radio',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Radio button selection',
  },

  // Relationship types
  RELATION: {
    name: 'Relation',
    category: FieldTypeCategory.RELATION,
    postgresType: 'UUID',
    jsType: 'string',
    uiComponent: 'relation-select',
    searchable: false,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'Relationship to another record',
  },
  BELONGS_TO: {
    name: 'BelongsTo',
    category: FieldTypeCategory.RELATION,
    postgresType: 'UUID',
    jsType: 'string',
    uiComponent: 'relation-select',
    searchable: false,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'Belongs to relationship (foreign key)',
  },
  HAS_ONE: {
    name: 'HasOne',
    category: FieldTypeCategory.RELATION,
    postgresType: 'VIRTUAL',
    jsType: 'object',
    uiComponent: 'relation-display',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'One-to-one relationship (virtual)',
  },
  HAS_MANY: {
    name: 'HasMany',
    category: FieldTypeCategory.RELATION,
    postgresType: 'VIRTUAL',
    jsType: 'object[]',
    uiComponent: 'relation-table',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'One-to-many relationship (virtual)',
  },
  MANY_TO_MANY: {
    name: 'ManyToMany',
    category: FieldTypeCategory.RELATION,
    postgresType: 'VIRTUAL',
    jsType: 'object[]',
    uiComponent: 'relation-table',
    searchable: false,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Many-to-many relationship (virtual)',
  },

  // Advanced types
  SLUG: {
    name: 'Slug',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'VARCHAR(255)',
    jsType: 'string',
    uiComponent: 'slug-input',
    searchable: true,
    sortable: true,
    filterable: true,
    allowsNull: false,
    description: 'Auto-generated URL-friendly slug',
  },
  MARKDOWN: {
    name: 'Markdown',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'markdown-editor',
    searchable: true,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Markdown formatted text',
  },
  RICH_TEXT: {
    name: 'RichText',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'TEXT',
    jsType: 'string',
    uiComponent: 'rich-editor',
    searchable: true,
    sortable: false,
    filterable: false,
    allowsNull: true,
    description: 'Rich text editor (HTML)',
  },
  COLOR: {
    name: 'Color',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'VARCHAR(7)',
    jsType: 'string',
    uiComponent: 'color-picker',
    searchable: false,
    sortable: false,
    filterable: true,
    allowsNull: true,
    description: 'Color picker (hex format)',
  },
  CURRENCY: {
    name: 'Currency',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'DECIMAL(10,2)',
    jsType: 'number',
    uiComponent: 'currency-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Currency field with 2 decimal places',
  },
  PERCENTAGE: {
    name: 'Percentage',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'DECIMAL(5,2)',
    jsType: 'number',
    uiComponent: 'percentage-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Percentage field (0-100)',
  },
  RATING: {
    name: 'Rating',
    category: FieldTypeCategory.ADVANCED,
    postgresType: 'INTEGER',
    jsType: 'number',
    uiComponent: 'star-rating',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: true,
    description: 'Star rating (1-5)',
  },

  // System types (usually read-only)
  AUTO_INCREMENT: {
    name: 'AutoIncrement',
    category: FieldTypeCategory.SYSTEM,
    postgresType: 'SERIAL',
    jsType: 'number',
    uiComponent: 'text-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: false,
    description: 'Auto-incrementing number (system)',
  },
  SERIAL: {
    name: 'Serial',
    category: FieldTypeCategory.SYSTEM,
    postgresType: 'BIGSERIAL',
    jsType: 'number',
    uiComponent: 'text-input',
    searchable: false,
    sortable: true,
    filterable: true,
    allowsNull: false,
    description: 'Big serial number (system)',
  },
};

/**
 * Get PostgreSQL type for a given field type
 */
export function getPgType(fieldType: string): string {
  return FIELD_TYPE_MAP[fieldType]?.postgresType || 'TEXT';
}

/**
 * Get UI component for a given field type
 */
export function getUIComponent(fieldType: string): string {
  return FIELD_TYPE_MAP[fieldType]?.uiComponent || 'text-input';
}

/**
 * Check if field type is searchable
 */
export function isSearchable(fieldType: string): boolean {
  return FIELD_TYPE_MAP[fieldType]?.searchable || false;
}

/**
 * Check if field type is sortable
 */
export function isSortable(fieldType: string): boolean {
  return FIELD_TYPE_MAP[fieldType]?.sortable || false;
}

/**
 * Check if field type is filterable
 */
export function isFilterable(fieldType: string): boolean {
  return FIELD_TYPE_MAP[fieldType]?.filterable || false;
}

/**
 * Get all field types by category
 */
export function getFieldTypesByCategory(category: FieldTypeCategory): string[] {
  return Object.entries(FIELD_TYPE_MAP)
    .filter(([, config]) => config.category === category)
    .map(([name]) => name);
}
