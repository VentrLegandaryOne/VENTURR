import crypto from 'crypto';

/**
 * Field-level encryption for sensitive data
 * Uses AES-256-GCM for authenticated encryption
 */

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
  'hex'
);

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits)');
}

/**
 * Encrypt a plaintext string
 * Returns: iv:authTag:ciphertext (all hex-encoded)
 */
export function encryptField(plaintext: string): string {
  if (!plaintext) return plaintext;

  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Encryption failed:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * Decrypt an encrypted string
 * Expects format: iv:authTag:ciphertext (all hex-encoded)
 */
export function decryptField(encrypted: string): string {
  if (!encrypted) return encrypted;

  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted field format');
    }

    const [ivHex, authTagHex, ciphertext] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    if (iv.length !== 16) {
      throw new Error('Invalid IV length');
    }

    if (authTag.length !== 16) {
      throw new Error('Invalid auth tag length');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encrypted = { ...obj };

  for (const field of fieldsToEncrypt) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field] as string) as any;
    }
  }

  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const decrypted = { ...obj };

  for (const field of fieldsToDecrypt) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decryptField(decrypted[field] as string) as any;
      } catch (error) {
        // If decryption fails, leave the field as-is
        console.warn(`[Encryption] Failed to decrypt field ${String(field)}`);
      }
    }
  }

  return decrypted;
}

/**
 * Fields that should be encrypted by default
 */
export const ENCRYPTED_FIELDS = {
  users: ['email', 'phone'],
  clients: ['email', 'phone', 'address'],
  projects: ['address'],
  quotes: ['clientEmail', 'clientPhone'],
} as const;

/**
 * Check if a field should be encrypted
 */
export function shouldEncryptField(table: string, field: string): boolean {
  const fields = ENCRYPTED_FIELDS[table as keyof typeof ENCRYPTED_FIELDS];
  return fields ? fields.includes(field as any) : false;
}

/**
 * Generate a new encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate encryption key
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    const buffer = Buffer.from(key, 'hex');
    return buffer.length === 32;
  } catch {
    return false;
  }
}

/**
 * Hash a password using bcrypt-like approach (for authentication)
 * Note: Use bcrypt library for actual password hashing
 */
export function hashPassword(password: string): string {
  // This is a placeholder - use bcrypt in production
  const hash = crypto
    .createHash('sha256')
    .update(password + process.env.PASSWORD_SALT)
    .digest('hex');
  return hash;
}

/**
 * Verify a password hash
 */
export function verifyPasswordHash(password: string, hash: string): boolean {
  const computedHash = hashPassword(password);
  return computedHash === hash;
}

/**
 * Create a hash for data integrity verification
 */
export function createDataHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify data integrity
 */
export function verifyDataHash(data: string, hash: string): boolean {
  return createDataHash(data) === hash;
}

/**
 * Generate a random token for password reset, email verification, etc.
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a secure random string
 */
export function generateSecureString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

export default {
  encryptField,
  decryptField,
  encryptFields,
  decryptFields,
  ENCRYPTED_FIELDS,
  shouldEncryptField,
  generateEncryptionKey,
  validateEncryptionKey,
  hashPassword,
  verifyPasswordHash,
  createDataHash,
  verifyDataHash,
  generateToken,
  generateSecureString,
};

