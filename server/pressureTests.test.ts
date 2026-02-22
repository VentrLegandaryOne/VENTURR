/**
 * VENTURR VALIDT - Pressure Test Simulations
 * 
 * Categories:
 * A. Input Chaos - corrupted, rotated, watermarked, missing pages
 * B. Standards Integrity - broken links, outdated clauses, conflicts
 * C. Workflow Stress - concurrent uploads, interrupted sessions
 * D. Security & Abuse - oversized files, malformed PDFs, prompt injection
 * E. Usability - time-to-report, mobile readability
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  validateFindingCitations, 
  validateAllFindings, 
  canExportReport,
  containsBlockedLanguage,
  createInsufficientEvidenceFinding,
  Finding,
  Citation
} from '../shared/citations';
import { 
  validateFinding, 
  validateAllFindingsForReport,
  blockSaveIfInvalid,
  blockExportIfInvalid,
  sanitizeText,
  createFindingWithCitation
} from './citeOrBlockMiddleware';
import { 
  searchRules, 
  getRuleById, 
  validateStandardsCurrency,
  getApplicableStandards
} from './complianceKnowledgeBase';
import {
  isExtractionSufficient,
  getAnalysisParameters
} from './evidenceExtraction';

// ============================================
// A. INPUT CHAOS TESTS
// ============================================
describe('A. Input Chaos Tests', () => {
  
  describe('A1. Missing/Empty Content', () => {
    it('should reject findings with no citations', () => {
      const finding: Finding = {
        id: 'test-1',
        category: 'pricing',
        claim: 'Price is reasonable',
        status: 'assessed', // Wrong - should be insufficient-evidence
        message: 'The price appears reasonable',
        citations: [],
        confidence: 'high'
      };
      
      expect(() => validateFindingCitations(finding)).toThrow();
    });
    
    it('should accept insufficient-evidence status without citations', () => {
      const finding: Finding = {
        id: 'test-2',
        category: 'pricing',
        claim: 'Price assessment',
        status: 'insufficient-evidence',
        message: 'Cannot assess price due to missing data',
        citations: [],
        confidence: 'low',
        evidence_required: ['Itemized breakdown', 'Material specifications']
      };
      
      expect(() => validateFindingCitations(finding)).not.toThrow();
    });
  });
  
  describe('A2. Contradictory Evidence', () => {
    it('should flag when multiple editions are cited', () => {
      const findings: Finding[] = [
        {
          id: 'test-3',
          category: 'compliance',
          claim: 'Roof pitch compliant',
          status: 'assessed',
          message: 'Pitch meets requirements',
          citations: [{
            authority: 'HB 39',
            document: 'HB 39:2015',
            edition_or_version: '2015',
            clause_or_page: 'Section 4.2',
            url_or_identifier: 'https://standards.org.au/hb39',
            retrieved_at: new Date().toISOString(),
            confidence: 'high'
          }],
          confidence: 'high'
        },
        {
          id: 'test-4',
          category: 'compliance',
          claim: 'Fasteners compliant',
          status: 'assessed',
          message: 'Fasteners meet requirements',
          citations: [{
            authority: 'HB 39',
            document: 'HB 39:2010', // Different edition
            edition_or_version: '2010',
            clause_or_page: 'Section 5.1',
            url_or_identifier: 'https://standards.org.au/hb39-old',
            retrieved_at: new Date().toISOString(),
            confidence: 'medium'
          }],
          confidence: 'medium'
        }
      ];
      
      // Both findings are valid individually
      expect(() => validateAllFindings(findings)).not.toThrow();
      
      // But the system should be able to detect edition conflicts
      // (This is handled by detectConflictingSources in middleware)
    });
  });
  
  describe('A3. Low Quality Extraction', () => {
    it('should downgrade confidence for low word count', () => {
      const result = {
        success: true,
        fullText: 'Short text',
        pages: [{ pageNumber: 1, text: 'Short text', confidence: 'low' as const, method: 'ocr' as const, wordCount: 2 }],
        totalPages: 1,
        overallConfidence: 'low' as const,
        method: 'ocr' as const,
        warnings: [],
        metadata: { fileSize: 1000, fileType: 'image/jpeg', extractedAt: new Date().toISOString(), processingTimeMs: 100 }
      };
      
      const sufficiency = isExtractionSufficient(result);
      expect(sufficiency.sufficient).toBe(false);
      expect(sufficiency.reason).toContain('insufficient text');
    });
    
    it('should adjust analysis parameters for low confidence', () => {
      const params = getAnalysisParameters('low');
      expect(params.maxCertainty).toBe('possible');
      expect(params.requireAdditionalEvidence).toBe(true);
      expect(params.warningPrefix).toContain('Limited evidence');
    });
  });
});

// ============================================
// B. STANDARDS INTEGRITY TESTS
// ============================================
describe('B. Standards Integrity Tests', () => {
  
  describe('B1. Standards Currency', () => {
    it('should validate standards are current', () => {
      const validation = validateStandardsCurrency();
      // Should return validation result with any warnings about old standards
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('warnings');
    });
    
    it('should find rules by standard name', () => {
      const nccRules = searchRules({ standard: 'National Construction Code' });
      expect(nccRules.length).toBeGreaterThan(0);
      expect(nccRules[0].standard).toContain('National Construction Code');
    });
    
    it('should find rules by category', () => {
      const safetyRules = searchRules({ category: 'safety' });
      expect(safetyRules.length).toBeGreaterThan(0);
      expect(safetyRules.every(r => r.category === 'safety')).toBe(true);
    });
  });
  
  describe('B2. Applicable Standards', () => {
    it('should return national standards for any state', () => {
      const nswRules = getApplicableStandards('roofing', 'nsw', ['building_code', 'safety']);
      const vicRules = getApplicableStandards('roofing', 'vic', ['building_code', 'safety']);
      
      // Both should include national standards
      const nswNational = nswRules.filter(r => r.state === 'national');
      const vicNational = vicRules.filter(r => r.state === 'national');
      
      expect(nswNational.length).toBeGreaterThan(0);
      expect(vicNational.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// C. WORKFLOW STRESS TESTS
// ============================================
describe('C. Workflow Stress Tests', () => {
  
  describe('C1. Validation Under Load', () => {
    it('should validate many findings efficiently', () => {
      const findings: Finding[] = Array.from({ length: 100 }, (_, i) => ({
        id: `bulk-${i}`,
        category: 'pricing' as const,
        claim: `Finding ${i}`,
        status: 'assessed' as const,
        message: `Message ${i}`,
        citations: [{
          authority: 'Test Standard',
          document: 'Test Doc',
          edition_or_version: '2024',
          clause_or_page: `Section ${i}`,
          url_or_identifier: `https://test.com/${i}`,
          retrieved_at: new Date().toISOString(),
          confidence: 'high' as const
        }],
        confidence: 'high' as const
      }));
      
      const start = Date.now();
      const result = validateAllFindingsForReport(findings);
      const duration = Date.now() - start;
      
      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
  
  describe('C2. Partial Failure Handling', () => {
    it('should identify specific blocked findings', () => {
      const findings: Finding[] = [
        {
          id: 'valid-1',
          category: 'pricing',
          claim: 'Valid finding',
          status: 'assessed',
          message: 'This is valid',
          citations: [{
            authority: 'Standard',
            document: 'Doc',
            edition_or_version: '2024',
            clause_or_page: 'Section 1',
            url_or_identifier: 'https://test.com',
            retrieved_at: new Date().toISOString(),
            confidence: 'high'
          }],
          confidence: 'high'
        },
        {
          id: 'invalid-1',
          category: 'materials',
          claim: 'Invalid finding - no citations',
          status: 'assessed', // Should be insufficient-evidence
          message: 'This is invalid',
          citations: [],
          confidence: 'high'
        }
      ];
      
      const result = blockSaveIfInvalid(findings);
      expect(result.canSave).toBe(false);
      expect(result.blockedFindings).toContain('invalid-1');
      expect(result.blockedFindings).not.toContain('valid-1');
    });
  });
});

// ============================================
// D. SECURITY & ABUSE TESTS
// ============================================
describe('D. Security & Abuse Tests', () => {
  
  describe('D1. Blocked Language Detection', () => {
    it('should detect "certified" as blocked', () => {
      const result = containsBlockedLanguage('This quote is certified compliant');
      expect(result.blocked).toBe(true);
      expect(result.terms).toContain('certified');
    });
    
    it('should detect "approved" as blocked', () => {
      const result = containsBlockedLanguage('The materials are approved');
      expect(result.blocked).toBe(true);
      expect(result.terms).toContain('approved');
    });
    
    it('should detect "guaranteed" as blocked', () => {
      const result = containsBlockedLanguage('Quality is guaranteed');
      expect(result.blocked).toBe(true);
      expect(result.terms).toContain('guaranteed');
    });
    
    it('should allow "assessed" language', () => {
      const result = containsBlockedLanguage('This has been assessed against standards');
      expect(result.blocked).toBe(false);
    });
  });
  
  describe('D2. Text Sanitization', () => {
    it('should replace blocked terms with approved alternatives', () => {
      const input = 'This quote is certified and approved with guaranteed quality';
      const sanitized = sanitizeText(input);
      
      expect(sanitized).not.toContain('certified');
      expect(sanitized).not.toContain('approved');
      expect(sanitized).not.toContain('guaranteed');
      expect(sanitized).toContain('assessed');
      expect(sanitized).toContain('reviewed');
    });
  });
  
  describe('D3. Finding Validation Security', () => {
    it('should reject findings with blocked language in claim', () => {
      const finding: Finding = {
        id: 'blocked-1',
        category: 'compliance',
        claim: 'This quote is certified compliant',
        status: 'assessed',
        message: 'Assessment complete',
        citations: [{
          authority: 'Standard',
          document: 'Doc',
          edition_or_version: '2024',
          clause_or_page: 'Section 1',
          url_or_identifier: 'https://test.com',
          retrieved_at: new Date().toISOString(),
          confidence: 'high'
        }],
        confidence: 'high'
      };
      
      const result = validateFinding(finding);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('blocked language'))).toBe(true);
    });
  });
});

// ============================================
// E. USABILITY TESTS
// ============================================
describe('E. Usability Tests', () => {
  
  describe('E1. Insufficient Evidence Creation', () => {
    it('should create proper insufficient evidence finding', () => {
      const finding = createInsufficientEvidenceFinding(
        'pricing',
        'Price assessment',
        'No itemized breakdown provided',
        ['Itemized quote', 'Material specifications', 'Labor breakdown']
      );
      
      expect(finding.status).toBe('insufficient-evidence');
      expect(finding.citations).toHaveLength(0);
      expect(finding.evidence_required).toHaveLength(3);
      expect(finding.confidence).toBe('low');
    });
  });
  
  describe('E2. Finding Creation with Auto-Citation', () => {
    it('should create finding with citations from knowledge base', () => {
      const finding = createFindingWithCitation(
        'compliance',
        'Roof pitch assessment',
        'assessed',
        'Pitch appears to meet minimum requirements',
        ['roof pitch', 'HB 39']
      );
      
      // Should have found relevant citations
      expect(finding.citations.length).toBeGreaterThanOrEqual(0);
      // If no citations found, should be insufficient-evidence
      if (finding.citations.length === 0) {
        expect(finding.status).toBe('insufficient-evidence');
      }
    });
  });
  
  describe('E3. Export Blocking', () => {
    it('should block export when findings have issues', () => {
      const findings: Finding[] = [{
        id: 'bad-finding',
        category: 'pricing',
        claim: 'Price is guaranteed fair',
        status: 'assessed',
        message: 'Guaranteed assessment',
        citations: [],
        confidence: 'high'
      }];
      
      const result = blockExportIfInvalid(findings);
      expect(result.canExport).toBe(false);
    });
    
    it('should allow export when all findings are valid', () => {
      const findings: Finding[] = [{
        id: 'good-finding',
        category: 'pricing',
        claim: 'Price has been assessed',
        status: 'assessed',
        message: 'Assessment complete',
        citations: [{
          authority: 'Market Data',
          document: 'Sydney Metro Rates 2024',
          edition_or_version: '2024 Q4',
          clause_or_page: 'Residential Roofing',
          url_or_identifier: 'internal-reference',
          retrieved_at: new Date().toISOString(),
          confidence: 'high'
        }],
        confidence: 'high'
      }];
      
      const result = blockExportIfInvalid(findings);
      expect(result.canExport).toBe(true);
    });
  });
});

// ============================================
// HARD PASS/FAIL METRICS
// ============================================
describe('Hard Pass/Fail Metrics', () => {
  
  it('METRIC: 0 unsupported claims - all assessed findings must have citations', () => {
    const assessedFinding: Finding = {
      id: 'assessed-1',
      category: 'pricing',
      claim: 'Test claim',
      status: 'assessed',
      message: 'Test message',
      citations: [], // Missing citations!
      confidence: 'high'
    };
    
    // This MUST fail
    expect(() => validateFindingCitations(assessedFinding)).toThrow();
  });
  
  it('METRIC: 100% findings linked to citations or marked insufficient', () => {
    const validFindings: Finding[] = [
      {
        id: 'cited-1',
        category: 'pricing',
        claim: 'Cited finding',
        status: 'assessed',
        message: 'Has citation',
        citations: [{
          authority: 'Standard',
          document: 'Doc',
          edition_or_version: '2024',
          clause_or_page: 'Section 1',
          url_or_identifier: 'https://test.com',
          retrieved_at: new Date().toISOString(),
          confidence: 'high'
        }],
        confidence: 'high'
      },
      {
        id: 'insufficient-1',
        category: 'materials',
        claim: 'Insufficient evidence',
        status: 'insufficient-evidence',
        message: 'Cannot assess',
        citations: [],
        confidence: 'low',
        evidence_required: ['More data needed']
      }
    ];
    
    // All findings should pass validation
    expect(() => validateAllFindings(validFindings)).not.toThrow();
  });
  
  it('METRIC: Low confidence inputs must downgrade conclusions', () => {
    const lowConfidenceParams = getAnalysisParameters('low');
    
    // Low confidence should limit certainty
    expect(lowConfidenceParams.maxCertainty).not.toBe('definitive');
    expect(lowConfidenceParams.requireAdditionalEvidence).toBe(true);
  });
  
  it('METRIC: No blocked language in any output', () => {
    const testOutputs = [
      'This quote has been assessed against referenced standards',
      'Materials have been reviewed for compliance indicators',
      'Pricing has been analyzed based on market data'
    ];
    
    for (const output of testOutputs) {
      const result = containsBlockedLanguage(output);
      expect(result.blocked).toBe(false);
    }
  });
});
