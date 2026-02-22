/**
 * Upload Progress Persistence Utility
 * 
 * Stores upload progress in localStorage to prevent data loss on tab closure
 * or browser crashes. Progress is automatically restored on page reload.
 */

export interface UploadProgressData {
  quoteId: string;
  fileName: string;
  currentStep: "upload" | "analysis" | "results";
  startedAt: number; // timestamp
  fileSize?: number;
  status: "in_progress" | "completed" | "failed";
  error?: string;
}

const STORAGE_KEY = "venturr_upload_progress";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save upload progress to localStorage
 */
export function saveUploadProgress(data: UploadProgressData): void {
  try {
    const existing = getAllUploadProgress();
    const updated = {
      ...existing,
      [data.quoteId]: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save upload progress:", error);
  }
}

/**
 * Get all upload progress data from localStorage
 */
export function getAllUploadProgress(): Record<string, UploadProgressData> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const data = JSON.parse(stored) as Record<string, UploadProgressData>;
    
    // Filter out stale progress (older than 24 hours)
    const now = Date.now();
    const filtered: Record<string, UploadProgressData> = {};
    
    for (const [quoteId, progress] of Object.entries(data)) {
      if (now - progress.startedAt < MAX_AGE_MS) {
        filtered[quoteId] = progress;
      }
    }
    
    // Update storage with filtered data
    if (Object.keys(filtered).length !== Object.keys(data).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    
    return filtered;
  } catch (error) {
    console.error("Failed to get upload progress:", error);
    return {};
  }
}

/**
 * Get upload progress for a specific quote
 */
export function getUploadProgress(quoteId: string): UploadProgressData | null {
  const all = getAllUploadProgress();
  return all[quoteId] || null;
}

/**
 * Get all incomplete uploads (in_progress status)
 */
export function getIncompleteUploads(): UploadProgressData[] {
  const all = getAllUploadProgress();
  return Object.values(all).filter(
    (progress) => progress.status === "in_progress"
  );
}

/**
 * Clear upload progress for a specific quote
 */
export function clearUploadProgress(quoteId: string): void {
  try {
    const all = getAllUploadProgress();
    delete all[quoteId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error("Failed to clear upload progress:", error);
  }
}

/**
 * Clear all upload progress data
 */
export function clearAllUploadProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear all upload progress:", error);
  }
}

/**
 * Mark upload as completed
 */
export function markUploadCompleted(quoteId: string): void {
  const progress = getUploadProgress(quoteId);
  if (progress) {
    saveUploadProgress({
      ...progress,
      status: "completed",
      currentStep: "results",
    });
  }
}

/**
 * Mark upload as failed
 */
export function markUploadFailed(quoteId: string, error: string): void {
  const progress = getUploadProgress(quoteId);
  if (progress) {
    saveUploadProgress({
      ...progress,
      status: "failed",
      error,
    });
  }
}

/**
 * Update upload step
 */
export function updateUploadStep(
  quoteId: string,
  step: "upload" | "analysis" | "results"
): void {
  const progress = getUploadProgress(quoteId);
  if (progress) {
    saveUploadProgress({
      ...progress,
      currentStep: step,
    });
  }
}
