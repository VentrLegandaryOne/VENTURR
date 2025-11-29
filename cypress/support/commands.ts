// ***********************************************
// Custom Cypress Commands
// ***********************************************

/**
 * Login via simple auth endpoint (for testing)
 */
Cypress.Commands.add('login', (email?: string, name?: string) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
  const testName = name || Cypress.env('TEST_USER_NAME') || 'Test User';
  
  cy.request({
    method: 'POST',
    url: '/api/auth/simple-signin',
    body: {
      email: testEmail,
      name: testName,
    },
    failOnStatusCode: false,
  }).then((response) => {
    // The auth endpoint should set cookies
    if (response.status !== 200) {
      cy.log('Simple auth failed, continuing without auth');
    }
  });
  
  // Visit home page to ensure cookies are set
  cy.visit('/');
});

/**
 * Create a new test project
 */
Cypress.Commands.add('createProject', (title: string, address?: string) => {
  // First, get or create an organization
  return cy.request({
    method: 'POST',
    url: '/api/trpc/organizations.create',
    body: {
      json: { name: 'Test Organization' },
    },
    headers: {
      'Content-Type': 'application/json',
    },
    failOnStatusCode: false,
  }).then((orgResponse) => {
    // Get organization ID from response or use existing
    const orgId = orgResponse.body?.result?.data?.json?.id || 'test-org';
    
    return cy.request({
      method: 'POST', 
      url: '/api/trpc/projects.create',
      body: {
        json: {
          organizationId: orgId,
          title,
          address: address || '123 Test Street, Sydney NSW 2000',
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
      failOnStatusCode: false,
    }).then((response) => {
      const projectId = response.body?.result?.data?.json?.id;
      return cy.wrap(projectId || 'test-project');
    });
  });
});

/**
 * Navigate to project measurement page
 */
Cypress.Commands.add('goToMeasurement', (projectId: string) => {
  cy.visit(`/projects/${projectId}/measure`);
  cy.waitForMapLoad();
});

/**
 * Wait for map to finish loading
 */
Cypress.Commands.add('waitForMapLoad', () => {
  // Wait for Leaflet map container to be present and have tiles loaded
  cy.get('.leaflet-container', { timeout: 15000 }).should('be.visible');
  cy.get('.leaflet-tile-loaded', { timeout: 15000 }).should('have.length.at.least', 1);
});

// Prevent TypeScript from reading file as legacy script
export {};
