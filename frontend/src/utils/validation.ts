/**
 * File validation utilities
 * Based on requirements from agents.md
 */

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validateImageFile = (file: File): ValidationResult => {
  // Validate MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP.`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum size: ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { isValid: true, error: null };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
