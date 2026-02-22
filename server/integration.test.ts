/**
 * VENTURR VALIDT - Integration & E2E Tests
 * 
 * Tests the complete flow:
 * Upload → Extract → Analyze → Cite → Report
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  Finding, 
  Citation,
  validateAllFindings,
  canExportReport
} from '../shared/citations';
import { 
  validateAllFindingsForReport,
  blockExportIfInvalid,
  createFindingWithCitation,
  sanitizeText
} from './citeOrBlockMiddleware';
import {
  searchRules,
  getRuleById,
  ruleToCitation,
  getApplicableStandards,
  COMPLIANCE_RULES
} from './complianceKnowledgeBase';
import {
  isExtractionSufficient,
  getAnalysisParameters,
  ExtractionResult
} from './evidenceExtraction';
import {
  generateClientReport,
  generateCourtReport,
  createReportSection,
  canExportReport as canExportReportEngine,
  formatReportForPDF
} from './reportEngine';
import {
  createAuditEntry,
  logExtraction,
  logPrompt,
  logSources,
  logOutputs,
  getAuditTrail,
  PROMPT_VERSIONS
} from './auditTrail';

// ============================================
// INTEGRATION TESTS
// ============================================
describe('Integration Tests', () => {
  
  describe('Citation Validation Integration', () => {
    it('should validate citation from knowledge base rule', () => {
      const rule = COMPLIANCE_RULES[0]; // NCC rule
      const citation = ruleToCitation(rule);
      
      expect(citation.authority).toBe(rule.standard);
      expect(citation.document).toBe(rule.edition);
      expect(citation.clause_or_page).toBe(rule.clause);
      expect(citation.confidence).toBe('high');
      expect(citation.retrieved_at).toBeDefined();
    });
    
    it('should create finding with auto-citation from knowledge base', () => {
      const finding = createFindingWithCitation(
        'installation',
        'Fastener requirements assessment',
        'assessed',
        'Fasteners appear to meet HB 39 requirements',
        ['fastener', 'HB 39']
      );
      
      // Should find HB 39 fastener rule
      if (finding.citations.length > 0) {
        expect(finding.status).toBe('assessed');
        expect(finding.citations[0].authority).toContain('HB');
      } else {
        // If no citation found, should be insufficient-evidence
        expect(finding.status).toBe('insufficient-evidence');
      }
    });
  });
  
  describe('Extraction to Analysis Pipeline', () => {
    it('should adjust analysis based on extraction confidence', () => {
      // High confidence extraction
      const highConfParams = getAnalysisParameters('high');
      expect(highConfParams.maxCertainty).toBe('likely');
      expect(highConfParams.requireAdditionalEvidence).toBe(false);
      
      // Medium confidence extraction
      const medConfParams = getAnalysisParameters('medium');
      expect(medConfParams.maxCertainty).toBe('likely');
      expect(medConfParams.requireAdditionalEvidence).toBe(true);
      
      // Low confidence extraction
      const lowConfParams = getAnalysisParameters('low');
      expect(lowConfParams.maxCertainty).toBe('possible');
      expect(lowConfParams.requireAdditionalEvidence).toBe(true);
    });
    
    it('should check extraction sufficiency correctly', () => {
      const sufficientResult: ExtractionResult = {
        success: true,
        fullText: 'Quote from ABC Roofing Pty Ltd ABN 12345678901. Total: $15,000 including GST. Materials: Colorbond steel roofing sheets. Labour included.',
        pages: [{
          pageNumber: 1,
          text: 'Quote from ABC Roofing...',
          confidence: 'high',
          method: 'text',
          wordCount: 150
        }],
        totalPages: 1,
        overallConfidence: 'high',
        method: 'pdf-parse',
        warnings: [],
        metadata: {
          fileSize: 50000,
          fileType: 'application/pdf',
          extractedAt: new Date().toISOString(),
          processingTimeMs: 500
        }
      };
      
      const sufficiency = isExtractionSufficient(sufficientResult);
      expect(sufficiency.sufficient).toBe(true);
    });
  });
  
  describe('Report Generation Pipeline', () => {
    it('should generate client report with valid findings', () => {
      const citation: Citation = {
        authority: 'Market Data',
        document: 'Sydney Metro Roofing Rates 2024',
        edition_or_version: '2024 Q4',
        clause_or_page: 'Residential Section',
        url_or_identifier: 'internal-market-data',
        retrieved_at: new Date().toISOString(),
        confidence: 'high'
      };
      
      const finding: Finding = {
        id: 'pricing-1',
        category: 'pricing',
        claim: 'Quote pricing has been assessed against market rates',
        status: 'assessed',
        message: 'Pricing appears within typical market range for Sydney metro residential roofing',
        citations: [citation],
        confidence: 'high'
      };
      
      const section = createReportSection(
        'pricing',
        'Pricing Assessment',
        [finding],
        85,
        'high',
        ['Based on 2024 Q4 Sydney metro rates', 'Assumes standard residential property']
      );
      
      expect(section.findings).toHaveLength(1);
      expect(section.citations).toHaveLength(1);
      expect(section.score).toBe(85);
      
      // Generate full report
      const report = generateClientReport(
        1,
        [section],
        85,
        'green',
        'high',
        [{
          priority: 'low',
          title: 'Consider multiple quotes',
          description: 'Always recommended to obtain 2-3 quotes for comparison',
          relatedFindings: ['pricing-1']
        }],
        [],
        '123 Test Street, Sydney',
        'ABC Roofing Pty Ltd'
      );
      
      expect(report.reportType).toBe('client');
      expect(report.overallScore).toBe(85);
      expect(report.sections).toHaveLength(1);
      expect(report.disclaimer).toContain('NOT a substitute for professional advice');
    });
    
    it('should generate court report with audit trail', () => {
      // Create audit entry first
      const quoteId = 999;
      createAuditEntry(quoteId, { fileUrl: 'https://test.com/quote.pdf', fileSize: 50000 });
      logExtraction(quoteId, 'pdf-parse', 5000, 'high', 3);
      logPrompt(quoteId, 'pricing', 'Analyze pricing...');
      logOutputs(quoteId, 85, 4, 4, 0);
      
      const citation: Citation = {
        authority: 'National Construction Code',
        document: 'NCC 2022 Volume Two',
        edition_or_version: '2022',
        clause_or_page: 'Section 3.5.2.1',
        url_or_identifier: 'https://ncc.abcb.gov.au',
        retrieved_at: new Date().toISOString(),
        confidence: 'high'
      };
      
      const finding: Finding = {
        id: 'compliance-1',
        category: 'compliance',
        claim: 'Roof covering materials assessed against NCC requirements',
        status: 'assessed',
        message: 'Materials specification references NCC 2022 compliant products',
        citations: [citation],
        confidence: 'high'
      };
      
      const section = createReportSection(
        'compliance',
        'Compliance Assessment',
        [finding],
        90,
        'high',
        ['Based on NCC 2022 requirements']
      );
      
      const courtReport = generateCourtReport(
        quoteId,
        [section],
        90,
        'green',
        'high',
        [],
        [],
        '123 Test Street',
        'ABC Roofing'
      );
      
      expect(courtReport.reportType).toBe('court');
      expect(courtReport.auditTrail.length).toBeGreaterThan(0);
      expect(courtReport.methodology).toBeDefined();
      expect(courtReport.expertWitnessStatement).toContain('METHODOLOGY');
      expect(courtReport.legalNotices.length).toBeGreaterThan(0);
    });
    
    it('should block report generation with blocked language', () => {
      const badFinding: Finding = {
        id: 'bad-1',
        category: 'compliance',
        claim: 'This quote is certified compliant', // BLOCKED LANGUAGE
        status: 'assessed',
        message: 'Certified assessment',
        citations: [{
          authority: 'Test',
          document: 'Test',
          edition_or_version: '2024',
          clause_or_page: 'Section 1',
          url_or_identifier: 'test',
          retrieved_at: new Date().toISOString(),
          confidence: 'high'
        }],
        confidence: 'high'
      };
      
      const section = createReportSection(
        'compliance',
        'Test Section',
        [badFinding],
        90,
        'high',
        []
      );
      
      // Should throw due to blocked language
      expect(() => generateClientReport(
        1,
        [section],
        90,
        'green',
        'high',
        [],
        []
      )).toThrow();
    });
  });
  
  describe('Audit Trail Integration', () => {
    it('should track complete verification workflow', () => {
      const quoteId = 888;
      
      // Step 1: Create entry
      const entryId = createAuditEntry(quoteId, {
        fileUrl: 'https://storage.example.com/quote.pdf',
        fileSize: 75000,
        fileType: 'application/pdf'
      });
      expect(entryId).toContain('audit-888');
      
      // Step 2: Log extraction
      logExtraction(quoteId, 'pdf-parse', 8500, 'high', 5);
      
      // Step 3: Log prompts
      logPrompt(quoteId, 'pricing', 'Analyze pricing against market rates...');
      logPrompt(quoteId, 'materials', 'Analyze materials specifications...');
      logPrompt(quoteId, 'compliance', 'Check compliance with NCC 2022...');
      logPrompt(quoteId, 'warranty', 'Analyze warranty terms...');
      
      // Step 4: Log sources
      logSources(quoteId, 
        ['NCC 2022', 'HB 39:2015', 'AS 1397:2021'],
        ['NCC-2022-3.5.2.1', 'HB39-2015-4.2', 'AS1397-2021-5.2']
      );
      
      // Step 5: Log outputs
      logOutputs(quoteId, 82, 12, 15, 2);
      
      // Verify audit trail
      const trail = getAuditTrail(quoteId);
      expect(trail.length).toBe(1);
      expect(trail[0].extraction.method).toBe('pdf-parse');
      expect(trail[0].extraction.confidence).toBe('high');
      expect(trail[0].prompts.length).toBe(4);
      expect(trail[0].sources.sourcesRetrieved.length).toBe(3);
      expect(trail[0].outputs.overallScore).toBe(82);
    });
    
    it('should use correct prompt versions', () => {
      expect(PROMPT_VERSIONS.pricing).toBe('v1.0.0');
      expect(PROMPT_VERSIONS.materials).toBe('v1.0.0');
      expect(PROMPT_VERSIONS.compliance).toBe('v1.0.0');
      expect(PROMPT_VERSIONS.warranty).toBe('v1.0.0');
    });
  });
  
  describe('PDF Export Pipeline', () => {
    it('should format report for PDF export', () => {
      const citation: Citation = {
        authority: 'HB 39',
        document: 'HB 39:2015',
        edition_or_version: '2015',
        clause_or_page: 'Section 4.2',
        url_or_identifier: 'https://standards.org.au',
        retrieved_at: new Date().toISOString(),
        confidence: 'high'
      };
      
      const finding: Finding = {
        id: 'test-1',
        category: 'installation',
        claim: 'Roof pitch has been assessed',
        status: 'assessed',
        message: 'Pitch appears to meet minimum requirements per HB 39',
        citations: [citation],
        confidence: 'high'
      };
      
      const section = createReportSection(
        'compliance',
        'Installation Assessment',
        [finding],
        88,
        'high',
        ['Standard residential installation assumed']
      );
      
      const report = generateClientReport(
        100,
        [section],
        88,
        'green',
        'high',
        [],
        [],
        '456 Example Ave',
        'Test Roofing Co'
      );
      
      const markdown = formatReportForPDF(report);
      
      expect(markdown).toContain('# VENTURR VALIDT');
      expect(markdown).toContain('**Overall Score:** 88/100');
      expect(markdown).toContain('Installation Assessment');
      expect(markdown).toContain('HB 39');
      expect(markdown).toContain('Disclaimer');
    });
    
    it('should block export for invalid reports', () => {
      const invalidFinding: Finding = {
        id: 'invalid-1',
        category: 'pricing',
        claim: 'Price assessment',
        status: 'assessed',
        message: 'No citations',
        citations: [], // Missing citations!
        confidence: 'high'
      };
      
      const section = createReportSection(
        'pricing',
        'Pricing',
        [invalidFinding],
        50,
        'low',
        []
      );
      
      // Should throw when trying to generate
      expect(() => generateClientReport(
        1,
        [section],
        50,
        'red',
        'low',
        [],
        []
      )).toThrow();
    });
  });
});

// ============================================
// E2E SIMULATION TESTS
// ============================================
describe('E2E Simulation Tests', () => {
  
  describe('Complete Verification Flow Simulation', () => {
    it('should simulate complete quote verification', () => {
      const quoteId = 777;
      
      // 1. Simulate file upload and audit entry
      createAuditEntry(quoteId, {
        fileUrl: 'https://storage.example.com/quote-777.pdf',
        fileSize: 125000,
        fileType: 'application/pdf'
      });
      
      // 2. Simulate extraction
      logExtraction(quoteId, 'pdf-parse', 12000, 'high', 4);
      
      // 3. Get applicable standards
      const applicableStandards = getApplicableStandards(
        'roofing',
        'nsw',
        ['building_code', 'installation', 'safety', 'materials']
      );
      expect(applicableStandards.length).toBeGreaterThan(0);
      
      // 4. Create findings with citations from knowledge base
      const findings: Finding[] = [];
      
      // Pricing finding (market data citation)
      findings.push({
        id: 'pricing-sim-1',
        category: 'pricing',
        claim: 'Quote pricing has been assessed against Sydney metro market rates',
        status: 'assessed',
        message: 'Total of $18,500 is within typical range for 150sqm residential re-roof',
        citations: [{
          authority: 'Market Analysis',
          document: 'Sydney Metro Roofing Rates',
          edition_or_version: '2024 Q4',
          clause_or_page: 'Residential Metal Roofing',
          url_or_identifier: 'internal-market-data-2024q4',
          retrieved_at: new Date().toISOString(),
          confidence: 'high'
        }],
        confidence: 'high'
      });
      
      // Materials finding (AS 1397 citation)
      const materialsRule = getRuleById('AS1397-2021-5.2');
      if (materialsRule) {
        findings.push({
          id: 'materials-sim-1',
          category: 'materials',
          claim: 'Material specifications have been assessed against AS 1397',
          status: 'assessed',
          message: 'Colorbond 0.48mm BMT meets minimum thickness requirements',
          citations: [ruleToCitation(materialsRule)],
          confidence: 'high'
        });
      }
      
      // Compliance finding (NCC citation)
      const complianceRule = getRuleById('NCC-2022-3.5.2.1');
      if (complianceRule) {
        findings.push({
          id: 'compliance-sim-1',
          category: 'compliance',
          claim: 'Roof covering materials assessed against NCC requirements',
          status: 'assessed',
          message: 'Materials specification indicates compliance with AS 1562.1 as required by NCC',
          citations: [ruleToCitation(complianceRule)],
          confidence: 'high'
        });
      }
      
      // Installation finding (HB 39 citation)
      const installRule = getRuleById('HB39-2015-4.2');
      if (installRule) {
        findings.push({
          id: 'install-sim-1',
          category: 'compliance',
          claim: 'Roof pitch has been assessed against HB 39 requirements',
          status: 'assessed',
          message: 'Specified 15° pitch exceeds minimum 5° requirement for corrugated profile',
          citations: [ruleToCitation(installRule)],
          confidence: 'high'
        });
      }
      
      // Warranty finding
      const warrantyRule = getRuleById('LYSAGHT-COLORBOND-2024-WTY');
      if (warrantyRule) {
        findings.push({
          id: 'warranty-sim-1',
          category: 'warranty',
          claim: 'Warranty terms have been assessed against manufacturer standards',
          status: 'assessed',
          message: '10-year workmanship warranty meets industry expectations',
          citations: [ruleToCitation(warrantyRule)],
          confidence: 'high'
        });
      }
      
      // 5. Validate all findings
      expect(() => validateAllFindings(findings)).not.toThrow();
      
      // 6. Log prompts and sources
      logPrompt(quoteId, 'pricing', 'Analyze pricing...');
      logPrompt(quoteId, 'materials', 'Analyze materials...');
      logPrompt(quoteId, 'compliance', 'Check compliance...');
      logPrompt(quoteId, 'warranty', 'Analyze warranty...');
      
      logSources(quoteId,
        ['NCC 2022', 'HB 39:2015', 'AS 1397:2021', 'Lysaght Warranty'],
        findings.flatMap(f => f.citations.map(c => c.url_or_identifier))
      );
      
      // 7. Create report sections
      const pricingSection = createReportSection(
        'pricing',
        'Pricing Assessment',
        findings.filter(f => f.category === 'pricing'),
        85,
        'high',
        ['Based on Sydney metro 2024 Q4 rates']
      );
      
      const materialsSection = createReportSection(
        'materials',
        'Materials Assessment',
        findings.filter(f => f.category === 'materials'),
        90,
        'high',
        ['Based on AS 1397:2021 requirements']
      );
      
      const complianceSection = createReportSection(
        'compliance',
        'Compliance Assessment',
        findings.filter(f => f.category === 'compliance'),
        88,
        'high',
        ['Based on NCC 2022 and HB 39:2015']
      );
      
      const warrantySection = createReportSection(
        'warranty',
        'Warranty Assessment',
        findings.filter(f => f.category === 'warranty'),
        82,
        'high',
        ['Based on manufacturer warranty terms']
      );
      
      // 8. Generate reports
      const overallScore = Math.round(
        pricingSection.score * 0.3 +
        materialsSection.score * 0.25 +
        complianceSection.score * 0.3 +
        warrantySection.score * 0.15
      );
      
      const clientReport = generateClientReport(
        quoteId,
        [pricingSection, materialsSection, complianceSection, warrantySection],
        overallScore,
        overallScore >= 85 ? 'green' : overallScore >= 70 ? 'amber' : 'red',
        'high',
        [{
          priority: 'low',
          title: 'Verify contractor credentials',
          description: 'Always verify ABN and insurance before signing',
          relatedFindings: []
        }],
        [],
        '789 Simulation St, Sydney NSW',
        'Simulation Roofing Pty Ltd'
      );
      
      // 9. Log final outputs
      logOutputs(quoteId, overallScore, findings.length, 
        findings.reduce((sum, f) => sum + f.citations.length, 0), 0);
      
      // 10. Verify complete flow
      expect(clientReport.reportType).toBe('client');
      expect(clientReport.overallScore).toBe(overallScore);
      expect(clientReport.sections).toHaveLength(4);
      expect(clientReport.standardsReferenced.length).toBeGreaterThan(0);
      
      // 11. Generate court report
      const courtReport = generateCourtReport(
        quoteId,
        [pricingSection, materialsSection, complianceSection, warrantySection],
        overallScore,
        overallScore >= 85 ? 'green' : overallScore >= 70 ? 'amber' : 'red',
        'high',
        [],
        [],
        '789 Simulation St, Sydney NSW',
        'Simulation Roofing Pty Ltd'
      );
      
      expect(courtReport.reportType).toBe('court');
      expect(courtReport.auditTrail.length).toBeGreaterThan(0);
      expect(courtReport.evidenceChain.length).toBeGreaterThan(0);
      
      // 12. Verify export capability
      const exportCheck = canExportReportEngine(clientReport);
      expect(exportCheck.canExport).toBe(true);
      
      // 13. Generate PDF markdown
      const pdfContent = formatReportForPDF(clientReport);
      expect(pdfContent).toContain('VENTURR VALIDT');
      expect(pdfContent).toContain('Disclaimer');
    });
  });
});
