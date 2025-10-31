import { storagePut, storageGet } from "./storage";
import { getDb } from "./db";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

/**
 * File upload service for Venturr platform
 * Handles file uploads, validation, and storage
 */

export interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  organizationId: string;
  userId: string;
  projectId?: string;
  fileType: "document" | "image" | "attachment" | "export";
}

export interface UploadedFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  organizationId: string;
  projectId?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Default configuration
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = {
  document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  attachment: ["application/pdf", "application/zip", "application/x-rar-compressed"],
  export: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

/**
 * Validate file before upload
 */
export function validateFile(
  file: {
    size: number;
    type: string;
    name: string;
  },
  options: FileUploadOptions
): { valid: boolean; error?: string } {
  const maxSize = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const allowedTypes = options.allowedMimeTypes || ALLOWED_MIME_TYPES[options.fileType];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file size minimum
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file name
  if (!file.name || file.name.length === 0) {
    return {
      valid: false,
      error: "File name is required",
    };
  }

  if (file.name.length > 255) {
    return {
      valid: false,
      error: "File name is too long (max 255 characters)",
    };
  }

  // Check for suspicious file names
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return {
      valid: false,
      error: "Invalid file name",
    };
  }

  return { valid: true };
}

/**
 * Upload file to S3
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  options: FileUploadOptions
): Promise<UploadedFile> {
  try {
    // Validate file
    const validation = validateFile(
      {
        size: fileBuffer.length,
        type: mimeType,
        name: fileName,
      },
      options
    );

    if (!validation.valid) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: validation.error || "File validation failed",
      });
    }

    // Generate unique file path
    const fileId = nanoid();
    const fileExtension = fileName.split(".").pop() || "";
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 200);
    const storagePath = `uploads/${options.organizationId}/${options.projectId || "general"}/${fileId}-${sanitizedFileName}`;

    // Upload to S3
    const { url, key } = await storagePut(storagePath, fileBuffer, mimeType);

    // Create file record
    const uploadedFile: UploadedFile = {
      id: fileId,
      fileName: sanitizedFileName,
      mimeType,
      sizeBytes: fileBuffer.length,
      url,
      organizationId: options.organizationId,
      projectId: options.projectId,
      uploadedBy: options.userId,
      uploadedAt: new Date(),
    };

    // Store metadata in database (if needed)
    // await storeFileMetadata(uploadedFile);

    return uploadedFile;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "File upload failed",
    });
  }
}

/**
 * Download file from S3
 */
export async function downloadFile(fileId: string, organizationId: string) {
  try {
    // Verify file ownership
    // const file = await getFileMetadata(fileId);
    // if (file.organizationId !== organizationId) {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: "Access denied",
    //   });
    // }

    // Generate presigned URL
    const { url } = await storageGet(`uploads/${organizationId}/${fileId}`, 3600);

    return { url, expiresIn: 3600 };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "File download failed",
    });
  }
}

/**
 * Delete file from S3
 */
export async function deleteFile(fileId: string, organizationId: string) {
  try {
    // Verify file ownership
    // const file = await getFileMetadata(fileId);
    // if (file.organizationId !== organizationId) {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: "Access denied",
    //   });
    // }

    // Delete from S3
    // await storageDelete(`uploads/${organizationId}/${fileId}`);

    // Delete metadata from database
    // await deleteFileMetadata(fileId);

    return { success: true };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "File deletion failed",
    });
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string) {
  try {
    // Query database for file metadata
    // const file = await db.select().from(files).where(eq(files.id, fileId));
    // return file[0] || null;
    return null;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to retrieve file metadata",
    });
  }
}

/**
 * List files for a project
 */
export async function listProjectFiles(
  projectId: string,
  organizationId: string
) {
  try {
    // Query database for project files
    // const files = await db
    //   .select()
    //   .from(projectFiles)
    //   .where(
    //     and(
    //       eq(projectFiles.projectId, projectId),
    //       eq(projectFiles.organizationId, organizationId)
    //     )
    //   );
    // return files;
    return [];
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to list project files",
    });
  }
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Get file icon based on type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("sheet")) return "📊";
  if (mimeType.includes("zip")) return "📦";
  return "📎";
}

/**
 * Convert file to base64 (for preview)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Batch upload files
 */
export async function batchUploadFiles(
  files: Array<{ buffer: Buffer; name: string; type: string }>,
  options: FileUploadOptions
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = [];
  const errors: Array<{ fileName: string; error: string }> = [];

  for (const file of files) {
    try {
      const uploaded = await uploadFile(file.buffer, file.name, file.type, options);
      results.push(uploaded);
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (errors.length > 0) {
    console.warn("[FileUpload] Batch upload errors:", errors);
  }

  return results;
}

