import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getPermissionErrorMessage } from '../utils/apiClient';

export interface UseFormSectionResult<T> {
  formData: Partial<T>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<T>>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  handleSave: (
    data: Partial<T>,
    validateFn: (data: T) => Record<string, string>,
    saveFn: (data: T) => Promise<void>,
    successMessage?: string
  ) => Promise<boolean>;
}

/**
 * Custom hook for managing form section state and operations
 * Provides consistent state management, validation, and save logic across all form sections
 * 
 * @template T - The type of form data
 * @param initialData - Initial form data
 * @returns Form section state and handlers
 */
export function useFormSection<T>(initialData: Partial<T> = {}): UseFormSectionResult<T> {
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /**
   * Handle save with validation
   * @param data - Data to save
   * @param validateFn - Validation function that returns error object
   * @param saveFn - Save function that performs API call
   * @param successMessage - Optional success message
   * @returns Promise<boolean> - true if save succeeded, false if validation failed
   */
  const handleSave = useCallback(
    async (
      data: Partial<T>,
      validateFn: (data: T) => Record<string, string>,
      saveFn: (data: T) => Promise<void>,
      successMessage: string = 'Information updated successfully'
    ): Promise<boolean> => {
      // Validate
      const newErrors = validateFn(data as T);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstError = Object.values(newErrors)[0];
        toast.error(firstError ? `Please fix: ${firstError}` : 'Please fix the errors in the form');
        return false;
      }

      // Clear errors
      setErrors({});
      setSaving(true);

      try {
        await saveFn(data as T);
        toast.success(successMessage);
        return true;
      } catch (err: any) {
        const permissionError = getPermissionErrorMessage(err);
        if (permissionError) {
          toast.error(permissionError);
        } else {
          toast.error(err.response?.data?.error || 'Failed to save information');
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    saving,
    setSaving,
    handleSave,
  };
}
