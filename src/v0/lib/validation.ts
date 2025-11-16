// Validation utilities
export interface ValidationRule<T = unknown> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateField<T>(value: T, rules: ValidationRule<T>): ValidationResult {
  const errors: string[] = [];

  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push('This field is required');
  }

  if (typeof value === 'string') {
    if (rules.min && value.length < rules.min) {
      errors.push(`Minimum length is ${rules.min} characters`);
    }
    if (rules.max && value.length > rules.max) {
      errors.push(`Maximum length is ${rules.max} characters`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format');
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Minimum value is ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Maximum value is ${rules.max}`);
    }
  }

  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, ValidationRule>
): ValidationResult {
  const allErrors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const result = validateField(data[field as keyof T], rules);
    allErrors.push(...result.errors.map(error => `${field}: ${error}`));
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
