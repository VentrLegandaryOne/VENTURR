// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)
// Includes retry logic with exponential backoff for reliability

import { ENV } from './_core/env';

type StorageConfig = { baseUrl: string; apiKey: string };

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  jitterFactor: 0.2, // 20% jitter to prevent thundering herd
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelayMs);
  
  // Add jitter: random value between -jitter% and +jitter%
  const jitter = cappedDelay * RETRY_CONFIG.jitterFactor * (Math.random() * 2 - 1);
  return Math.round(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (network errors, 5xx, 429)
 */
function isRetryableError(error: unknown, response?: Response): boolean {
  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Check response status codes
  if (response) {
    // Retry on server errors (5xx) and rate limiting (429)
    return response.status >= 500 || response.status === 429;
  }
  
  return false;
}

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Upload file to S3 with automatic retry and exponential backoff
 * 
 * @param relKey - Relative path/key for the file in S3
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object containing the key and public URL
 * @throws Error if all retry attempts fail
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: buildAuthHeaders(apiKey),
        body: formData,
      });

      if (response.ok) {
        const url = (await response.json()).url;
        if (attempt > 0) {
          console.log(`[Storage] Upload succeeded on attempt ${attempt + 1} for key: ${key}`);
        }
        return { key, url };
      }

      // Check if we should retry
      if (!isRetryableError(null, response)) {
        const message = await response.text().catch(() => response.statusText);
        throw new Error(
          `Storage upload failed (${response.status} ${response.statusText}): ${message}`
        );
      }

      // Log retry attempt
      const delayMs = calculateBackoffDelay(attempt);
      console.log(
        `[Storage] Upload attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} failed ` +
        `(status: ${response.status}), retrying in ${delayMs}ms for key: ${key}`
      );
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      await sleep(delayMs);
      
    } catch (error) {
      // Check if it's a network error that we should retry
      if (isRetryableError(error)) {
        const delayMs = calculateBackoffDelay(attempt);
        console.log(
          `[Storage] Upload attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} failed ` +
          `(network error), retrying in ${delayMs}ms for key: ${key}`
        );
        lastError = error instanceof Error ? error : new Error(String(error));
        await sleep(delayMs);
      } else {
        // Non-retryable error, throw immediately
        throw error;
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Storage upload failed after ${RETRY_CONFIG.maxAttempts} attempts for key: ${key}. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Get a presigned download URL for a file in S3
 * Includes retry logic for reliability
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const url = await buildDownloadUrl(baseUrl, key, apiKey);
      return { key, url };
    } catch (error) {
      if (isRetryableError(error)) {
        const delayMs = calculateBackoffDelay(attempt);
        console.log(
          `[Storage] Download URL attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} failed, ` +
          `retrying in ${delayMs}ms for key: ${key}`
        );
        lastError = error instanceof Error ? error : new Error(String(error));
        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(
    `Storage download URL failed after ${RETRY_CONFIG.maxAttempts} attempts for key: ${key}. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Test S3 connectivity by attempting a small upload
 * Used by health check endpoint
 */
export async function testStorageConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  try {
    const testKey = `_health_check/${Date.now()}.txt`;
    const testData = 'health check';
    
    await storagePut(testKey, testData, 'text/plain');
    
    return {
      connected: true,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
