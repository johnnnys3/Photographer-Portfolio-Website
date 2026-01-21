import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidationResult, FormValidator } from '../lib/formValidation';

interface FormInputProps {
  name: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  validator?: FormValidator;
  className?: string;
  rows?: number; // For textarea
  disabled?: boolean;
  showSuccessIndicator?: boolean;
  showErrorIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export function FormInput({
  name,
  type,
  label,
  placeholder,
  required = false,
  value,
  onChange,
  validator,
  className = '',
  rows,
  disabled = false,
  showSuccessIndicator = true,
  showErrorIcon = true,
  validateOnBlur = true,
  validateOnChange = false,
}: FormInputProps) {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, error: null });
  const [isFocused, setIsFocused] = useState(false);

  // Validate field when value changes (if enabled)
  useEffect(() => {
    if (validator && validateOnChange && touched) {
      const result = validator.getRealTimeValidation(name, value, touched);
      setValidation(result);
    }
  }, [value, validator, name, touched, validateOnChange]);

  // Handle field validation
  const validateField = () => {
    if (validator) {
      const result = validator.getRealTimeValidation(name, value, true);
      setValidation(result);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Real-time validation for immediate feedback
    if (validator && validateOnChange && touched) {
      const result = validator.getRealTimeValidation(name, newValue, touched);
      setValidation(result);
    }
  };

  // Handle blur event
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(true);
    setIsFocused(false);
    
    if (validateOnBlur && validator) {
      validateField();
    }
  };

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Determine input styling based on validation state
  const getInputClasses = () => {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border outline-none transition duration-300 resize-none';
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed`;
    }

    if (!touched) {
      return `${baseClasses} border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200`;
    }

    if (validation.isValid) {
      return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200`;
    }

    return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200`;
  };

  // Determine label styling
  const getLabelClasses = () => {
    const baseClasses = 'block text-gray-700 mb-2 transition duration-300';
    
    if (disabled) {
      return `${baseClasses} text-gray-500`;
    }

    if (touched && !validation.isValid) {
      return `${baseClasses} text-red-600`;
    }

    if (touched && validation.isValid && value) {
      return `${baseClasses} text-green-600`;
    }

    return baseClasses;
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={name} className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          required={required}
          className={getInputClasses()}
        />

        {/* Validation Icons */}
        {touched && !disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {validation.isValid && value && showSuccessIndicator && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {!validation.isValid && showErrorIcon && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {touched && !disabled && validation.error && (
        <div className="flex items-center gap-2 text-sm text-red-600 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* Success Message (optional) */}
      {touched && !disabled && validation.isValid && value && showSuccessIndicator && (
        <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Looks good!</span>
        </div>
      )}
    </div>
  );
}

// Specialized components for common input types
export function FormTextInput(props: Omit<FormInputProps, 'type'>) {
  return <FormInput {...props} type="text" />;
}

export function FormEmailInput(props: Omit<FormInputProps, 'type'>) {
  return <FormInput {...props} type="email" />;
}

export function FormPhoneInput(props: Omit<FormInputProps, 'type'>) {
  return <FormInput {...props} type="tel" />;
}

export function FormUrlInput(props: Omit<FormInputProps, 'type'>) {
  return <FormInput {...props} type="url" />;
}

export function FormTextarea(props: Omit<FormInputProps, 'type'>) {
  return <FormInput {...props} type="textarea" />;
}
