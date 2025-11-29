// ***********************************************
// E2E Support File
// ***********************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.setAttribute('data-hide-command-log-request', '');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  app.document.head.appendChild(style);
}

// Prevent TypeScript from reading file as legacy script
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in via simple auth for testing
       */
      login(email?: string, name?: string): Chainable<void>;
      
      /**
       * Custom command to create a test project
       */
      createProject(title: string, address?: string): Chainable<string>;
      
      /**
       * Custom command to navigate to a project's measurement page
       */
      goToMeasurement(projectId: string): Chainable<void>;
      
      /**
       * Custom command to wait for map to load
       */
      waitForMapLoad(): Chainable<void>;
    }
  }
}
