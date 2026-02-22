/**
 * Redis Caching Tests
 * Tests for license verification and market rates caching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheKeys, CacheTTL } from './_core/redis';

describe('Redis Cache Keys', () => {
  it('generates correct license verification cache keys', () => {
    const key = CacheKeys.LICENSE_VERIFICATION('EC12345', 'nsw');
    expect(key).toBe('license:nsw:EC12345');
  });

  it('normalizes license numbers to uppercase', () => {
    const key = CacheKeys.LICENSE_VERIFICATION('ec12345', 'vic');
    expect(key).toBe('license:vic:EC12345');
  });

  it('generates correct market rates cache keys', () => {
    const key = CacheKeys.MARKET_RATES('sydney', 'electrician');
    expect(key).toBe('market:rates:sydney:electrician');
  });

  it('generates correct market rate item cache keys', () => {
    const key = CacheKeys.MARKET_RATE_ITEM('melbourne', 'plumber', 'PLB-001');
    expect(key).toBe('market:rate:melbourne:plumber:PLB-001');
  });

  it('generates correct regional adjustment cache keys', () => {
    const key = CacheKeys.REGIONAL_ADJUSTMENT('2000');
    expect(key).toBe('market:regional:2000');
  });

  it('generates correct market summary cache key', () => {
    const key = CacheKeys.MARKET_SUMMARY();
    expect(key).toBe('market:summary');
  });

  it('generates correct available cities cache key', () => {
    const key = CacheKeys.AVAILABLE_CITIES();
    expect(key).toBe('market:cities');
  });
});

describe('Redis Cache TTL', () => {
  it('has 24 hour TTL for license verification', () => {
    expect(CacheTTL.LICENSE_VERIFICATION).toBe(24 * 60 * 60);
  });

  it('has 1 hour TTL for market rates', () => {
    expect(CacheTTL.MARKET_RATES).toBe(60 * 60);
  });

  it('has 1 hour TTL for regional adjustments', () => {
    expect(CacheTTL.REGIONAL_ADJUSTMENT).toBe(60 * 60);
  });

  it('has 30 minute TTL for market summary', () => {
    expect(CacheTTL.MARKET_SUMMARY).toBe(30 * 60);
  });
});

describe('License Verification Caching', () => {
  it('validates license format before caching', async () => {
    const { validateLicenseFormat } = await import('./licenseVerification');
    
    // Valid NSW license formats
    expect(validateLicenseFormat('EC12345', 'nsw')).toBe(true);
    expect(validateLicenseFormat('BLD123456', 'nsw')).toBe(true);
    
    // Valid VIC license formats
    expect(validateLicenseFormat('REC12345', 'vic')).toBe(true);
    expect(validateLicenseFormat('DB12345', 'vic')).toBe(true);
    
    // Valid QLD license formats
    expect(validateLicenseFormat('QBCC12345', 'qld')).toBe(true);
    
    // EC1 has valid prefix, so it passes (prefix check OR number check)
    expect(validateLicenseFormat('EC1', 'nsw')).toBe(true);
    
    // Invalid format (no valid prefix and no 4+ digit number)
    expect(validateLicenseFormat('XY1', 'nsw')).toBe(false);
  });

  it('returns error for invalid license format', async () => {
    const { verifyLicense } = await import('./licenseVerification');
    
    const result = await verifyLicense('AB', 'nsw');
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('error');
    expect(result.source).toBe('format_check');
  });

  it('includes authority information in verification result', async () => {
    const { verifyLicense } = await import('./licenseVerification');
    
    const result = await verifyLicense('EC12345', 'nsw');
    expect(result.authorityName).toBe('NSW Fair Trading');
    expect(result.authorityUrl).toBe('https://www.fairtrading.nsw.gov.au');
    expect(result.verificationUrl).toContain('onegov.nsw.gov.au');
  });
});

describe('Market Rates Caching', () => {
  it('determines city from postcode correctly', async () => {
    const { getCityFromPostcode } = await import('./marketRatesService');
    
    // Sydney postcodes
    expect(getCityFromPostcode('2000')).toBe('sydney');
    expect(getCityFromPostcode('2100')).toBe('sydney');
    
    // Melbourne postcodes
    expect(getCityFromPostcode('3000')).toBe('melbourne');
    expect(getCityFromPostcode('3100')).toBe('melbourne');
    
    // Brisbane postcodes
    expect(getCityFromPostcode('4000')).toBe('brisbane');
    
    // Adelaide postcodes
    expect(getCityFromPostcode('5000')).toBe('adelaide');
    
    // Perth postcodes
    expect(getCityFromPostcode('6000')).toBe('perth');
    
    // Unknown defaults to Sydney
    expect(getCityFromPostcode('9999')).toBe('sydney');
  });
});

describe('Cache Key Uniqueness', () => {
  it('generates unique keys for different licenses', () => {
    const key1 = CacheKeys.LICENSE_VERIFICATION('EC12345', 'nsw');
    const key2 = CacheKeys.LICENSE_VERIFICATION('EC12346', 'nsw');
    const key3 = CacheKeys.LICENSE_VERIFICATION('EC12345', 'vic');
    
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key2).not.toBe(key3);
  });

  it('generates unique keys for different market rate queries', () => {
    const key1 = CacheKeys.MARKET_RATES('sydney', 'electrician');
    const key2 = CacheKeys.MARKET_RATES('sydney', 'plumber');
    const key3 = CacheKeys.MARKET_RATES('melbourne', 'electrician');
    
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
    expect(key2).not.toBe(key3);
  });
});
