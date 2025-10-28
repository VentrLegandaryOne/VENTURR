import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  validateEmail,
  validateAustralianPhone,
  validateABN,
  validatePostcode,
  validateRequired,
  validateURL,
  validateNumber,
  getValidationError,
} from "@/lib/validation";

export type ValidationType = 'email' | 'phone' | 'abn' | 'postcode' | 'url' | 'number' | 'text';

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: ValidationType;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  showValidation?: boolean;
}

export function ValidatedInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  disabled = false,
  min,
  max,
  showValidation = true,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!touched && !value) return;

    // Check required
    if (required && !validateRequired(value)) {
      setError(getValidationError(label, 'required'));
      setIsValid(false);
      return;
    }

    // Skip validation if empty and not required
    if (!value && !required) {
      setError("");
      setIsValid(true);
      return;
    }

    // Type-specific validation
    let valid = true;
    let errorMsg = "";

    switch (type) {
      case 'email':
        valid = validateEmail(value);
        errorMsg = getValidationError(label, 'email');
        break;
      case 'phone':
        const phoneResult = validateAustralianPhone(value);
        valid = phoneResult.valid;
        errorMsg = getValidationError(label, 'phone');
        // Auto-format phone number
        if (valid && phoneResult.formatted && phoneResult.formatted !== value) {
          onChange(phoneResult.formatted);
        }
        break;
      case 'abn':
        valid = validateABN(value);
        errorMsg = getValidationError(label, 'abn');
        break;
      case 'postcode':
        valid = validatePostcode(value);
        errorMsg = getValidationError(label, 'postcode');
        break;
      case 'url':
        valid = validateURL(value);
        errorMsg = getValidationError(label, 'url');
        break;
      case 'number':
        valid = validateNumber(value, min, max);
        errorMsg = getValidationError(label, 'number');
        break;
      default:
        valid = true;
    }

    setIsValid(valid);
    setError(valid ? "" : errorMsg);
  }, [value, type, required, label, touched, min, max, onChange]);

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && error && showValidation;
  const showSuccess = touched && isValid && value && showValidation && type !== 'text';

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={label.toLowerCase().replace(/\s+/g, '-')}
          type={type === 'email' ? 'email' : type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={`pr-10 ${showError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${showSuccess ? 'border-green-500' : ''}`}
        />
        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}
        {showSuccess && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>
      {showError && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

