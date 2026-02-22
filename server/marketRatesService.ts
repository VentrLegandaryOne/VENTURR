/**
 * Market Rates Service for VENTURR VALDT
 * Provides price comparison and regional adjustment calculations
 * With Redis caching for improved performance
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { getOrSetCached, CacheKeys, CacheTTL } from './_core/redis';

export type City = 'sydney' | 'melbourne' | 'brisbane' | 'adelaide' | 'perth';
export type Trade = 'electrician' | 'plumber' | 'roofer' | 'builder' | 'landscaper';

export interface MarketRate {
  id: number;
  city: City;
  trade: Trade;
  item_code: string;
  item_description: string;
  unit: string;
  min_rate: number;
  avg_rate: number;
  max_rate: number;
}

export interface RegionalAdjustment {
  region_name: string;
  region_type: string;
  labour_multiplier: number;
  material_multiplier: number;
}

export interface PriceComparison {
  itemCode: string;
  itemDescription: string;
  quotedPrice: number;
  marketMin: number;
  marketAvg: number;
  marketMax: number;
  adjustedAvg: number;
  variancePercent: number;
  status: 'below_market' | 'within_market' | 'above_market' | 'significantly_above';
  recommendation: string;
}

/**
 * Get market rates for a specific city and trade (with Redis caching)
 */
export async function getMarketRates(city: City, trade: Trade): Promise<MarketRate[]> {
  const cacheKey = CacheKeys.MARKET_RATES(city, trade);
  
  return await getOrSetCached<MarketRate[]>(
    cacheKey,
    CacheTTL.MARKET_RATES,
    async () => {
      const db = await getDb();
      if (!db) return [];

      try {
        console.log(`[MarketRates] Fetching rates for ${city}/${trade} from database`);
        const result = await db.execute(sql`
          SELECT * FROM market_rates 
          WHERE city = ${city} AND trade = ${trade}
          ORDER BY item_code
        `);
        return ((result as any)?.[0] as MarketRate[] | undefined) || [];
      } catch (error) {
        console.error('[MarketRates] Error fetching rates:', error);
        return [];
      }
    }
  );
}

/**
 * Get regional adjustment for a postcode (with Redis caching)
 */
export async function getRegionalAdjustment(postcode: string): Promise<RegionalAdjustment | null> {
  const cacheKey = CacheKeys.REGIONAL_ADJUSTMENT(postcode);
  
  return await getOrSetCached<RegionalAdjustment | null>(
    cacheKey,
    CacheTTL.REGIONAL_ADJUSTMENT,
    async () => {
      const db = await getDb();
      if (!db) return null;

      try {
        console.log(`[MarketRates] Fetching regional adjustment for postcode ${postcode}`);
        const result = await db.execute(sql`
          SELECT region_name, region_type, labour_multiplier, material_multiplier
          FROM regional_rate_adjustments
          WHERE postcode_range_start <= ${postcode} AND postcode_range_end >= ${postcode}
          LIMIT 1
        `);
        
        const rows = ((result as any)[0] || []) as any[];
        if (!rows || rows.length === 0) return null;
        
        return {
          region_name: rows[0].region_name,
          region_type: rows[0].region_type,
          labour_multiplier: rows[0].labour_multiplier / 100,
          material_multiplier: rows[0].material_multiplier / 100
        };
      } catch (error) {
        console.error('[MarketRates] Error fetching regional adjustment:', error);
        return null;
      }
    }
  );
}

/**
 * Determine city from postcode
 */
export function getCityFromPostcode(postcode: string): City {
  const pc = parseInt(postcode, 10);
  
  // Sydney metro
  if (pc >= 2000 && pc <= 2234) return 'sydney';
  if (pc >= 2555 && pc <= 2574) return 'sydney';
  
  // Melbourne metro
  if (pc >= 3000 && pc <= 3207) return 'melbourne';
  if (pc >= 3800 && pc <= 3810) return 'melbourne';
  
  // Brisbane metro
  if (pc >= 4000 && pc <= 4179) return 'brisbane';
  if (pc >= 4500 && pc <= 4549) return 'brisbane';
  
  // Adelaide metro
  if (pc >= 5000 && pc <= 5199) return 'adelaide';
  
  // Perth metro
  if (pc >= 6000 && pc <= 6199) return 'perth';
  
  // Default to Sydney for unknown
  return 'sydney';
}

/**
 * Compare a quoted price against market rates (with Redis caching for rate lookup)
 */
export async function comparePrice(
  itemCode: string,
  quotedPrice: number,
  city: City,
  trade: Trade,
  postcode?: string
): Promise<PriceComparison | null> {
  // Use cached market rate item lookup
  const cacheKey = CacheKeys.MARKET_RATE_ITEM(city, trade, itemCode);
  
  const rate = await getOrSetCached<MarketRate | null>(
    cacheKey,
    CacheTTL.MARKET_RATES,
    async () => {
      const db = await getDb();
      if (!db) return null;

      try {
        console.log(`[MarketRates] Fetching rate for ${city}/${trade}/${itemCode}`);
        const rateResult = await db.execute(sql`
          SELECT * FROM market_rates 
          WHERE city = ${city} AND trade = ${trade} AND item_code = ${itemCode}
          LIMIT 1
        `);
        
        const rates = ((rateResult as any)[0] || []) as MarketRate[];
        if (!rates || !rates.length) return null;
        
        return rates[0];
      } catch (error) {
        console.error('[MarketRates] Error fetching rate:', error);
        return null;
      }
    }
  );
  
  if (!rate) return null;
  
  // Get regional adjustment if postcode provided
  let labourMultiplier = 1.0;
  let materialMultiplier = 1.0;
  
  if (postcode) {
    const adjustment = await getRegionalAdjustment(postcode);
    if (adjustment) {
      labourMultiplier = adjustment.labour_multiplier;
      materialMultiplier = adjustment.material_multiplier;
    }
  }
  
  // Calculate adjusted average (60% labour, 40% materials)
  const adjustedAvg = (rate.avg_rate * 0.6 * labourMultiplier) + (rate.avg_rate * 0.4 * materialMultiplier);
  
  // Calculate variance
  const variancePercent = ((quotedPrice - adjustedAvg) / adjustedAvg) * 100;
  
  // Determine status
  let status: PriceComparison['status'];
  let recommendation: string;
  
  if (variancePercent < -10) {
    status = 'below_market';
    recommendation = 'Price is significantly below market rate. Verify scope and quality of work.';
  } else if (variancePercent <= 15) {
    status = 'within_market';
    recommendation = 'Price is within acceptable market range.';
  } else if (variancePercent <= 30) {
    status = 'above_market';
    recommendation = 'Price is above market average. Consider negotiating or getting additional quotes.';
  } else {
    status = 'significantly_above';
    recommendation = 'Price is significantly above market rate. Strongly recommend getting additional quotes.';
  }
  
  return {
    itemCode: rate.item_code,
    itemDescription: rate.item_description,
    quotedPrice,
    marketMin: rate.min_rate,
    marketAvg: rate.avg_rate,
    marketMax: rate.max_rate,
    adjustedAvg: Math.round(adjustedAvg * 100) / 100,
    variancePercent: Math.round(variancePercent * 10) / 10,
    status,
    recommendation
  };
}

/**
 * Get all available cities with rate counts (with Redis caching)
 */
export async function getAvailableCities(): Promise<{ city: City; tradeCount: number }[]> {
  const cacheKey = CacheKeys.AVAILABLE_CITIES();
  
  return await getOrSetCached<{ city: City; tradeCount: number }[]>(
    cacheKey,
    CacheTTL.MARKET_SUMMARY,
    async () => {
      const db = await getDb();
      if (!db) return [];

      try {
        console.log('[MarketRates] Fetching available cities from database');
        const result = await db.execute(sql`
          SELECT city, COUNT(DISTINCT trade) as trade_count
          FROM market_rates
          GROUP BY city
          ORDER BY city
        `);
        
        return ((result as any)[0] as any[]).map(row => ({
          city: row.city as City,
          tradeCount: row.trade_count
        }));
      } catch (error) {
        console.error('[MarketRates] Error fetching cities:', error);
        return [];
      }
    }
  );
}

/**
 * Get market rate summary for dashboard (with Redis caching)
 */
export async function getMarketRateSummary(): Promise<{
  totalRates: number;
  citiesCovered: number;
  tradesCovered: number;
  lastUpdated: Date | null;
}> {
  const cacheKey = CacheKeys.MARKET_SUMMARY();
  
  return await getOrSetCached(
    cacheKey,
    CacheTTL.MARKET_SUMMARY,
    async () => {
      const db = await getDb();
      if (!db) {
        return {
          totalRates: 0,
          citiesCovered: 0,
          tradesCovered: 0,
          lastUpdated: null
        };
      }

      try {
        console.log('[MarketRates] Fetching summary from database');
        const result = await db.execute(sql`
          SELECT 
            COUNT(*) as total_rates,
            COUNT(DISTINCT city) as cities_covered,
            COUNT(DISTINCT trade) as trades_covered,
            MAX(updated_at) as last_updated
          FROM market_rates
        `);
        
        const row = ((result as any)[0] as any[])[0];
        return {
          totalRates: row.total_rates || 0,
          citiesCovered: row.cities_covered || 0,
          tradesCovered: row.trades_covered || 0,
          lastUpdated: row.last_updated ? new Date(row.last_updated) : null
        };
      } catch (error) {
        console.error('[MarketRates] Error fetching summary:', error);
        return {
          totalRates: 0,
          citiesCovered: 0,
          tradesCovered: 0,
          lastUpdated: null
        };
      }
    }
  );
}
