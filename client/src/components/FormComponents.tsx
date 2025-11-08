import { useState } from "react";
import { useForm, SubmitHandler, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  register: any;
  errors: any;
  helperText?: string;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  register,
  errors,
  helperText,
}: FormFieldProps<T>) {
  const error = errors[name];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={error ? "border-red-500" : ""}
        aria-invalid={error ? "true" : "false"}
      />
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface ValidatedFormProps<T extends FieldValues> {
  schema: ZodSchema;
  onSubmit: SubmitHandler<T>;
  children: (props: any) => React.ReactNode;
  submitLabel?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function ValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  submitLabel = "Submit",
  onSuccess,
  onError,
}: ValidatedFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const handleFormSubmit: SubmitHandler<T> = async (data) => {
    try {
      await onSubmit(data);
      toast.success("Form submitted successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed");
      onError?.(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {children({ register, errors })}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : submitLabel}
      </Button>
    </form>
  );
}

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}

interface FormSuccessProps {
  message: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}

