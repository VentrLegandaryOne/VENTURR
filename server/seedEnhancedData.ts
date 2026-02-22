/**
 * Enhanced Data Seeding for VENTURR VALDT
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';

const australianStandards = [
  { code: 'AS/NZS 3000:2018', title: 'Electrical installations (Wiring Rules)', category: 'electrical', trade: 'electrician', summary: 'Primary standard for electrical installations' },
  { code: 'AS/NZS 3008.1.1', title: 'Electrical installations - Selection of cables', category: 'electrical', trade: 'electrician', summary: 'Cable selection requirements' },
  { code: 'AS/NZS 3010', title: 'Electrical installations - Generating sets', category: 'electrical', trade: 'electrician', summary: 'Generator installation requirements' },
  { code: 'AS/NZS 3012', title: 'Electrical installations - Construction sites', category: 'electrical', trade: 'electrician', summary: 'Temporary electrical installations' },
  { code: 'AS/NZS 3017', title: 'Electrical installations - Verification', category: 'electrical', trade: 'electrician', summary: 'Testing and verification' },
  { code: 'AS/NZS 3500.0', title: 'Plumbing and drainage - Glossary', category: 'plumbing', trade: 'plumber', summary: 'Plumbing terminology' },
  { code: 'AS/NZS 3500.1', title: 'Plumbing - Water services', category: 'plumbing', trade: 'plumber', summary: 'Water supply systems' },
  { code: 'AS/NZS 3500.2', title: 'Plumbing - Sanitary drainage', category: 'plumbing', trade: 'plumber', summary: 'Sanitary drainage requirements' },
  { code: 'AS/NZS 3500.3', title: 'Plumbing - Stormwater drainage', category: 'plumbing', trade: 'plumber', summary: 'Stormwater requirements' },
  { code: 'AS/NZS 3500.4', title: 'Plumbing - Heated water', category: 'plumbing', trade: 'plumber', summary: 'Hot water systems' },
  { code: 'AS 1684.1', title: 'Timber-framed construction - Design', category: 'structural', trade: 'builder', summary: 'Timber frame design' },
  { code: 'AS 1684.2', title: 'Timber-framed - Non-cyclonic', category: 'structural', trade: 'builder', summary: 'Non-cyclonic construction' },
  { code: 'AS 1684.3', title: 'Timber-framed - Cyclonic', category: 'structural', trade: 'builder', summary: 'Cyclonic construction' },
  { code: 'AS 2870', title: 'Residential slabs and footings', category: 'structural', trade: 'builder', summary: 'Footing design' },
  { code: 'AS 3600', title: 'Concrete structures', category: 'structural', trade: 'builder', summary: 'Concrete design' },
  { code: 'AS 4055', title: 'Wind loads for housing', category: 'roofing', trade: 'roofer', summary: 'Wind load requirements' },
  { code: 'AS 1562.1', title: 'Sheet roof cladding - Metal', category: 'roofing', trade: 'roofer', summary: 'Metal roofing' },
  { code: 'AS 2050', title: 'Installation of roof tiles', category: 'roofing', trade: 'roofer', summary: 'Tile roofing' },
  { code: 'AS 1657', title: 'Fixed platforms and walkways', category: 'safety', trade: 'builder', summary: 'Access systems' },
  { code: 'AS/NZS 1891.1', title: 'Fall-arrest systems', category: 'safety', trade: 'builder', summary: 'Fall arrest equipment' },
  { code: 'AS 1670.1', title: 'Fire detection systems', category: 'fire_safety', trade: 'electrician', summary: 'Fire alarm systems' },
  { code: 'AS 2118.1', title: 'Fire sprinkler systems', category: 'fire_safety', trade: 'plumber', summary: 'Sprinkler systems' },
  { code: 'AS/NZS 4859.1', title: 'Thermal insulation', category: 'energy_efficiency', trade: 'builder', summary: 'Insulation requirements' },
  { code: 'AS/NZS 4234', title: 'Heated water energy', category: 'energy_efficiency', trade: 'plumber', summary: 'Hot water efficiency' },
];

const marketRates = [
  { city: 'sydney', trade: 'electrician', item_code: 'ELEC-001', item_description: 'Switchboard upgrade', unit: 'each', min_rate: 2800, avg_rate: 3500, max_rate: 4500 },
  { city: 'sydney', trade: 'electrician', item_code: 'ELEC-002', item_description: 'Power point installation', unit: 'each', min_rate: 150, avg_rate: 200, max_rate: 280 },
  { city: 'sydney', trade: 'electrician', item_code: 'ELEC-003', item_description: 'LED downlight install', unit: 'each', min_rate: 80, avg_rate: 120, max_rate: 180 },
  { city: 'sydney', trade: 'electrician', item_code: 'ELEC-004', item_description: 'Ceiling fan installation', unit: 'each', min_rate: 180, avg_rate: 250, max_rate: 350 },
  { city: 'sydney', trade: 'electrician', item_code: 'ELEC-005', item_description: 'Safety switch (RCD)', unit: 'each', min_rate: 250, avg_rate: 350, max_rate: 450 },
  { city: 'sydney', trade: 'plumber', item_code: 'PLMB-001', item_description: 'Hot water system 250L', unit: 'each', min_rate: 1800, avg_rate: 2400, max_rate: 3200 },
  { city: 'sydney', trade: 'plumber', item_code: 'PLMB-002', item_description: 'Toilet replacement', unit: 'each', min_rate: 450, avg_rate: 650, max_rate: 900 },
  { city: 'sydney', trade: 'plumber', item_code: 'PLMB-003', item_description: 'Blocked drain clearing', unit: 'each', min_rate: 150, avg_rate: 220, max_rate: 350 },
  { city: 'sydney', trade: 'plumber', item_code: 'PLMB-004', item_description: 'Tap replacement', unit: 'each', min_rate: 180, avg_rate: 280, max_rate: 400 },
  { city: 'sydney', trade: 'plumber', item_code: 'PLMB-005', item_description: 'Gas hot water install', unit: 'each', min_rate: 2200, avg_rate: 2800, max_rate: 3800 },
  { city: 'melbourne', trade: 'electrician', item_code: 'ELEC-001', item_description: 'Switchboard upgrade', unit: 'each', min_rate: 2600, avg_rate: 3200, max_rate: 4200 },
  { city: 'melbourne', trade: 'electrician', item_code: 'ELEC-002', item_description: 'Power point installation', unit: 'each', min_rate: 140, avg_rate: 185, max_rate: 260 },
  { city: 'melbourne', trade: 'electrician', item_code: 'ELEC-003', item_description: 'LED downlight install', unit: 'each', min_rate: 75, avg_rate: 110, max_rate: 165 },
  { city: 'melbourne', trade: 'electrician', item_code: 'ELEC-004', item_description: 'Ceiling fan installation', unit: 'each', min_rate: 165, avg_rate: 230, max_rate: 320 },
  { city: 'melbourne', trade: 'electrician', item_code: 'ELEC-005', item_description: 'Safety switch (RCD)', unit: 'each', min_rate: 230, avg_rate: 320, max_rate: 420 },
  { city: 'melbourne', trade: 'plumber', item_code: 'PLMB-001', item_description: 'Hot water system 250L', unit: 'each', min_rate: 1700, avg_rate: 2200, max_rate: 3000 },
  { city: 'melbourne', trade: 'plumber', item_code: 'PLMB-002', item_description: 'Toilet replacement', unit: 'each', min_rate: 420, avg_rate: 600, max_rate: 850 },
  { city: 'melbourne', trade: 'plumber', item_code: 'PLMB-003', item_description: 'Blocked drain clearing', unit: 'each', min_rate: 140, avg_rate: 200, max_rate: 320 },
  { city: 'melbourne', trade: 'plumber', item_code: 'PLMB-004', item_description: 'Tap replacement', unit: 'each', min_rate: 165, avg_rate: 260, max_rate: 380 },
  { city: 'brisbane', trade: 'electrician', item_code: 'ELEC-001', item_description: 'Switchboard upgrade', unit: 'each', min_rate: 2500, avg_rate: 3100, max_rate: 4000 },
  { city: 'brisbane', trade: 'electrician', item_code: 'ELEC-002', item_description: 'Power point installation', unit: 'each', min_rate: 130, avg_rate: 175, max_rate: 250 },
  { city: 'brisbane', trade: 'electrician', item_code: 'ELEC-003', item_description: 'LED downlight install', unit: 'each', min_rate: 70, avg_rate: 105, max_rate: 155 },
  { city: 'brisbane', trade: 'electrician', item_code: 'ELEC-004', item_description: 'Ceiling fan installation', unit: 'each', min_rate: 155, avg_rate: 220, max_rate: 300 },
  { city: 'brisbane', trade: 'plumber', item_code: 'PLMB-001', item_description: 'Hot water system 250L', unit: 'each', min_rate: 1600, avg_rate: 2100, max_rate: 2800 },
  { city: 'brisbane', trade: 'plumber', item_code: 'PLMB-002', item_description: 'Toilet replacement', unit: 'each', min_rate: 400, avg_rate: 580, max_rate: 800 },
  { city: 'brisbane', trade: 'plumber', item_code: 'PLMB-003', item_description: 'Blocked drain clearing', unit: 'each', min_rate: 130, avg_rate: 190, max_rate: 300 },
  { city: 'adelaide', trade: 'electrician', item_code: 'ELEC-001', item_description: 'Switchboard upgrade', unit: 'each', min_rate: 2400, avg_rate: 2900, max_rate: 3800 },
  { city: 'adelaide', trade: 'electrician', item_code: 'ELEC-002', item_description: 'Power point installation', unit: 'each', min_rate: 120, avg_rate: 165, max_rate: 240 },
  { city: 'adelaide', trade: 'electrician', item_code: 'ELEC-003', item_description: 'LED downlight install', unit: 'each', min_rate: 65, avg_rate: 100, max_rate: 145 },
  { city: 'adelaide', trade: 'plumber', item_code: 'PLMB-001', item_description: 'Hot water system 250L', unit: 'each', min_rate: 1500, avg_rate: 2000, max_rate: 2700 },
  { city: 'adelaide', trade: 'plumber', item_code: 'PLMB-002', item_description: 'Toilet replacement', unit: 'each', min_rate: 380, avg_rate: 550, max_rate: 750 },
  { city: 'perth', trade: 'electrician', item_code: 'ELEC-001', item_description: 'Switchboard upgrade', unit: 'each', min_rate: 2700, avg_rate: 3300, max_rate: 4300 },
  { city: 'perth', trade: 'electrician', item_code: 'ELEC-002', item_description: 'Power point installation', unit: 'each', min_rate: 145, avg_rate: 195, max_rate: 275 },
  { city: 'perth', trade: 'electrician', item_code: 'ELEC-003', item_description: 'LED downlight install', unit: 'each', min_rate: 78, avg_rate: 115, max_rate: 170 },
  { city: 'perth', trade: 'plumber', item_code: 'PLMB-001', item_description: 'Hot water system 250L', unit: 'each', min_rate: 1750, avg_rate: 2300, max_rate: 3100 },
  { city: 'perth', trade: 'plumber', item_code: 'PLMB-002', item_description: 'Toilet replacement', unit: 'each', min_rate: 440, avg_rate: 630, max_rate: 880 },
  { city: 'sydney', trade: 'builder', item_code: 'BLDR-001', item_description: 'Timber deck (per sqm)', unit: 'sqm', min_rate: 350, avg_rate: 500, max_rate: 750 },
  { city: 'sydney', trade: 'builder', item_code: 'BLDR-002', item_description: 'Pergola 3x4m', unit: 'each', min_rate: 4500, avg_rate: 6500, max_rate: 9000 },
  { city: 'melbourne', trade: 'builder', item_code: 'BLDR-001', item_description: 'Timber deck (per sqm)', unit: 'sqm', min_rate: 320, avg_rate: 460, max_rate: 700 },
  { city: 'melbourne', trade: 'builder', item_code: 'BLDR-002', item_description: 'Pergola 3x4m', unit: 'each', min_rate: 4200, avg_rate: 6000, max_rate: 8500 },
  { city: 'brisbane', trade: 'builder', item_code: 'BLDR-001', item_description: 'Timber deck (per sqm)', unit: 'sqm', min_rate: 300, avg_rate: 440, max_rate: 680 },
  { city: 'sydney', trade: 'roofer', item_code: 'ROOF-001', item_description: 'Tile roof restoration', unit: 'sqm', min_rate: 45, avg_rate: 65, max_rate: 95 },
  { city: 'sydney', trade: 'roofer', item_code: 'ROOF-002', item_description: 'Metal roof replacement', unit: 'sqm', min_rate: 80, avg_rate: 120, max_rate: 180 },
  { city: 'melbourne', trade: 'roofer', item_code: 'ROOF-001', item_description: 'Tile roof restoration', unit: 'sqm', min_rate: 42, avg_rate: 60, max_rate: 88 },
  { city: 'melbourne', trade: 'roofer', item_code: 'ROOF-002', item_description: 'Metal roof replacement', unit: 'sqm', min_rate: 75, avg_rate: 110, max_rate: 165 },
  { city: 'sydney', trade: 'landscaper', item_code: 'LAND-001', item_description: 'Retaining wall (per lm)', unit: 'lm', min_rate: 350, avg_rate: 500, max_rate: 750 },
  { city: 'sydney', trade: 'landscaper', item_code: 'LAND-002', item_description: 'Paving (per sqm)', unit: 'sqm', min_rate: 80, avg_rate: 120, max_rate: 180 },
  { city: 'melbourne', trade: 'landscaper', item_code: 'LAND-001', item_description: 'Retaining wall (per lm)', unit: 'lm', min_rate: 320, avg_rate: 460, max_rate: 700 },
];

const regionalAdjustments = [
  { postcode_start: '2000', postcode_end: '2234', region_name: 'Sydney Metro', region_type: 'metro', state: 'nsw', labour_multiplier: 1.00, material_multiplier: 1.00 },
  { postcode_start: '2250', postcode_end: '2263', region_name: 'Central Coast', region_type: 'regional', state: 'nsw', labour_multiplier: 1.05, material_multiplier: 1.03 },
  { postcode_start: '2500', postcode_end: '2530', region_name: 'Wollongong', region_type: 'regional', state: 'nsw', labour_multiplier: 1.08, material_multiplier: 1.05 },
  { postcode_start: '2800', postcode_end: '2880', region_name: 'Central West NSW', region_type: 'remote', state: 'nsw', labour_multiplier: 1.20, material_multiplier: 1.15 },
  { postcode_start: '3000', postcode_end: '3207', region_name: 'Melbourne Metro', region_type: 'metro', state: 'vic', labour_multiplier: 1.00, material_multiplier: 1.00 },
  { postcode_start: '3220', postcode_end: '3224', region_name: 'Geelong', region_type: 'regional', state: 'vic', labour_multiplier: 1.05, material_multiplier: 1.03 },
  { postcode_start: '3350', postcode_end: '3356', region_name: 'Ballarat', region_type: 'regional', state: 'vic', labour_multiplier: 1.10, material_multiplier: 1.08 },
  { postcode_start: '4000', postcode_end: '4179', region_name: 'Brisbane Metro', region_type: 'metro', state: 'qld', labour_multiplier: 1.00, material_multiplier: 1.00 },
  { postcode_start: '4217', postcode_end: '4230', region_name: 'Gold Coast', region_type: 'metro', state: 'qld', labour_multiplier: 1.02, material_multiplier: 1.00 },
  { postcode_start: '4740', postcode_end: '4750', region_name: 'Mackay', region_type: 'regional', state: 'qld', labour_multiplier: 1.15, material_multiplier: 1.12 },
  { postcode_start: '4870', postcode_end: '4880', region_name: 'Cairns', region_type: 'regional', state: 'qld', labour_multiplier: 1.18, material_multiplier: 1.15 },
  { postcode_start: '5000', postcode_end: '5199', region_name: 'Adelaide Metro', region_type: 'metro', state: 'sa', labour_multiplier: 1.00, material_multiplier: 1.00 },
  { postcode_start: '5600', postcode_end: '5690', region_name: 'Eyre Peninsula', region_type: 'remote', state: 'sa', labour_multiplier: 1.25, material_multiplier: 1.20 },
  { postcode_start: '6000', postcode_end: '6199', region_name: 'Perth Metro', region_type: 'metro', state: 'wa', labour_multiplier: 1.00, material_multiplier: 1.00 },
  { postcode_start: '6530', postcode_end: '6537', region_name: 'Geraldton', region_type: 'regional', state: 'wa', labour_multiplier: 1.15, material_multiplier: 1.12 },
  { postcode_start: '6700', postcode_end: '6799', region_name: 'Pilbara', region_type: 'very_remote', state: 'wa', labour_multiplier: 1.45, material_multiplier: 1.35 },
  { postcode_start: '7000', postcode_end: '7099', region_name: 'Hobart', region_type: 'metro', state: 'tas', labour_multiplier: 1.00, material_multiplier: 1.05 },
  { postcode_start: '7250', postcode_end: '7260', region_name: 'Launceston', region_type: 'regional', state: 'tas', labour_multiplier: 1.05, material_multiplier: 1.08 },
  { postcode_start: '0800', postcode_end: '0899', region_name: 'Darwin', region_type: 'regional', state: 'nt', labour_multiplier: 1.20, material_multiplier: 1.25 },
  { postcode_start: '0870', postcode_end: '0872', region_name: 'Alice Springs', region_type: 'very_remote', state: 'nt', labour_multiplier: 1.40, material_multiplier: 1.35 },
  { postcode_start: '2600', postcode_end: '2618', region_name: 'Canberra', region_type: 'metro', state: 'act', labour_multiplier: 1.00, material_multiplier: 1.00 },
];

const licensingAuthorities = [
  { state: 'nsw', authority_name: 'NSW Fair Trading', authority_code: 'NSWFT', website_url: 'https://www.fairtrading.nsw.gov.au', supported_trades: 'electrician,plumber,builder,roofer', license_format: 'XXXXXX/XXC', verification_method: 'web_scrape' },
  { state: 'vic', authority_name: 'Victorian Building Authority', authority_code: 'VBA', website_url: 'https://www.vba.vic.gov.au', supported_trades: 'builder,plumber,electrician', license_format: 'DB-U XXXXX', verification_method: 'api' },
  { state: 'vic', authority_name: 'Energy Safe Victoria', authority_code: 'ESV', website_url: 'https://www.esv.vic.gov.au', supported_trades: 'electrician,gasfitter', license_format: 'LECXXXXX', verification_method: 'web_scrape' },
  { state: 'qld', authority_name: 'QBCC', authority_code: 'QBCC', website_url: 'https://www.qbcc.qld.gov.au', supported_trades: 'builder,plumber,electrician,roofer', license_format: 'XXXXXXX', verification_method: 'api' },
  { state: 'sa', authority_name: 'Consumer and Business Services SA', authority_code: 'CBSSA', website_url: 'https://www.cbs.sa.gov.au', supported_trades: 'builder,plumber,electrician', license_format: 'BLDXXXXX', verification_method: 'web_scrape' },
  { state: 'wa', authority_name: 'Building and Energy WA', authority_code: 'BEWA', website_url: 'https://www.commerce.wa.gov.au/building-and-energy', supported_trades: 'builder,plumber,electrician', license_format: 'ECXXXXX', verification_method: 'web_scrape' },
  { state: 'tas', authority_name: 'CBOS Tasmania', authority_code: 'CBOS', website_url: 'https://www.cbos.tas.gov.au', supported_trades: 'builder,plumber,electrician', license_format: 'XXXXX', verification_method: 'manual' },
  { state: 'nt', authority_name: 'NT Licensing Commission', authority_code: 'NTLC', website_url: 'https://nt.gov.au/industry/licences', supported_trades: 'builder,plumber,electrician', license_format: 'XXXXX', verification_method: 'manual' },
  { state: 'act', authority_name: 'Access Canberra', authority_code: 'AC', website_url: 'https://www.accesscanberra.act.gov.au', supported_trades: 'builder,plumber,electrician', license_format: 'XXXXXXX', verification_method: 'web_scrape' },
];

export async function seedEnhancedData(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[Seed] Database not available');
    return;
  }

  try {
    console.log('[Seed] Seeding Australian Standards...');
    for (const std of australianStandards) {
      await db.execute(sql`
        INSERT IGNORE INTO australian_standards (standard_code, title, category, trade, summary)
        VALUES (${std.code}, ${std.title}, ${std.category}, ${std.trade}, ${std.summary})
      `);
    }
    console.log('[Seed] Seeded ' + australianStandards.length + ' Australian Standards');

    console.log('[Seed] Seeding Market Rates...');
    for (const rate of marketRates) {
      await db.execute(sql`
        INSERT IGNORE INTO market_rates (city, trade, item_code, item_description, unit, min_rate, avg_rate, max_rate)
        VALUES (${rate.city}, ${rate.trade}, ${rate.item_code}, ${rate.item_description}, ${rate.unit}, ${rate.min_rate}, ${rate.avg_rate}, ${rate.max_rate})
      `);
    }
    console.log('[Seed] Seeded ' + marketRates.length + ' Market Rates');

    console.log('[Seed] Seeding Regional Adjustments...');
    for (const adj of regionalAdjustments) {
      await db.execute(sql`
        INSERT IGNORE INTO regional_rate_adjustments (postcode_range_start, postcode_range_end, region_name, region_type, state, labour_multiplier, material_multiplier)
        VALUES (${adj.postcode_start}, ${adj.postcode_end}, ${adj.region_name}, ${adj.region_type}, ${adj.state}, ${Math.round(adj.labour_multiplier * 100)}, ${Math.round(adj.material_multiplier * 100)})
      `);
    }
    console.log('[Seed] Seeded ' + regionalAdjustments.length + ' Regional Adjustments');

    console.log('[Seed] Seeding Licensing Authorities...');
    for (const auth of licensingAuthorities) {
      await db.execute(sql`
        INSERT IGNORE INTO state_licensing_authorities (state, authority_name, authority_code, website_url, api_type)
        VALUES (${auth.state}, ${auth.authority_name}, ${auth.authority_code}, ${auth.website_url}, ${auth.verification_method === 'api' ? 'rest' : auth.verification_method === 'web_scrape' ? 'scrape' : 'manual'})
      `);
    }
    console.log('[Seed] Seeded ' + licensingAuthorities.length + ' Licensing Authorities');

    console.log('[Seed] Enhanced data seeding complete!');
  } catch (error) {
    console.error('[Seed] Error seeding enhanced data:', error);
    throw error;
  }
}
