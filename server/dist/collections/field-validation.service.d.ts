export interface ValidationRule {
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    allowedFileTypes?: string[];
    maxFileSize?: number;
}
export declare class FieldValidationService {
    /**
     * Validate a field value based on field type and rules
     */
    validateValue(value: any, fieldType: string, rules?: ValidationRule): {
        valid: boolean;
        error?: string;
    };
    private validateString;
    private validateText;
    private validateInteger;
    private validateDecimal;
    private validateBoolean;
    private validateDate;
    private validateTime;
    private validateDateTime;
    private validateEmail;
    private validateUrl;
    private validatePhone;
    private validateUUID;
    private validateJSON;
    private validateFile;
    private validateMultiSelect;
    private validateRating;
    private validateColor;
}
//# sourceMappingURL=field-validation.service.d.ts.map