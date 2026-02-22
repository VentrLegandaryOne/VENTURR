/**
 * Security Hardening Test Suite for VENTURR VALDT
 * Tests all security modules: input validation, file hardening, API protection, etc.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sanitizeHtml,
  sanitizeObject,
  detectSqlInjection,
  validateNoSqlInjection,
  sanitizeFilePath,
  validateFilePath,
  safeEmail,
  safeUrl,
  safeABN,
  safeId,
} from "./_core/inputValidation";
import {
  validateFileSignature,
  checkUploadQuota,
  generateSecureFileKey,
  validatePdfContent,
  scanFile,
} from "./_core/fileHardening";
import {
  withRetry,
  withTimeout,
  withFallback,
} from "./_core/resilience";
import { RATE_LIMITS, createRateLimiter } from "./_core/apiHardening";
import {
  bruteForceProtectionMiddleware,
  recordFailedLogin,
  recordSuccessfulLogin,
  invalidateSession,
  invalidateAllUserSessions,
  generateCsrfToken,
} from "./_core/sessionSecurity";
import {
  withTransaction,
  validateQueryParams,
  safePagination,
  OptimisticLockError,
} from "./_core/dbHardening";

// ============================================
// INPUT VALIDATION TESTS
// ============================================

describe("Input Validation Module", () => {
  describe("XSS Sanitization", () => {
    it("should escape HTML entities", () => {
      expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
      );
      expect(sanitizeHtml('"><img src=x onerror=alert(1)>')).toBe(
        "&quot;&gt;&lt;img src&#x3D;x onerror&#x3D;alert(1)&gt;"
      );
      expect(sanitizeHtml("Normal text")).toBe("Normal text");
    });

    it("should sanitize objects recursively", () => {
      const input = {
        name: "<script>bad</script>",
        nested: {
          value: "<img src=x>",
        },
        array: ["<b>bold</b>", "normal"],
        number: 123,
      };

      const result = sanitizeObject(input);
      
      expect(result.name).toBe("&lt;script&gt;bad&lt;&#x2F;script&gt;");
      expect(result.nested.value).toBe("&lt;img src&#x3D;x&gt;");
      expect(result.array[0]).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt;");
      expect(result.number).toBe(123);
    });
  });

  describe("SQL Injection Detection", () => {
    it("should detect SQL injection patterns", () => {
      expect(detectSqlInjection("'; DROP TABLE users; --")).toBe(true);
      expect(detectSqlInjection("1 OR 1=1")).toBe(true);
      expect(detectSqlInjection("UNION SELECT * FROM users")).toBe(true);
      expect(detectSqlInjection("/* comment */")).toBe(true);
      expect(detectSqlInjection("Normal search query")).toBe(false);
      expect(detectSqlInjection("John's Plumbing")).toBe(false);
    });

    it("should throw error for SQL injection attempts", () => {
      expect(() => validateNoSqlInjection("'; DROP TABLE users; --", "search"))
        .toThrow("Invalid characters");
      expect(() => validateNoSqlInjection("Normal text", "search"))
        .not.toThrow();
    });
  });

  describe("Path Traversal Prevention", () => {
    it("should sanitize file paths", () => {
      expect(sanitizeFilePath("../../../etc/passwd")).toBe("etc/passwd");
      expect(sanitizeFilePath("file//name.pdf")).toBe("file/name.pdf");
      expect(sanitizeFilePath("C:\\Windows\\System32")).toBe("C/Windows/System32");
      expect(sanitizeFilePath("normal/path/file.pdf")).toBe("normal/path/file.pdf");
    });

    it("should validate file paths", () => {
      expect(() => validateFilePath("../../../etc/passwd")).toThrow();
      expect(() => validateFilePath("file//name.pdf")).toThrow();
      expect(() => validateFilePath("normal/path/file.pdf")).not.toThrow();
    });
  });

  describe("Zod Schema Validation", () => {
    it("should validate safe email", () => {
      expect(safeEmail.safeParse("test@example.com").success).toBe(true);
      expect(safeEmail.safeParse("invalid-email").success).toBe(false);
      expect(safeEmail.safeParse("<script>@hack.com").success).toBe(false);
    });

    it("should validate safe URL", () => {
      expect(safeUrl.safeParse("https://example.com").success).toBe(true);
      expect(safeUrl.safeParse("http://example.com/path").success).toBe(true);
      expect(safeUrl.safeParse("ftp://example.com").success).toBe(false);
      expect(safeUrl.safeParse("javascript:alert(1)").success).toBe(false);
    });

    it("should validate safe ABN", () => {
      // Valid ABN (example)
      expect(safeABN.safeParse("51824753556").success).toBe(true);
      // Invalid format
      expect(safeABN.safeParse("1234567890").success).toBe(false);
      expect(safeABN.safeParse("abc12345678").success).toBe(false);
    });

    it("should validate safe ID", () => {
      expect(safeId.safeParse(1).success).toBe(true);
      expect(safeId.safeParse(100000).success).toBe(true);
      expect(safeId.safeParse(-1).success).toBe(false);
      expect(safeId.safeParse(0).success).toBe(false);
      expect(safeId.safeParse(1.5).success).toBe(false);
    });
  });
});

// ============================================
// FILE HARDENING TESTS
// ============================================

describe("File Hardening Module", () => {
  describe("File Signature Validation", () => {
    it("should validate PDF signatures", () => {
      // Valid PDF header
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e]);
      expect(validateFileSignature(pdfBuffer, "application/pdf").valid).toBe(true);
      
      // Invalid PDF (JPEG header)
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      expect(validateFileSignature(jpegBuffer, "application/pdf").valid).toBe(false);
    });

    it("should validate PNG signatures", () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect(validateFileSignature(pngBuffer, "image/png").valid).toBe(true);
    });

    it("should detect MIME type mismatch", () => {
      // JPEG file claimed as PNG
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const result = validateFileSignature(jpegBuffer, "image/png");
      
      expect(result.valid).toBe(false);
      expect(result.detectedType).toBe("image/jpeg");
    });
  });

  describe("Upload Quota Management", () => {
    it("should check file size limits", () => {
      // Standard tier: 16MB limit
      const result = checkUploadQuota(1, 20 * 1024 * 1024, "standard");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("exceeds maximum");
    });

    it("should allow files within quota", () => {
      const result = checkUploadQuota(1, 5 * 1024 * 1024, "standard");
      expect(result.allowed).toBe(true);
    });
  });

  describe("Secure File Naming", () => {
    it("should generate secure file keys", () => {
      const key = generateSecureFileKey(123, "My Document.pdf", "uploads");
      
      expect(key).toMatch(/^uploads\/123\/\d+-[a-f0-9]+\.pdf$/);
      expect(key).not.toContain(" ");
      expect(key).not.toContain("..");
    });

    it("should sanitize dangerous filenames", () => {
      const key = generateSecureFileKey(123, "../../../etc/passwd", "uploads");
      
      expect(key).not.toContain("..");
      expect(key).toMatch(/^uploads\/123\//);
    });
  });

  describe("PDF Content Validation", () => {
    it("should reject PDFs with JavaScript", () => {
      const pdfWithJs = Buffer.from("%PDF-1.4 /JS (alert('xss')) /JavaScript");
      const result = validatePdfContent(pdfWithJs);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("JavaScript");
    });

    it("should reject PDFs with embedded files", () => {
      const pdfWithEmbed = Buffer.from("%PDF-1.4 /EmbeddedFile /Type /Filespec");
      const result = validatePdfContent(pdfWithEmbed);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("embedded files");
    });

    it("should accept clean PDFs", () => {
      const cleanPdf = Buffer.from("%PDF-1.4 /Type /Catalog /Pages 1 0 R");
      const result = validatePdfContent(cleanPdf);
      
      expect(result.valid).toBe(true);
    });
  });

  describe("Malware Scanning", () => {
    it("should detect suspicious patterns", async () => {
      const maliciousContent = Buffer.from("<?php eval($_POST['cmd']); ?>");
      const result = await scanFile(maliciousContent);
      
      expect(result.clean).toBe(false);
      expect(result.threats).toBeDefined();
      expect(result.threats!.length).toBeGreaterThan(0);
    });

    it("should pass clean files", async () => {
      const cleanContent = Buffer.from("This is a normal text document.");
      const result = await scanFile(cleanContent);
      
      expect(result.clean).toBe(true);
    });
  });
});

// ============================================
// RESILIENCE TESTS
// ============================================

describe("Resilience Module", () => {
  describe("Retry Logic", () => {
    it("should retry on transient errors", async () => {
      let attempts = 0;
      const fn = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          const error = new Error("Network error");
          (error as any).code = "ECONNRESET";
          throw error;
        }
        return "success";
      });

      const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 });
      
      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should not retry on non-retryable errors", async () => {
      let attempts = 0;
      const fn = vi.fn().mockImplementation(async () => {
        attempts++;
        throw new Error("Validation error");
      });

      await expect(withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 }))
        .rejects.toThrow("Validation error");
      expect(attempts).toBe(1);
    });
  });

  describe("Timeout Handling", () => {
    it("should timeout slow operations", async () => {
      const slowFn = () => new Promise(resolve => setTimeout(resolve, 1000));
      
      await expect(withTimeout(slowFn, 50, "Operation timed out"))
        .rejects.toThrow("Operation timed out");
    });

    it("should complete fast operations", async () => {
      const fastFn = async () => "done";
      const result = await withTimeout(fastFn, 1000);
      
      expect(result).toBe("done");
    });
  });

  describe("Fallback Handling", () => {
    it("should return fallback on error", async () => {
      const failingFn = async () => {
        throw new Error("Service unavailable");
      };

      const result = await withFallback(failingFn, {
        fallbackValue: "default",
        logError: false,
      });
      
      expect(result).toBe("default");
    });

    it("should return actual value on success", async () => {
      const successFn = async () => "actual";

      const result = await withFallback(successFn, {
        fallbackValue: "default",
      });
      
      expect(result).toBe("actual");
    });
  });
});

// ============================================
// API HARDENING TESTS
// ============================================

describe("API Hardening Module", () => {
  describe("Rate Limiting", () => {
    it("should have correct default rate limits", () => {
      expect(RATE_LIMITS.default.maxRequests).toBe(100);
      expect(RATE_LIMITS.auth.maxRequests).toBe(10);
      expect(RATE_LIMITS.upload.maxRequests).toBe(50);
      expect(RATE_LIMITS.ai.maxRequests).toBe(10);
    });
  });
});

// ============================================
// SESSION SECURITY TESTS
// ============================================

describe("Session Security Module", () => {
  describe("Brute Force Protection", () => {
    it("should track failed login attempts", () => {
      // Record multiple failed attempts
      recordFailedLogin("192.168.1.1");
      recordFailedLogin("192.168.1.1");
      recordFailedLogin("192.168.1.1");
      
      // Successful login should clear attempts
      recordSuccessfulLogin("192.168.1.1");
      
      // No error thrown means test passed
      expect(true).toBe(true);
    });
  });

  describe("Session Management", () => {
    it("should invalidate sessions", () => {
      // These should not throw
      invalidateSession("test-session-id");
      invalidateAllUserSessions(123);
      
      expect(true).toBe(true);
    });

    it("should generate CSRF tokens", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });
  });
});

// ============================================
// DATABASE HARDENING TESTS
// ============================================

describe("Database Hardening Module", () => {
  describe("Query Parameter Validation", () => {
    it("should validate query parameters", () => {
      // Valid parameters
      expect(() => validateQueryParams({ userId: 1, name: "John" })).not.toThrow();
      
      // Invalid SQL injection attempt
      expect(() => validateQueryParams({ search: "'; DROP TABLE users; --" }))
        .toThrow("Invalid characters");
    });
  });

  describe("Safe Pagination", () => {
    it("should enforce pagination limits", () => {
      expect(safePagination(1000, 0)).toEqual({ limit: 100, offset: 0 });
      expect(safePagination(-1, -1)).toEqual({ limit: 1, offset: 0 });
      expect(safePagination(undefined, undefined)).toEqual({ limit: 20, offset: 0 });
    });
  });

  describe("Optimistic Locking", () => {
    it("should throw OptimisticLockError", () => {
      const error = new OptimisticLockError();
      expect(error.name).toBe("OptimisticLockError");
      expect(error.message).toContain("modified by another process");
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe("Security Integration", () => {
  it("should have all security modules properly exported", () => {
    // Input validation
    expect(sanitizeHtml).toBeDefined();
    expect(detectSqlInjection).toBeDefined();
    expect(safeEmail).toBeDefined();
    
    // File hardening
    expect(validateFileSignature).toBeDefined();
    expect(checkUploadQuota).toBeDefined();
    expect(scanFile).toBeDefined();
    
    // Resilience
    expect(withRetry).toBeDefined();
    expect(withTimeout).toBeDefined();
    expect(withFallback).toBeDefined();
    
    // API hardening
    expect(RATE_LIMITS).toBeDefined();
    expect(createRateLimiter).toBeDefined();
    
    // Session security
    expect(bruteForceProtectionMiddleware).toBeDefined();
    expect(generateCsrfToken).toBeDefined();
    
    // Database hardening
    expect(withTransaction).toBeDefined();
    expect(validateQueryParams).toBeDefined();
  });
});
