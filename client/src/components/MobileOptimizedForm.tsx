import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "number" | "tel" | "textarea" | "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  className?: string;
}

/**
 * MobileOptimizedFormField
 * 
 * Touch-friendly form field with:
 * - Minimum 44px height for touch targets
 * - 16px font size to prevent iOS zoom
 * - Clear labels and error states
 * - Proper spacing for thumb reach
 */
export function MobileOptimizedFormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  helpText,
  options,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-base font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "min-h-[120px] text-base", // 16px to prevent iOS zoom
            error && "border-red-500 focus:border-red-500"
          )}
        />
      ) : type === "select" && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full min-h-[44px] px-3 py-2 text-base rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
            error && "border-red-500 focus:ring-red-500"
          )}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "min-h-[44px] text-base", // 16px to prevent iOS zoom
            error && "border-red-500 focus:border-red-500"
          )}
        />
      )}

      {helpText && !error && (
        <p className="text-sm text-slate-500">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface MobileOptimizedFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * MobileOptimizedForm
 * 
 * Form wrapper with:
 * - Proper spacing for mobile
 * - Touch-friendly submit buttons
 * - Loading states
 * - Cancel button support
 */
export function MobileOptimizedForm({
  onSubmit,
  children,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  isSubmitting = false,
  className,
}: MobileOptimizedFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn("space-y-6", className)}
    >
      {children}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[48px] text-base"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[48px] text-base bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Example usage:
 * 
 * const [formData, setFormData] = useState({
 *   name: "",
 *   email: "",
 *   message: "",
 * });
 * 
 * const [errors, setErrors] = useState({});
 * 
 * <MobileOptimizedForm
 *   onSubmit={handleSubmit}
 *   submitLabel="Send Message"
 *   onCancel={() => navigate(-1)}
 *   isSubmitting={isLoading}
 * >
 *   <MobileOptimizedFormField
 *     label="Name"
 *     name="name"
 *     value={formData.name}
 *     onChange={(value) => setFormData({ ...formData, name: value })}
 *     required
 *     error={errors.name}
 *   />
 *   
 *   <MobileOptimizedFormField
 *     label="Email"
 *     name="email"
 *     type="email"
 *     value={formData.email}
 *     onChange={(value) => setFormData({ ...formData, email: value })}
 *     required
 *     error={errors.email}
 *     helpText="We'll never share your email"
 *   />
 *   
 *   <MobileOptimizedFormField
 *     label="Message"
 *     name="message"
 *     type="textarea"
 *     value={formData.message}
 *     onChange={(value) => setFormData({ ...formData, message: value })}
 *     required
 *   />
 * </MobileOptimizedForm>
 */

