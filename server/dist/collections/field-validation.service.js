"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValidationService = void 0;
const common_1 = require("@nestjs/common");
let FieldValidationService = class FieldValidationService {
    /**
     * Validate a field value based on field type and rules
     */
    validateValue(value, fieldType, rules) {
        // Check required
        if (rules?.required && (value === null || value === undefined || value === '')) {
            return { valid: false, error: 'This field is required' };
        }
        // Allow null/undefined if not required
        if ((value === null || value === undefined) && !rules?.required) {
            return { valid: true };
        }
        // Type-specific validation
        switch (fieldType) {
            case 'STRING':
            case 'EMAIL':
            case 'URL':
            case 'PHONE':
            case 'SLUG':
            case 'ENUM':
            case 'SELECT':
                return this.validateString(value, rules);
            case 'TEXT':
            case 'MARKDOWN':
            case 'RICH_TEXT':
                return this.validateText(value, rules);
            case 'INTEGER':
            case 'AUTO_INCREMENT':
            case 'SERIAL':
                return this.validateInteger(value, rules);
            case 'DECIMAL':
            case 'FLOAT':
            case 'CURRENCY':
            case 'PERCENTAGE':
                return this.validateDecimal(value, rules);
            case 'BOOLEAN':
            case 'TOGGLE':
            case 'CHECKBOX':
                return this.validateBoolean(value);
            case 'DATE':
                return this.validateDate(value);
            case 'TIME':
                return this.validateTime(value);
            case 'DATETIME':
            case 'TIMESTAMP':
                return this.validateDateTime(value);
            case 'EMAIL':
                return this.validateEmail(value);
            case 'URL':
                return this.validateUrl(value);
            case 'PHONE':
                return this.validatePhone(value);
            case 'UUID':
                return this.validateUUID(value);
            case 'JSON':
            case 'JSONB':
                return this.validateJSON(value);
            case 'IMAGE':
            case 'VIDEO':
            case 'FILE':
                return this.validateFile(value, rules);
            case 'MULTISELECT':
                return this.validateMultiSelect(value);
            case 'RADIO':
            case 'RATING':
                return this.validateRating(value);
            case 'COLOR':
                return this.validateColor(value);
            default:
                return { valid: true };
        }
    }
    validateString(value, rules) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        if (rules?.minLength && value.length < rules.minLength) {
            return {
                valid: false,
                error: `Minimum length is ${rules.minLength} characters`,
            };
        }
        if (rules?.maxLength && value.length > rules.maxLength) {
            return {
                valid: false,
                error: `Maximum length is ${rules.maxLength} characters`,
            };
        }
        if (rules?.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
                return { valid: false, error: 'Value does not match the required format' };
            }
        }
        return { valid: true };
    }
    validateText(value, rules) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        if (rules?.maxLength && value.length > rules.maxLength) {
            return {
                valid: false,
                error: `Maximum length is ${rules.maxLength} characters`,
            };
        }
        return { valid: true };
    }
    validateInteger(value, rules) {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            return { valid: false, error: 'Value must be an integer' };
        }
        if (rules?.minValue !== undefined && value < rules.minValue) {
            return {
                valid: false,
                error: `Minimum value is ${rules.minValue}`,
            };
        }
        if (rules?.maxValue !== undefined && value > rules.maxValue) {
            return {
                valid: false,
                error: `Maximum value is ${rules.maxValue}`,
            };
        }
        return { valid: true };
    }
    validateDecimal(value, rules) {
        if (typeof value !== 'number') {
            return { valid: false, error: 'Value must be a number' };
        }
        if (rules?.minValue !== undefined && value < rules.minValue) {
            return {
                valid: false,
                error: `Minimum value is ${rules.minValue}`,
            };
        }
        if (rules?.maxValue !== undefined && value > rules.maxValue) {
            return {
                valid: false,
                error: `Maximum value is ${rules.maxValue}`,
            };
        }
        return { valid: true };
    }
    validateBoolean(value) {
        if (typeof value !== 'boolean') {
            return { valid: false, error: 'Value must be a boolean' };
        }
        return { valid: true };
    }
    validateDate(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string in YYYY-MM-DD format' };
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return { valid: false, error: 'Value must be in YYYY-MM-DD format' };
        }
        return { valid: true };
    }
    validateTime(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string in HH:MM:SS format' };
        }
        if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
            return { valid: false, error: 'Value must be in HH:MM:SS format' };
        }
        return { valid: true };
    }
    validateDateTime(value) {
        try {
            new Date(value);
            return { valid: true };
        }
        catch {
            return { valid: false, error: 'Value must be a valid date/time' };
        }
    }
    validateEmail(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, error: 'Value must be a valid email address' };
        }
        return { valid: true };
    }
    validateUrl(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        try {
            new URL(value);
            return { valid: true };
        }
        catch {
            return { valid: false, error: 'Value must be a valid URL' };
        }
    }
    validatePhone(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
            return { valid: false, error: 'Value must be a valid phone number' };
        }
        return { valid: true };
    }
    validateUUID(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            return { valid: false, error: 'Value must be a valid UUID' };
        }
        return { valid: true };
    }
    validateJSON(value) {
        if (typeof value === 'string') {
            try {
                JSON.parse(value);
                return { valid: true };
            }
            catch {
                return { valid: false, error: 'Value must be valid JSON' };
            }
        }
        if (typeof value === 'object' && value !== null) {
            return { valid: true };
        }
        return { valid: false, error: 'Value must be a JSON object or valid JSON string' };
    }
    validateFile(value, rules) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a file path or URL' };
        }
        if (rules?.allowedFileTypes && rules.allowedFileTypes.length > 0) {
            const fileExtension = value.split('.').pop()?.toLowerCase();
            if (!fileExtension || !rules.allowedFileTypes.includes(fileExtension)) {
                return {
                    valid: false,
                    error: `Allowed file types: ${rules.allowedFileTypes.join(', ')}`,
                };
            }
        }
        return { valid: true };
    }
    validateMultiSelect(value) {
        if (!Array.isArray(value)) {
            return { valid: false, error: 'Value must be an array' };
        }
        return { valid: true };
    }
    validateRating(value) {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            return { valid: false, error: 'Value must be an integer' };
        }
        if (value < 1 || value > 5) {
            return { valid: false, error: 'Rating must be between 1 and 5' };
        }
        return { valid: true };
    }
    validateColor(value) {
        if (typeof value !== 'string') {
            return { valid: false, error: 'Value must be a string' };
        }
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(value)) {
            return { valid: false, error: 'Value must be a valid hex color (e.g., #FF0000)' };
        }
        return { valid: true };
    }
};
exports.FieldValidationService = FieldValidationService;
exports.FieldValidationService = FieldValidationService = __decorate([
    (0, common_1.Injectable)()
], FieldValidationService);
