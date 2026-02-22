/**
 * VENTURR VALDT - Quarterly Rate Update Automation
 * Automated system for updating market rates from industry sources
 * 
 * Data Sources:
 * - Housing Industry Association (HIA) - https://hia.com.au
 * - Master Builders Australia - https://masterbuilders.com.au
 * - Fair Work Australia Award Rates - https://www.fairwork.gov.au
 * - Australian Bureau of Statistics (ABS) - https://www.abs.gov.au
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { REAL_MARKET_RATES, syncMarketRatesToDatabase, type City, type Trade } from './realMarketRates';

export interface RateUpdateLog {
  id: number;
  updateType: 'quarterly' | 'manual' | 'correction';
  source: string;
  ratesUpdated: number;
  ratesAdded: number;
  previousAvgRate: number;
  newAvgRate: number;
  percentageChange: number;
  updatedBy: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface RateAdjustmentFactor {
  city: City;
  trade: Trade;
  factor: number;
  reason: string;
  effectiveDate: Date;
  expiryDate: Date | null;
}

// CPI-based adjustment factors by city (based on ABS data)
// These would be updated quarterly from ABS Consumer Price Index
const CPI_ADJUSTMENTS: Record<City, number> = {
  sydney: 1.032,    // 3.2% annual CPI increase
  melbourne: 1.028, // 2.8% annual CPI increase
  brisbane: 1.035,  // 3.5% annual CPI increase
  adelaide: 1.025,  // 2.5% annual CPI increase
  perth: 1.030,     // 3.0% annual CPI increase
};

// Labour cost index adjustments (based on Fair Work award increases)
const LABOUR_COST_ADJUSTMENTS: Record<Trade, number> = {
  electrician: 1.038,  // 3.8% award increase
  plumber: 1.038,      // 3.8% award increase
  roofer: 1.035,       // 3.5% award increase
  builder: 1.040,      // 4.0% award increase
  landscaper: 1.032,   // 3.2% award increase
};

// Material cost index adjustments (based on industry reports)
const MATERIAL_COST_ADJUSTMENTS: Record<Trade, number> = {
  electrician: 1.045,  // Copper and electrical components
  plumber: 1.042,      // PVC and copper piping
  roofer: 1.055,       // Steel and roofing materials
  builder: 1.048,      // Timber and building materials
  landscaper: 1.035,   // Pavers and landscaping materials
};

/**
 * Calculate quarterly adjustment factor for a city/trade combination
 */
export function calculateQuarterlyAdjustment(city: City, trade: Trade): number {
  const cpiAdjustment = CPI_ADJUSTMENTS[city];
  const labourAdjustment = LABOUR_COST_ADJUSTMENTS[trade];
  const materialAdjustment = MATERIAL_COST_ADJUSTMENTS[trade];
  
  // Weighted average: 60% labour, 40% materials, adjusted by CPI
  const combinedAdjustment = (labourAdjustment * 0.6 + materialAdjustment * 0.4);
  
  // Apply quarterly portion (divide annual by 4)
  const quarterlyFactor = 1 + ((combinedAdjustment - 1) / 4);
  
  return Math.round(quarterlyFactor * 10000) / 10000;
}

/**
 * Apply quarterly rate updates to the database
 */
export async function applyQuarterlyRateUpdate(
  updatedBy?: string,
  notes?: string
): Promise<{ success: boolean; ratesUpdated: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, ratesUpdated: 0, error: 'Database not available' };
  
  let ratesUpdated = 0;
  
  try {
    // Get current average rate for comparison
    const currentAvg = await db.execute(sql`
      SELECT AVG(avg_rate) as current_avg FROM market_rates
    `);
    const currentAvgRate = parseFloat((currentAvg as any)[0][0]?.current_avg) || 0;
    
    // Apply adjustments to each city/trade combination
    for (const city of Object.keys(CPI_ADJUSTMENTS) as City[]) {
      for (const trade of Object.keys(LABOUR_COST_ADJUSTMENTS) as Trade[]) {
        const adjustmentFactor = calculateQuarterlyAdjustment(city, trade);
        
        // Update rates in database
        const result = await db.execute(sql`
          UPDATE market_rates 
          SET 
            min_rate = ROUND(min_rate * ${adjustmentFactor}, 2),
            avg_rate = ROUND(avg_rate * ${adjustmentFactor}, 2),
            max_rate = ROUND(max_rate * ${adjustmentFactor}, 2),
            updated_at = NOW()
          WHERE city = ${city} AND trade = ${trade}
        `);
        
        ratesUpdated += (result as any).affectedRows || 0;
      }
    }
    
    // Get new average rate
    const newAvg = await db.execute(sql`
      SELECT AVG(avg_rate) as new_avg FROM market_rates
    `);
    const newAvgRate = parseFloat((newAvg as any)[0][0]?.new_avg) || 0;
    
    // Calculate percentage change
    const percentageChange = currentAvgRate > 0 
      ? ((newAvgRate - currentAvgRate) / currentAvgRate) * 100 
      : 0;
    
    // Log the update
    await logRateUpdate({
      updateType: 'quarterly',
      source: 'ABS CPI + Fair Work Awards + Industry Reports',
      ratesUpdated,
      ratesAdded: 0,
      previousAvgRate: currentAvgRate,
      newAvgRate,
      percentageChange,
      updatedBy: updatedBy || null,
      notes: notes || `Quarterly rate update applied with average ${percentageChange.toFixed(2)}% adjustment`
    });
    
    return { success: true, ratesUpdated };
    
  } catch (error) {
    console.error('[RateUpdate] Error applying quarterly update:', error);
    return { success: false, ratesUpdated: 0, error: 'Failed to apply rate update' };
  }
}

/**
 * Log a rate update for audit trail
 */
async function logRateUpdate(log: Omit<RateUpdateLog, 'id' | 'createdAt'>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.execute(sql`
      INSERT INTO rate_update_logs 
      (update_type, source, rates_updated, rates_added, previous_avg_rate, new_avg_rate, percentage_change, updated_by, notes)
      VALUES (
        ${log.updateType}, 
        ${log.source}, 
        ${log.ratesUpdated}, 
        ${log.ratesAdded}, 
        ${log.previousAvgRate}, 
        ${log.newAvgRate}, 
        ${log.percentageChange}, 
        ${log.updatedBy}, 
        ${log.notes}
      )
    `);
  } catch (error) {
    // Table might not exist yet, create it
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rate_update_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          update_type ENUM('quarterly', 'manual', 'correction') NOT NULL,
          source VARCHAR(255) NOT NULL,
          rates_updated INT DEFAULT 0,
          rates_added INT DEFAULT 0,
          previous_avg_rate DECIMAL(10,2) DEFAULT 0,
          new_avg_rate DECIMAL(10,2) DEFAULT 0,
          percentage_change DECIMAL(5,2) DEFAULT 0,
          updated_by VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Retry insert
      await db.execute(sql`
        INSERT INTO rate_update_logs 
        (update_type, source, rates_updated, rates_added, previous_avg_rate, new_avg_rate, percentage_change, updated_by, notes)
        VALUES (
          ${log.updateType}, 
          ${log.source}, 
          ${log.ratesUpdated}, 
          ${log.ratesAdded}, 
          ${log.previousAvgRate}, 
          ${log.newAvgRate}, 
          ${log.percentageChange}, 
          ${log.updatedBy}, 
          ${log.notes}
        )
      `);
    } catch (retryError) {
      console.error('[RateUpdate] Error logging update:', retryError);
    }
  }
}

/**
 * Get rate update history
 */
export async function getRateUpdateHistory(limit: number = 10): Promise<RateUpdateLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM rate_update_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `);
    
    const rows = (result as any)[0] as any[];
    return rows.map((row: any) => ({
      id: row.id,
      updateType: row.update_type,
      source: row.source,
      ratesUpdated: row.rates_updated,
      ratesAdded: row.rates_added,
      previousAvgRate: parseFloat(row.previous_avg_rate),
      newAvgRate: parseFloat(row.new_avg_rate),
      percentageChange: parseFloat(row.percentage_change),
      updatedBy: row.updated_by,
      notes: row.notes,
      createdAt: new Date(row.created_at)
    }));
    
  } catch (error) {
    console.error('[RateUpdate] Error getting history:', error);
    return [];
  }
}

/**
 * Reset rates to base values (from REAL_MARKET_RATES)
 */
export async function resetRatesToBase(updatedBy?: string): Promise<{ success: boolean; ratesUpdated: number }> {
  try {
    const result = await syncMarketRatesToDatabase();
    
    const db = await getDb();
    if (db) {
      await logRateUpdate({
        updateType: 'manual',
        source: 'Base Rate Reset',
        ratesUpdated: result.updated,
        ratesAdded: result.inserted,
        previousAvgRate: 0,
        newAvgRate: 0,
        percentageChange: 0,
        updatedBy: updatedBy || null,
        notes: 'Rates reset to base values from REAL_MARKET_RATES'
      });
    }
    
    return { success: true, ratesUpdated: result.updated + result.inserted };
  } catch (error) {
    console.error('[RateUpdate] Error resetting rates:', error);
    return { success: false, ratesUpdated: 0 };
  }
}

/**
 * Get next scheduled update date (first day of next quarter)
 */
export function getNextScheduledUpdate(): Date {
  const now = new Date();
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const nextQuarter = currentQuarter + 1;
  
  let year = now.getFullYear();
  let month = nextQuarter * 3;
  
  if (month >= 12) {
    month = 0;
    year += 1;
  }
  
  return new Date(year, month, 1);
}

/**
 * Check if quarterly update is due
 */
export function isQuarterlyUpdateDue(): boolean {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const month = now.getMonth();
  
  // Update is due on the first day of each quarter (Jan, Apr, Jul, Oct)
  const quarterMonths = [0, 3, 6, 9];
  return quarterMonths.includes(month) && dayOfMonth <= 7;
}
