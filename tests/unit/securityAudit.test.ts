import { describe, it, expect } from 'vitest';

describe('Security Configuration Audit', () => {
  describe('Environment Variables', () => {
    it('should have MAPBOX_TOKEN environment variable format in .env.example', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const envExamplePath = path.resolve(process.cwd(), '.env.example');
      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      expect(content).toContain('VITE_MAPBOX_TOKEN');
    });

    it('should have SendGrid environment variables in .env.example', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const envExamplePath = path.resolve(process.cwd(), '.env.example');
      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      expect(content).toContain('SENDGRID_API_KEY');
      expect(content).toContain('SENDGRID_FROM_EMAIL');
    });

    it('should have ALLOWED_ORIGINS in .env.example', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const envExamplePath = path.resolve(process.cwd(), '.env.example');
      const content = fs.readFileSync(envExamplePath, 'utf8');
      
      expect(content).toContain('ALLOWED_ORIGINS');
    });
  });

  describe('Mapbox Configuration', () => {
    it('should not contain hardcoded tokens in mapbox-config.ts', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const configPath = path.resolve(process.cwd(), 'client/src/lib/mapbox-config.ts');
      const content = fs.readFileSync(configPath, 'utf8');
      
      // Should not contain a hardcoded Mapbox token (starts with pk.)
      const hardcodedTokenPattern = /['"]pk\.[a-zA-Z0-9]+\.[a-zA-Z0-9_-]+['"]/;
      expect(content).not.toMatch(hardcodedTokenPattern);
      
      // Should use environment variable
      expect(content).toContain('import.meta.env.VITE_MAPBOX_TOKEN');
    });

    it('should have validation for missing Mapbox token', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const configPath = path.resolve(process.cwd(), 'client/src/lib/mapbox-config.ts');
      const content = fs.readFileSync(configPath, 'utf8');
      
      // Should have some form of validation or warning
      expect(content).toMatch(/warn|error|console|isMapboxConfigured/i);
    });
  });

  describe('Server Security', () => {
    it('should import helmet in server index', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('import helmet');
      expect(content).toContain('app.use(helmet');
    });

    it('should import cors in server index', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('import cors');
      expect(content).toContain('app.use(cors');
    });

    it('should import rate-limit in server index', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('rateLimit');
      expect(content).toMatch(/windowMs.*15.*60.*1000/);
    });

    it('should have CSRF protection', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('csrf');
    });

    it('should have health check endpoint', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('/api/health');
    });

    it('should have Content Security Policy configured', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('contentSecurityPolicy');
      expect(content).toContain('defaultSrc');
    });

    it('should have HSTS configured', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const serverPath = path.resolve(process.cwd(), 'server/_core/index.ts');
      const content = fs.readFileSync(serverPath, 'utf8');
      
      expect(content).toContain('hsts');
    });
  });

  describe('Release Checklist', () => {
    it('should have RELEASE_CHECKLIST.md file', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const checklistPath = path.resolve(process.cwd(), 'RELEASE_CHECKLIST.md');
      expect(fs.existsSync(checklistPath)).toBe(true);
    });

    it('should include security section in release checklist', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const checklistPath = path.resolve(process.cwd(), 'RELEASE_CHECKLIST.md');
      const content = fs.readFileSync(checklistPath, 'utf8');
      
      expect(content).toContain('Security');
      expect(content).toContain('CSRF');
      expect(content).toContain('Rate limiting');
    });
  });
});

describe('Cypress E2E Tests Configuration', () => {
  it('should have cypress.config.ts', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const configPath = path.resolve(process.cwd(), 'cypress.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('should have E2E test files', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const e2ePath = path.resolve(process.cwd(), 'cypress/e2e');
    expect(fs.existsSync(e2ePath)).toBe(true);
    
    const files = fs.readdirSync(e2ePath);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should have smoke tests', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const smokePath = path.resolve(process.cwd(), 'cypress/e2e/smoke.cy.ts');
    expect(fs.existsSync(smokePath)).toBe(true);
  });

  it('should have measurement workflow tests', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const measurementPath = path.resolve(process.cwd(), 'cypress/e2e/measurement-workflow.cy.ts');
    expect(fs.existsSync(measurementPath)).toBe(true);
  });
});
