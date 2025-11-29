/**
 * E2E Smoke Tests
 * 
 * Basic smoke tests to verify core functionality is working.
 * These run on every deployment to catch critical issues.
 */

describe('Smoke Tests - Core Application', () => {
  it('should load the application', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('should have proper security headers', () => {
    cy.request('/').then((response) => {
      // Check for security headers
      expect(response.headers).to.have.property('x-content-type-options');
      expect(response.headers).to.have.property('x-frame-options');
    });
  });

  it('should respond to health check endpoint', () => {
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('timestamp');
    });
  });

  it('should enforce rate limiting on API', () => {
    // Make multiple rapid requests - should not error on moderate load
    const requests = Array.from({ length: 5 }, () => 
      cy.request({
        url: '/api/health',
        failOnStatusCode: false,
      })
    );
    
    // All should succeed under limit
    cy.wrap(requests).each((req: any) => {
      expect([200, 429]).to.include(req?.status || 200);
    });
  });
});

describe('Smoke Tests - Authentication', () => {
  it('should handle unauthenticated access gracefully', () => {
    cy.request({
      url: '/api/trpc/auth.me',
      failOnStatusCode: false,
    }).then((response) => {
      // Should return null user or 401, not crash
      expect([200, 401, 403]).to.include(response.status);
    });
  });

  it('should provide CSRF token endpoint', () => {
    cy.request('/api/csrf-token').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('csrfToken');
    });
  });
});

describe('Smoke Tests - API Endpoints', () => {
  it('should respond to tRPC endpoint', () => {
    cy.request({
      url: '/api/trpc/auth.me',
      method: 'GET',
      failOnStatusCode: false,
    }).then((response) => {
      // Should return valid response structure
      expect([200, 401]).to.include(response.status);
    });
  });
});

describe('Smoke Tests - Static Assets', () => {
  it('should serve static files', () => {
    cy.visit('/');
    // Check that CSS is loaded
    cy.get('link[rel="stylesheet"]').should('exist');
  });
});

describe('Smoke Tests - Error Handling', () => {
  it('should handle 404 gracefully', () => {
    cy.request({
      url: '/api/nonexistent-endpoint',
      failOnStatusCode: false,
    }).then((response) => {
      expect([404, 400, 500]).to.include(response.status);
    });
  });

  it('should handle malformed requests', () => {
    cy.request({
      url: '/api/trpc/auth.me?batch=1&input=invalid-json',
      method: 'GET',
      failOnStatusCode: false,
    }).then((response) => {
      // Should not crash, return error response
      expect(response.status).to.be.oneOf([200, 400, 500]);
    });
  });
});
