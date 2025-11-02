/**
 * Secure Form Validation Hook
 * Provides comprehensive form validation with security measures
 */

import { useState, useCallback } from 'react';
import { Security } from '../utils/security';

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
}

interface UseSecureFormOptions<T> {
  initialData: T;
  validators: Partial<Record<keyof T, (value: any) => ValidationResult>>;
  onSubmit: (data: T) => Promise<void> | void;
}

export function useSecureForm<T extends Record<string, any>>({
  initialData,
  validators,
  onSubmit,
}: UseSecureFormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isValid: false,
    isSubmitting: false,
  });

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: any): ValidationResult => {
    const validator = validators[field];
    if (!validator) {
      return { valid: true, sanitized: value };
    }
    return validator(value);
  }, [validators]);

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in formState.data) {
      const validation = validateField(field, formState.data[field]);
      if (!validation.valid) {
        errors[field] = validation.error || 'Invalid value';
        isValid = false;
      }
    }

    setFormState(prev => ({ ...prev, errors, isValid }));
    return isValid;
  }, [formState.data, validateField]);

  // Update field value with validation
  const updateField = useCallback((field: keyof T, value: any) => {
    const validation = validateField(field, value);
    
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: validation.sanitized || value,
      },
      errors: {
        ...prev.errors,
        [field]: validation.valid ? undefined : validation.error,
      },
    }));
  }, [validateField]);

  // Submit form with validation
  const submit = useCallback(async () => {
    if (!validateAll()) {
      Security.logger.log('warn', 'Form validation failed');
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(formState.data);
      Security.logger.log('info', 'Form submitted successfully');
    } catch (error) {
      Security.logger.log('error', 'Form submission failed:', error);
      throw error;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.data, validateAll, onSubmit]);

  // Reset form
  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      isValid: false,
      isSubmitting: false,
    });
  }, [initialData]);

  return {
    ...formState,
    updateField,
    submit,
    reset,
    validateField,
    validateAll,
  };
}

// Common validators for prediction market forms
export const PredictionValidators = {
  userAddress: (value: string) => Security.utils.validateAddress(value) 
    ? { valid: true, sanitized: value }
    : { valid: false, error: 'Invalid wallet address format' },

  amount: (value: number | string) => Security.utils.validateAmount(value)
    ? { valid: true, sanitized: typeof value === 'string' ? parseFloat(value) : value }
    : { valid: false, error: 'Amount must be a positive number' },

  outcome: (value: string) => Security.utils.validateOutcome(value)
    ? { valid: true, sanitized: value }
    : { valid: false, error: 'Outcome must be YES or NO' },

  marketQuestion: (value: string) => Security.utils.validateMarketQuestion(value),
  marketDescription: (value: string) => Security.utils.validateMarketDescription(value),
  username: (value: string) => Security.utils.validateUsername(value),
  avatarUrl: (value: string) => Security.utils.validateUrl(value)
    ? { valid: true, sanitized: value }
    : { valid: false, error: 'Invalid URL format' },
};

// Secure form components
export const SecureInput = ({ 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  ...props 
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  [key: string]: any;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = Security.utils.sanitizeInput(e.target.value);
    onChange(sanitized);
  };

  return (
    <div className="space-y-1">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const SecureTextarea = ({ 
  value, 
  onChange, 
  error, 
  placeholder, 
  ...props 
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  [key: string]: any;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = Security.utils.sanitizeInput(e.target.value);
    onChange(sanitized);
  };

  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
