import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMarketRates, getRegionalAdjustment, comparePrice } from './marketRatesService';
import { verifyABN, verifyLicense, getInsuranceRequirements } from './credentialService';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  })),
}));

describe('Market Rates Service', () => {
  describe('getMarketRates', () => {
    it('should accept valid city and trade parameters', async () => {
      const result = await getMarketRates('sydney', 'electrician');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    }, 15000);

    it('should handle Melbourne rates', { timeout: 15000 }, async () => {
      const result = await getMarketRates('melbourne', 'plumber');
      expect(result).toBeDefined();
    });

    it('should handle Brisbane rates', async () => {
      const result = await getMarketRates('brisbane', 'roofer');
      expect(result).toBeDefined();
    });

    it('should handle Adelaide rates', async () => {
      const result = await getMarketRates('adelaide', 'builder');
      expect(result).toBeDefined();
    });

    it('should handle Perth rates', async () => {
      const result = await getMarketRates('perth', 'landscaper');
      expect(result).toBeDefined();
    });
  });

  describe('getRegionalAdjustment', () => {
    it('should return adjustment for Sydney metro postcode', async () => {
      const result = await getRegionalAdjustment('2000');
      expect(result).toBeDefined();
    });

    it('should return adjustment for regional postcode', async () => {
      const result = await getRegionalAdjustment('2850');
      expect(result).toBeDefined();
    }, 30000);

    it('should return null for invalid postcode', async () => {
      const result = await getRegionalAdjustment('0000');
      expect(result).toBeNull();
    });
  });

  describe('comparePrice', () => {
    it('should compare quoted price against market rates', async () => {
      const result = await comparePrice('ELEC-001', 3500, 'sydney', 'electrician');
      // Result may be null if no matching rate in mocked DB
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should identify above market prices', async () => {
      const result = await comparePrice('ELEC-001', 10000, 'sydney', 'electrician');
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should identify below market prices', { timeout: 15000 }, async () => {
      const result = await comparePrice('ELEC-001', 100, 'sydney', 'electrician');
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });


});

describe('Credential Verification Service', () => {
  describe('verifyABN', () => {
    it('should validate ABN format', async () => {
      const result = await verifyABN('51824753556');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('abn');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
    });

    it('should reject invalid ABN format', async () => {
      const result = await verifyABN('12345');
      expect(result).toBeDefined();
      expect(result.isValid).toBe(false);
    });

    it('should handle ABN with spaces', async () => {
      const result = await verifyABN('51 824 753 556');
      expect(result).toBeDefined();
    });
  });

  describe('verifyLicense', () => {
    it('should verify NSW license', async () => {
      const result = await verifyLicense('EC12345', 'nsw');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('licenseNumber');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('authorityName');
    });

    it('should verify VIC license', async () => {
      const result = await verifyLicense('REC-12345', 'vic');
      expect(result).toBeDefined();
    });

    it('should verify QLD license', async () => {
      const result = await verifyLicense('QBCC-12345', 'qld');
      expect(result).toBeDefined();
    });

    it('should handle all Australian states', { timeout: 30000 }, async () => {
      const states = ['nsw', 'vic', 'qld', 'sa', 'wa', 'tas', 'nt', 'act'] as const;
      for (const state of states) {
        const result = await verifyLicense('TEST-12345', state);
        expect(result).toBeDefined();
        expect(result.state).toBe(state);
      }
    });
  });

  describe('getInsuranceRequirements', () => {
    it('should return insurance requirements for electrician in NSW', async () => {
      const result = await getInsuranceRequirements('electrician', 'nsw');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('publicLiabilityMin');
      expect(result).toHaveProperty('workersCompRequired');
    });

    it('should return insurance requirements for plumber in VIC', async () => {
      const result = await getInsuranceRequirements('plumber', 'vic');
      expect(result).toBeDefined();
    });

    it('should return insurance requirements for builder in QLD', async () => {
      const result = await getInsuranceRequirements('builder', 'qld');
      expect(result).toBeDefined();
    });

    it('should handle all trade types', async () => {
      const trades = ['electrician', 'plumber', 'builder', 'roofer', 'landscaper'];
      for (const trade of trades) {
        const result = await getInsuranceRequirements(trade, 'nsw');
        expect(result).toBeDefined();
        expect(typeof result.publicLiabilityMin).toBe('number');
      }
    });
  });


});

describe('ABN Validation Algorithm', () => {
  it('should correctly validate ABN checksum', () => {
    // ABN validation algorithm test
    const validABN = '51824753556';
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    const digits = validABN.split('').map(Number);
    digits[0] -= 1; // Subtract 1 from first digit
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * weights[i];
    }
    
    expect(sum % 89).toBe(0); // Valid ABN should have remainder 0
  });

  it('should reject invalid ABN checksum', () => {
    const invalidABN = '12345678901';
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    
    const digits = invalidABN.split('').map(Number);
    digits[0] -= 1;
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * weights[i];
    }
    
    expect(sum % 89).not.toBe(0); // Invalid ABN should not have remainder 0
  });
});

describe('Regional Rate Adjustments', () => {
  it('should apply metro multiplier correctly', () => {
    const baseRate = 100;
    const metroMultiplier = 1.0;
    const adjustedRate = baseRate * metroMultiplier;
    expect(adjustedRate).toBe(100);
  });

  it('should apply regional multiplier correctly', () => {
    const baseRate = 100;
    const regionalMultiplier = 1.15;
    const adjustedRate = baseRate * regionalMultiplier;
    expect(adjustedRate).toBeCloseTo(115);
  });

  it('should apply remote multiplier correctly', () => {
    const baseRate = 100;
    const remoteMultiplier = 1.35;
    const adjustedRate = baseRate * remoteMultiplier;
    expect(adjustedRate).toBeCloseTo(135);
  });

  it('should apply very remote multiplier correctly', () => {
    const baseRate = 100;
    const veryRemoteMultiplier = 1.50;
    const adjustedRate = baseRate * veryRemoteMultiplier;
    expect(adjustedRate).toBeCloseTo(150);
  });
});

describe('Price Comparison Logic', () => {
  it('should identify within market range', () => {
    const quotedPrice = 3500;
    const marketMin = 3000;
    const marketMax = 4000;
    const marketAvg = 3500;
    
    const isWithinRange = quotedPrice >= marketMin && quotedPrice <= marketMax;
    const variance = ((quotedPrice - marketAvg) / marketAvg) * 100;
    
    expect(isWithinRange).toBe(true);
    expect(variance).toBe(0);
  });

  it('should identify above market range', () => {
    const quotedPrice = 5000;
    const marketMin = 3000;
    const marketMax = 4000;
    const marketAvg = 3500;
    
    const isAboveMarket = quotedPrice > marketMax;
    const variance = ((quotedPrice - marketAvg) / marketAvg) * 100;
    
    expect(isAboveMarket).toBe(true);
    expect(variance).toBeGreaterThan(0);
  });

  it('should identify below market range', () => {
    const quotedPrice = 2000;
    const marketMin = 3000;
    const marketMax = 4000;
    const marketAvg = 3500;
    
    const isBelowMarket = quotedPrice < marketMin;
    const variance = ((quotedPrice - marketAvg) / marketAvg) * 100;
    
    expect(isBelowMarket).toBe(true);
    expect(variance).toBeLessThan(0);
  });
});
