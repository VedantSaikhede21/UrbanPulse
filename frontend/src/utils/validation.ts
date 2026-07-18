export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FieldRules {
  required?: boolean | string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

export function validateField(value: string, rules: FieldRules): ValidationResult {
  if (rules.required) {
    const msg = typeof rules.required === 'string' ? rules.required : 'This field is required';
    if (!value || value.trim().length === 0) return { valid: false, error: msg };
  }

  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return {
      valid: false,
      error: `Must be at least ${rules.minLength} characters`,
    };
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return {
      valid: false,
      error: `Must be at most ${rules.maxLength} characters`,
    };
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, error: 'Invalid format' };
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return { valid: true };
}

export function validateForm<T extends Record<string, string>>(
  values: T,
  rulesMap: Record<keyof T, FieldRules>,
): Record<keyof T, ValidationResult> {
  const errors = {} as Record<keyof T, ValidationResult>;
  for (const key of Object.keys(rulesMap) as Array<keyof T>) {
    errors[key] = validateField(values[key] ?? '', rulesMap[key]);
  }
  return errors;
}

export function isFormValid<T extends Record<string, string>>(
  errors: Record<keyof T, ValidationResult>,
): boolean {
  return Object.values(errors).every(e => e.valid);
}

export const validators = {
  email: (value: string): ValidationResult => {
    if (!value) return { valid: false, error: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return { valid: false, error: 'Invalid email address' };
    return { valid: true };
  },

  phone: (value: string): ValidationResult => {
    if (!value) return { valid: false, error: 'Phone number is required' };
    const cleaned = value.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{7,15}$/.test(cleaned)) return { valid: false, error: 'Invalid phone number' };
    return { valid: true };
  },

  url: (value: string): ValidationResult => {
    if (!value) return { valid: true };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL' };
    }
  },
};

export type { ValidationResult as default };
