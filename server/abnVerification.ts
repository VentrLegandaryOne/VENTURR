/**
 * VENTURR VALDT - Real ABN Verification Service
 * Connects to Australian Business Register (ABR) for live ABN validation
 * 
 * ABR Web Services: https://abr.business.gov.au/Tools/WebServices
 * Note: Requires GUID registration for production use
 */

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

// ABR Web Services endpoint
const ABR_ENDPOINT = 'https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx';

// For demo/development, use the public ABN Lookup (no GUID required for basic validation)
const ABN_LOOKUP_URL = 'https://abr.business.gov.au/ABN/View';

export interface ABNVerificationResult {
  isValid: boolean;
  abn: string;
  status: 'active' | 'cancelled' | 'not_found' | 'invalid_format' | 'error';
  entityName?: string;
  entityType?: string;
  gstRegistered?: boolean;
  gstRegistrationDate?: string;
  businessNames?: string[];
  state?: string;
  postcode?: string;
  message: string;
  verifiedAt: string;
  source: 'abr_api' | 'checksum_only' | 'cached';
}

/**
 * Validate ABN checksum using the official algorithm
 * ABN validation algorithm: https://abr.business.gov.au/Help/AbnFormat
 */
export function validateABNChecksum(abn: string): boolean {
  // Remove spaces and non-numeric characters
  const cleanABN = abn.replace(/\D/g, '');
  
  if (cleanABN.length !== 11) {
    return false;
  }
  
  // ABN validation weights
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  
  // Convert to array of digits
  const digits = cleanABN.split('').map(Number);
  
  // Subtract 1 from the first digit
  digits[0] -= 1;
  
  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }
  
  // Valid if divisible by 89
  return sum % 89 === 0;
}

/**
 * Format ABN with standard spacing (XX XXX XXX XXX)
 */
export function formatABN(abn: string): string {
  const clean = abn.replace(/\D/g, '');
  if (clean.length !== 11) return abn;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
}

/**
 * Verify ABN against Australian Business Register
 * Uses checksum validation + optional API lookup
 */
export async function verifyABN(abn: string, useAPI: boolean = false): Promise<ABNVerificationResult> {
  const cleanABN = abn.replace(/\D/g, '');
  const verifiedAt = new Date().toISOString();
  
  // Basic format validation
  if (cleanABN.length !== 11) {
    return {
      isValid: false,
      abn: abn,
      status: 'invalid_format',
      message: 'ABN must be exactly 11 digits',
      verifiedAt,
      source: 'checksum_only'
    };
  }
  
  // Checksum validation
  if (!validateABNChecksum(cleanABN)) {
    return {
      isValid: false,
      abn: formatABN(cleanABN),
      status: 'invalid_format',
      message: 'ABN checksum validation failed. This is not a valid ABN.',
      verifiedAt,
      source: 'checksum_only'
    };
  }
  
  // If API lookup is enabled and GUID is configured
  if (useAPI && process.env.ABR_GUID) {
    try {
      const apiResult = await lookupABNFromABR(cleanABN);
      return apiResult;
    } catch (error) {
      console.error('[ABN] API lookup failed, falling back to checksum:', error);
    }
  }
  
  // Return checksum-validated result
  return {
    isValid: true,
    abn: formatABN(cleanABN),
    status: 'active',
    message: 'ABN format is valid. For full business details, ABR API access is required.',
    verifiedAt,
    source: 'checksum_only'
  };
}

/**
 * Lookup ABN details from ABR Web Services
 * Requires registered GUID from https://abr.business.gov.au/Tools/WebServices
 */
async function lookupABNFromABR(abn: string): Promise<ABNVerificationResult> {
  const guid = process.env.ABR_GUID;
  const verifiedAt = new Date().toISOString();
  
  if (!guid) {
    throw new Error('ABR_GUID not configured');
  }
  
  try {
    // ABR XML Search endpoint
    const response = await axios.get(`${ABR_ENDPOINT}/SearchByABNv202001`, {
      params: {
        searchString: abn,
        includeHistoricalDetails: 'N',
        authenticationGuid: guid
      },
      timeout: 10000
    });
    
    // Parse XML response
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    const result = parser.parse(response.data);
    
    // Extract business record
    const businessEntity = result?.ABRPayloadSearchResults?.response?.businessEntity202001;
    
    if (!businessEntity) {
      return {
        isValid: false,
        abn: formatABN(abn),
        status: 'not_found',
        message: 'ABN not found in Australian Business Register',
        verifiedAt,
        source: 'abr_api'
      };
    }
    
    // Extract entity details
    const entityStatus = businessEntity.entityStatus?.entityStatusCode;
    const isActive = entityStatus === 'Active';
    
    // Get entity name
    let entityName = '';
    if (businessEntity.mainName?.organisationName) {
      entityName = businessEntity.mainName.organisationName;
    } else if (businessEntity.legalName) {
      const ln = businessEntity.legalName;
      entityName = `${ln.givenName || ''} ${ln.familyName || ''}`.trim();
    }
    
    // Get GST registration
    const gst = businessEntity.goodsAndServicesTax;
    const gstRegistered = gst?.effectiveFrom && !gst?.effectiveTo;
    
    // Get business names
    const businessNames: string[] = [];
    if (businessEntity.businessName) {
      const names = Array.isArray(businessEntity.businessName) 
        ? businessEntity.businessName 
        : [businessEntity.businessName];
      names.forEach((n: any) => {
        if (n.organisationName) businessNames.push(n.organisationName);
      });
    }
    
    // Get address
    const address = businessEntity.mainBusinessPhysicalAddress;
    
    return {
      isValid: isActive,
      abn: formatABN(abn),
      status: isActive ? 'active' : 'cancelled',
      entityName,
      entityType: businessEntity.entityType?.entityDescription,
      gstRegistered,
      gstRegistrationDate: gst?.effectiveFrom,
      businessNames,
      state: address?.stateCode,
      postcode: address?.postcode,
      message: isActive 
        ? 'ABN verified as active in Australian Business Register'
        : 'ABN found but status is not active',
      verifiedAt,
      source: 'abr_api'
    };
    
  } catch (error) {
    console.error('[ABN] ABR API error:', error);
    throw error;
  }
}

/**
 * Batch verify multiple ABNs
 */
export async function verifyABNBatch(abns: string[]): Promise<ABNVerificationResult[]> {
  const results = await Promise.all(
    abns.map(abn => verifyABN(abn))
  );
  return results;
}

/**
 * Known valid ABNs for testing (real Australian businesses)
 * These are publicly registered ABNs that can be verified
 */
export const KNOWN_VALID_ABNS = {
  // Major Australian companies (publicly available)
  'COMMONWEALTH_BANK': '48123123124', // Example format
  'TELSTRA': '33051775556',
  'BHP': '49004028077',
  'WOOLWORTHS': '88000014675',
  'WESFARMERS': '28008984049',
};
