/**
 * Redis Connection Validation Test
 * Validates that Upstash Redis REST API is correctly configured
 */

import { describe, it, expect } from 'vitest';
import { getRedisClient, getCached, setCached, testConnection } from './_core/redis';

describe('Redis Connection Validation', () => {
  it('should connect to Upstash Redis successfully', { timeout: 30000 }, async () => {
    const client = getRedisClient();
    
    // If Upstash credentials are not set, client will be null (graceful degradation)
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('Upstash credentials not set - skipping connection test');
      expect(client).toBeNull();
      return;
    }
    
    expect(client).not.toBeNull();
    
    // Test connection with ping-like operation
    const connected = await testConnection();
    expect(connected).toBe(true);
  }, 15000);

  it('should set and get cached values', async () => {
    const client = getRedisClient();
    
    if (!client) {
      console.log('Redis not available - skipping cache test');
      return;
    }
    
    const testKey = 'test:venturr:validation';
    const testValue = { message: 'Redis is working!', timestamp: Date.now() };
    
    // Set value
    await setCached(testKey, testValue, 60);
    
    // Get value back
    const retrieved = await getCached<typeof testValue>(testKey);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.message).toBe('Redis is working!');
    
    // Clean up
    await client.del(testKey);
  }, 15000);

  it('should handle cache TTL correctly', async () => {
    const client = getRedisClient();
    
    if (!client) {
      console.log('Redis not available - skipping TTL test');
      return;
    }
    
    const testKey = 'test:venturr:ttl';
    const testValue = 'TTL test value';
    
    // Set with 60 second TTL
    await client.setex(testKey, 60, testValue);
    
    // Check TTL is set
    const ttl = await client.ttl(testKey);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
    
    // Clean up
    await client.del(testKey);
  }, 30000);
});
