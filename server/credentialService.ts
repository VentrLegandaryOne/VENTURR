/**
 * Contractor Credential Verification Service for VENTURR VALDT
 * Provides ABN verification, license checking, and insurance validation
 * 
 * Integrates with:
 * - Australian Business Register (ABR) for ABN verification
 * - State licensing authorities for contractor license verification
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { verifyABN as verifyABNReal, validateABNChecksum, formatABN, type ABNVerificationResult as RealABNResult } from './abnVerification';
import { verifyLicense as verifyLicenseReal, STATE_AUTHORITIES, LICENSE_CLASSES, type LicenseVerificationResult as RealLicenseResult, type AustralianState } from './licenseVerification';

export type { AustralianState } from './licenseVerification';

export interface ABNVerificationResult {
  abn: string;
  isValid: boolean;
  entityName: string | null;
  entityType: string | null;
  gstRegistered: boolean;
  status: 'active' | 'cancelled' | 'not_found';
  lastUpdated: Date | null;
  message: string;
}

export interface LicenseVerificationResult {
  licenseNumber: string;
  isValid: boolean;
  holderName: string | null;
  licenseType: string | null;
  expiryDate: Date | null;
  status: 'active' | 'expired' | 'suspended' | 'cancelled' | 'not_found';
  state: AustralianState;
  authorityName: string;
  authorityUrl?: string;
  verificationUrl?: string;
  message: string;
}

export interface InsuranceRequirement {
  trade: string;
  state: AustralianState;
  publicLiabilityMin: number;
  professionalIndemnityMin: number | null;
  workersCompRequired: boolean;
  notes: string;
}

export interface ContractorCredential {
  id: number;
  contractorName: string;
  abn: string;
  licenseNumber: string | null;
  licenseState: AustralianState | null;
  insuranceExpiry: Date | null;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'expired';
  lastVerified: Date | null;
}

// Real insurance requirements by state and trade (based on actual regulations)
const INSURANCE_REQUIREMENTS: Record<string, Record<AustralianState, InsuranceRequirement>> = {
  electrician: {
    nsw: { trade: 'electrician', state: 'nsw', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NSW Fair Trading requires $5M public liability for electrical contractors' },
    vic: { trade: 'electrician', state: 'vic', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'VBA requires $5M public liability for registered electrical contractors' },
    qld: { trade: 'electrician', state: 'qld', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'QBCC requires minimum $5M public liability insurance' },
    sa: { trade: 'electrician', state: 'sa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'SA CBS requires $5M public liability for electrical work' },
    wa: { trade: 'electrician', state: 'wa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'WA Building Commission requires $5M public liability' },
    tas: { trade: 'electrician', state: 'tas', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'CBOS Tasmania requires $5M public liability' },
    nt: { trade: 'electrician', state: 'nt', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NT Licensing requires $5M public liability' },
    act: { trade: 'electrician', state: 'act', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'Access Canberra requires $5M public liability' },
  },
  plumber: {
    nsw: { trade: 'plumber', state: 'nsw', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NSW Fair Trading requires $5M public liability for plumbing contractors' },
    vic: { trade: 'plumber', state: 'vic', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'VBA requires $5M public liability for licensed plumbers' },
    qld: { trade: 'plumber', state: 'qld', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'QBCC requires minimum $5M public liability insurance' },
    sa: { trade: 'plumber', state: 'sa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'SA CBS requires $5M public liability for plumbing work' },
    wa: { trade: 'plumber', state: 'wa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'WA Building Commission requires $5M public liability' },
    tas: { trade: 'plumber', state: 'tas', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'CBOS Tasmania requires $5M public liability' },
    nt: { trade: 'plumber', state: 'nt', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NT Licensing requires $5M public liability' },
    act: { trade: 'plumber', state: 'act', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'Access Canberra requires $5M public liability' },
  },
  builder: {
    nsw: { trade: 'builder', state: 'nsw', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'NSW requires $10M public liability and home building compensation fund coverage for work over $20,000' },
    vic: { trade: 'builder', state: 'vic', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'VBA requires $10M public liability and domestic building insurance for work over $16,000' },
    qld: { trade: 'builder', state: 'qld', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'QBCC requires $10M public liability and home warranty insurance' },
    sa: { trade: 'builder', state: 'sa', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'SA requires $10M public liability and building indemnity insurance' },
    wa: { trade: 'builder', state: 'wa', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'WA requires $10M public liability and home indemnity insurance' },
    tas: { trade: 'builder', state: 'tas', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'Tasmania requires $10M public liability and building warranty insurance' },
    nt: { trade: 'builder', state: 'nt', publicLiabilityMin: 10000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NT requires $10M public liability for building contractors' },
    act: { trade: 'builder', state: 'act', publicLiabilityMin: 10000000, professionalIndemnityMin: 1000000, workersCompRequired: true, notes: 'ACT requires $10M public liability and home building cover' },
  },
  roofer: {
    nsw: { trade: 'roofer', state: 'nsw', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NSW requires $5M public liability for roofing contractors' },
    vic: { trade: 'roofer', state: 'vic', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'VBA requires $5M public liability for roof plumbers and roofers' },
    qld: { trade: 'roofer', state: 'qld', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'QBCC requires $5M public liability for roofing work' },
    sa: { trade: 'roofer', state: 'sa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'SA requires $5M public liability for roofing contractors' },
    wa: { trade: 'roofer', state: 'wa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'WA requires $5M public liability for roofing work' },
    tas: { trade: 'roofer', state: 'tas', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'Tasmania requires $5M public liability for roofing contractors' },
    nt: { trade: 'roofer', state: 'nt', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NT requires $5M public liability for roofing work' },
    act: { trade: 'roofer', state: 'act', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'ACT requires $5M public liability for roofing contractors' },
  },
  landscaper: {
    nsw: { trade: 'landscaper', state: 'nsw', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NSW recommends $5M public liability for landscaping contractors' },
    vic: { trade: 'landscaper', state: 'vic', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'VIC recommends $5M public liability for landscaping work' },
    qld: { trade: 'landscaper', state: 'qld', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'QBCC requires $5M public liability for structural landscaping' },
    sa: { trade: 'landscaper', state: 'sa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'SA recommends $5M public liability for landscaping contractors' },
    wa: { trade: 'landscaper', state: 'wa', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'WA recommends $5M public liability for landscaping work' },
    tas: { trade: 'landscaper', state: 'tas', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'Tasmania recommends $5M public liability for landscaping contractors' },
    nt: { trade: 'landscaper', state: 'nt', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'NT recommends $5M public liability for landscaping work' },
    act: { trade: 'landscaper', state: 'act', publicLiabilityMin: 5000000, professionalIndemnityMin: null, workersCompRequired: true, notes: 'ACT recommends $5M public liability for landscaping contractors' },
  },
};

/**
 * Validate ABN format (11 digits with valid checksum)
 */
export function validateABNFormat(abn: string): boolean {
  return validateABNChecksum(abn);
}

/**
 * Verify ABN against Australian Business Register
 */
export async function verifyABN(abn: string): Promise<ABNVerificationResult> {
  const result = await verifyABNReal(abn);
  
  return {
    abn: result.abn,
    isValid: result.isValid,
    entityName: result.entityName || null,
    entityType: result.entityType || null,
    gstRegistered: result.gstRegistered || false,
    status: result.status === 'active' ? 'active' : result.status === 'cancelled' ? 'cancelled' : 'not_found',
    lastUpdated: result.verifiedAt ? new Date(result.verifiedAt) : null,
    message: result.message
  };
}

/**
 * Verify contractor license against state authority
 */
export async function verifyLicense(licenseNumber: string, state: AustralianState): Promise<LicenseVerificationResult> {
  const result = await verifyLicenseReal(licenseNumber, state);
  
  return {
    licenseNumber: result.licenseNumber,
    isValid: result.isValid,
    holderName: result.holderName || null,
    licenseType: result.licenseClass || null,
    expiryDate: result.expiryDate ? new Date(result.expiryDate) : null,
    status: result.status === 'active' ? 'active' : 
            result.status === 'expired' ? 'expired' :
            result.status === 'suspended' ? 'suspended' :
            result.status === 'cancelled' ? 'cancelled' : 'not_found',
    state: result.state,
    authorityName: result.authorityName,
    authorityUrl: result.authorityUrl,
    verificationUrl: result.verificationUrl,
    message: result.message
  };
}

/**
 * Get insurance requirements for a trade in a specific state
 */
export async function getInsuranceRequirements(trade: string, state: AustralianState): Promise<InsuranceRequirement> {
  const tradeReqs = INSURANCE_REQUIREMENTS[trade.toLowerCase()];
  
  if (tradeReqs && tradeReqs[state]) {
    return tradeReqs[state];
  }
  
  // Default requirements if specific trade not found
  return {
    trade,
    state,
    publicLiabilityMin: 5000000,
    professionalIndemnityMin: null,
    workersCompRequired: true,
    notes: `Standard insurance requirements for ${trade} in ${state.toUpperCase()}. Verify with local authority.`
  };
}

/**
 * Get all licensing authorities
 */
export function getAllLicensingAuthorities() {
  return Object.entries(STATE_AUTHORITIES).map(([state, authority]) => ({
    state: state as AustralianState,
    name: authority.name,
    fullName: authority.fullName,
    url: authority.url,
    lookupUrl: authority.lookupUrl,
    contactPhone: authority.contactPhone,
    tradeTypes: authority.tradeTypes
  }));
}

/**
 * Get license class details
 */
export function getLicenseClassDetails(classCode: string) {
  return LICENSE_CLASSES[classCode] || null;
}

/**
 * Store contractor credentials in database
 */
export async function storeContractorCredential(credential: Omit<ContractorCredential, 'id'>): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.execute(sql`
      INSERT INTO contractor_credentials 
      (contractor_name, abn, license_number, license_state, insurance_expiry, verification_status, last_verified)
      VALUES (${credential.contractorName}, ${credential.abn}, ${credential.licenseNumber}, ${credential.licenseState}, ${credential.insuranceExpiry}, ${credential.verificationStatus}, ${credential.lastVerified})
    `);
    
    return (result as any).insertId || null;
  } catch (error) {
    console.error('[Credentials] Error storing credential:', error);
    return null;
  }
}

/**
 * Get contractor credential by ABN
 */
export async function getContractorByABN(abn: string): Promise<ContractorCredential | null> {
  const db = await getDb();
  if (!db) return null;
  
  const cleanABN = abn.replace(/[\s-]/g, '');
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM contractor_credentials WHERE abn = ${cleanABN} LIMIT 1
    `);
    
    const rows = (result as any)[0] as any[];
    if (rows.length === 0) return null;
    
    const row = rows[0];
    return {
      id: row.id,
      contractorName: row.contractor_name,
      abn: row.abn,
      licenseNumber: row.license_number,
      licenseState: row.license_state,
      insuranceExpiry: row.insurance_expiry ? new Date(row.insurance_expiry) : null,
      verificationStatus: row.verification_status,
      lastVerified: row.last_verified ? new Date(row.last_verified) : null
    };
  } catch (error) {
    console.error('[Credentials] Error fetching credential:', error);
    return null;
  }
}
