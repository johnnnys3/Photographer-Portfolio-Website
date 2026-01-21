/**
 * Form validation utilities with real-time feedback
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface FormErrors {
  [fieldName: string]: string | null;
}

export class FormValidator {
  private rules: { [fieldName: string]: ValidationRule[] } = {};

  /**
   * Add validation rules for a field
   */
  addRule(fieldName: string, rules: ValidationRule[]): this {
    this.rules[fieldName] = rules;
    return this;
  }

  /**
   * Validate a single field
   */
  validateField(fieldName: string, value: string): ValidationResult {
    const fieldRules = this.rules[fieldName] || [];
    
    for (const rule of fieldRules) {
      // Required validation
      if (rule.required && (!value || value.trim() === '')) {
        return { isValid: false, error: 'This field is required' };
      }

      // Skip other validations if field is empty and not required
      if (!value || value.trim() === '') {
        continue;
      }

      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return { 
          isValid: false, 
          error: `Must be at least ${rule.minLength} characters long` 
        };
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return { 
          isValid: false, 
          error: `Must be no more than ${rule.maxLength} characters long` 
        };
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return { isValid: false, error: 'Invalid format' };
      }

      // Email validation
      if (rule.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
      }

      // URL validation
      if (rule.url) {
        try {
          new URL(value);
        } catch {
          return { isValid: false, error: 'Please enter a valid URL' };
        }
      }

      // Phone validation
      if (rule.phone) {
        const phonePattern = /^[\d\s\-\+\(\)]+$/;
        const cleanPhone = value.replace(/\D/g, '');
        if (!phonePattern.test(value) || cleanPhone.length < 10) {
          return { isValid: false, error: 'Please enter a valid phone number' };
        }
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          return { isValid: false, error: customError };
        }
      }
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate all form fields
   */
  validateForm(formData: { [fieldName: string]: string }): { isValid: boolean; errors: FormErrors } {
    const errors: FormErrors = {};
    let isValid = true;

    for (const fieldName in this.rules) {
      const result = this.validateField(fieldName, formData[fieldName] || '');
      errors[fieldName] = result.error;
      if (!result.isValid) {
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  /**
   * Get real-time validation message as user types
   */
  getRealTimeValidation(fieldName: string, value: string, touched: boolean): ValidationResult {
    if (!touched) {
      return { isValid: true, error: null };
    }

    return this.validateField(fieldName, value);
  }
}

// Predefined validation rule sets
export const COMMON_VALIDATIONS = {
  name: [
    { required: true },
    { minLength: 2, maxLength: 50 },
    { 
      custom: (value: string) => {
        if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return null;
      }
    }
  ],
  
  email: [
    { required: true },
    { email: true }
  ],
  
  phone: [
    { phone: true },
    { 
      custom: (value: string) => {
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          return 'Phone number must be at least 10 digits';
        }
        return null;
      }
    }
  ],
  
  subject: [
    { required: true },
    { minLength: 3, maxLength: 100 }
  ],
  
  message: [
    { required: true },
    { minLength: 10, maxLength: 1000 }
  ],
  
  title: [
    { required: true },
    { minLength: 1, maxLength: 100 }
  ],
  
  description: [
    { maxLength: 500 }
  ],
  
  url: [
    { url: true }
  ],
  
  tags: [
    { 
      custom: (value: string) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        if (tags.length > 10) {
          return 'Maximum 10 tags allowed';
        }
        if (tags.some(tag => tag.length > 20)) {
          return 'Each tag must be 20 characters or less';
        }
        return null;
      }
    }
  ]
};

// Utility function to create form validator with common rules
export function createContactFormValidator(): FormValidator {
  return new FormValidator()
    .addRule('name', COMMON_VALIDATIONS.name)
    .addRule('email', COMMON_VALIDATIONS.email)
    .addRule('subject', COMMON_VALIDATIONS.subject)
    .addRule('message', COMMON_VALIDATIONS.message);
}

export function createAdminFormValidator(): FormValidator {
  return new FormValidator()
    .addRule('title', COMMON_VALIDATIONS.title)
    .addRule('description', COMMON_VALIDATIONS.description)
    .addRule('email', COMMON_VALIDATIONS.email)
    .addRule('phone', COMMON_VALIDATIONS.phone)
    .addRule('url', COMMON_VALIDATIONS.url);
}
