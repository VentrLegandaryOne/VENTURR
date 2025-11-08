/**
 * API Documentation & Developer Portal
 * API docs, SDK examples, developer portal, rate limiting
 */

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: string;
  authentication: 'required' | 'optional' | 'none';
  rateLimit: number; // requests per minute
  parameters: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example: string;
}

export interface APIRequestBody {
  type: string;
  properties: Record<string, { type: string; description: string }>;
  required: string[];
}

export interface APIResponse {
  status: number;
  description: string;
  schema: Record<string, unknown>;
}

export interface APIExample {
  language: 'curl' | 'javascript' | 'python' | 'go' | 'ruby';
  code: string;
  description: string;
}

export interface DeveloperAccount {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  apiSecret: string;
  organization: string;
  createdAt: Date;
  isActive: boolean;
  rateLimitTier: 'free' | 'pro' | 'enterprise';
  requestsThisMonth: number;
  requestsLimit: number;
}

export interface APIKey {
  id: string;
  developerId: string;
  key: string;
  secret: string;
  name: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

class APIDocumentationManager {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private developers: Map<string, DeveloperAccount> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private requestCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeEndpoints();
  }

  /**
   * Initialize API endpoints documentation
   */
  private initializeEndpoints(): void {
    // Projects Endpoints
    this.endpoints.set('list-projects', {
      id: 'list-projects',
      path: '/api/v1/projects',
      method: 'GET',
      description: 'List all projects for the authenticated user',
      category: 'Projects',
      authentication: 'required',
      rateLimit: 100,
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number (default: 1)',
          example: '1',
        },
        {
          name: 'limit',
          type: 'integer',
          required: false,
          description: 'Items per page (default: 20)',
          example: '20',
        },
        {
          name: 'status',
          type: 'string',
          required: false,
          description: 'Filter by status (draft, quoted, approved, in_progress, completed)',
          example: 'in_progress',
        },
      ],
      responses: [
        {
          status: 200,
          description: 'List of projects',
          schema: {
            projects: [
              {
                id: 'proj-123',
                name: 'Smith Residence',
                status: 'in_progress',
                progress: 65,
              },
            ],
            total: 10,
            page: 1,
          },
        },
        {
          status: 401,
          description: 'Unauthorized',
          schema: { error: 'Invalid API key' },
        },
      ],
      examples: [
        {
          language: 'curl',
          description: 'List projects with curl',
          code: `curl -X GET https://api.venturr.io/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
        },
        {
          language: 'javascript',
          description: 'List projects with JavaScript',
          code: `const response = await fetch('https://api.venturr.io/v1/projects', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();`,
        },
        {
          language: 'python',
          description: 'List projects with Python',
          code: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.venturr.io/v1/projects', headers=headers)
data = response.json()`,
        },
      ],
    });

    // Create Quote Endpoint
    this.endpoints.set('create-quote', {
      id: 'create-quote',
      path: '/api/v1/quotes',
      method: 'POST',
      description: 'Create a new quote for a project',
      category: 'Quotes',
      authentication: 'required',
      rateLimit: 50,
      parameters: [],
      requestBody: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          amount: { type: 'number', description: 'Quote amount in USD' },
          description: { type: 'string', description: 'Quote description' },
          validUntil: { type: 'string', description: 'Quote validity date (ISO 8601)' },
        },
        required: ['projectId', 'amount'],
      },
      responses: [
        {
          status: 201,
          description: 'Quote created successfully',
          schema: {
            id: 'quote-456',
            projectId: 'proj-123',
            amount: 15000,
            status: 'draft',
            createdAt: '2025-11-08T10:00:00Z',
          },
        },
      ],
      examples: [
        {
          language: 'javascript',
          description: 'Create quote with JavaScript',
          code: `const response = await fetch('https://api.venturr.io/v1/quotes', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    projectId: 'proj-123',
    amount: 15000,
    description: 'Roof replacement',
    validUntil: '2025-12-08'
  })
});
const quote = await response.json();`,
        },
      ],
    });

    // Record Payment Endpoint
    this.endpoints.set('record-payment', {
      id: 'record-payment',
      path: '/api/v1/payments',
      method: 'POST',
      description: 'Record a payment for a project',
      category: 'Payments',
      authentication: 'required',
      rateLimit: 50,
      parameters: [],
      requestBody: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          amount: { type: 'number', description: 'Payment amount in USD' },
          method: { type: 'string', description: 'Payment method (credit_card, bank_transfer, check)' },
          reference: { type: 'string', description: 'Payment reference number' },
        },
        required: ['projectId', 'amount', 'method'],
      },
      responses: [
        {
          status: 201,
          description: 'Payment recorded successfully',
          schema: {
            id: 'payment-789',
            projectId: 'proj-123',
            amount: 7500,
            status: 'confirmed',
            recordedAt: '2025-11-08T10:00:00Z',
          },
        },
      ],
      examples: [
        {
          language: 'curl',
          description: 'Record payment with curl',
          code: `curl -X POST https://api.venturr.io/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "proj-123",
    "amount": 7500,
    "method": "credit_card",
    "reference": "TXN-2025-001"
  }'`,
        },
      ],
    });

    // Update Project Status Endpoint
    this.endpoints.set('update-project-status', {
      id: 'update-project-status',
      path: '/api/v1/projects/:id/status',
      method: 'PATCH',
      description: 'Update project status',
      category: 'Projects',
      authentication: 'required',
      rateLimit: 100,
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Project ID',
          example: 'proj-123',
        },
      ],
      requestBody: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'New status (draft, quoted, approved, in_progress, completed)' },
          progress: { type: 'number', description: 'Progress percentage (0-100)' },
        },
        required: ['status'],
      },
      responses: [
        {
          status: 200,
          description: 'Project status updated',
          schema: {
            id: 'proj-123',
            status: 'in_progress',
            progress: 65,
          },
        },
      ],
      examples: [
        {
          language: 'javascript',
          description: 'Update project status',
          code: `const projectId = 'proj-123';
const response = await fetch(\`https://api.venturr.io/v1/projects/\${projectId}/status\`, {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'in_progress',
    progress: 65
  })
});
const updated = await response.json();`,
        },
      ],
    });
  }

  /**
   * Register developer account
   */
  public registerDeveloper(
    name: string,
    email: string,
    organization: string
  ): DeveloperAccount {
    const developerId = `dev-${Date.now()}`;
    const apiKey = this.generateAPIKey();
    const apiSecret = this.generateAPISecret();

    const account: DeveloperAccount = {
      id: developerId,
      name,
      email,
      apiKey,
      apiSecret,
      organization,
      createdAt: new Date(),
      isActive: true,
      rateLimitTier: 'free',
      requestsThisMonth: 0,
      requestsLimit: 10000,
    };

    this.developers.set(developerId, account);

    console.log(`[API] Developer registered: ${email}`);
    return account;
  }

  /**
   * Create API key
   */
  public createAPIKey(developerId: string, name: string): APIKey | null {
    const developer = this.developers.get(developerId);
    if (!developer) return null;

    const keyId = `key-${Date.now()}`;
    const key = this.generateAPIKey();
    const secret = this.generateAPISecret();

    const apiKey: APIKey = {
      id: keyId,
      developerId,
      key,
      secret,
      name,
      createdAt: new Date(),
      isActive: true,
    };

    this.apiKeys.set(keyId, apiKey);

    console.log(`[API] API key created: ${keyId}`);
    return apiKey;
  }

  /**
   * Validate API key
   */
  public validateAPIKey(key: string): DeveloperAccount | null {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.key === key && apiKey.isActive) {
        const developer = this.developers.get(apiKey.developerId);
        if (developer && developer.isActive) {
          apiKey.lastUsed = new Date();
          return developer;
        }
      }
    }
    return null;
  }

  /**
   * Check rate limit
   */
  public checkRateLimit(developerId: string): RateLimitInfo {
    const developer = this.developers.get(developerId);
    if (!developer) {
      return {
        limit: 0,
        remaining: 0,
        reset: new Date(),
      };
    }

    const remaining = Math.max(0, developer.requestsLimit - developer.requestsThisMonth);

    return {
      limit: developer.requestsLimit,
      remaining,
      reset: new Date(Date.now() + 30 * 86400000), // 30 days
    };
  }

  /**
   * Record API request
   */
  public recordRequest(developerId: string): void {
    const developer = this.developers.get(developerId);
    if (developer) {
      developer.requestsThisMonth++;
    }
  }

  /**
   * Get API endpoint documentation
   */
  public getEndpoint(endpointId: string): APIEndpoint | undefined {
    return this.endpoints.get(endpointId);
  }

  /**
   * Get all endpoints
   */
  public getAllEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Get endpoints by category
   */
  public getEndpointsByCategory(category: string): APIEndpoint[] {
    return Array.from(this.endpoints.values()).filter((e) => e.category === category);
  }

  /**
   * Get API statistics
   */
  public getAPIStatistics() {
    const totalDevelopers = this.developers.size;
    const activeDevelopers = Array.from(this.developers.values()).filter((d) => d.isActive).length;
    const totalAPIKeys = this.apiKeys.size;
    const activeAPIKeys = Array.from(this.apiKeys.values()).filter((k) => k.isActive).length;
    const totalEndpoints = this.endpoints.size;

    const requestsByTier: Record<string, number> = {
      free: 0,
      pro: 0,
      enterprise: 0,
    };

    for (const dev of this.developers.values()) {
      requestsByTier[dev.rateLimitTier] += dev.requestsThisMonth;
    }

    return {
      totalDevelopers,
      activeDevelopers,
      totalAPIKeys,
      activeAPIKeys,
      totalEndpoints,
      requestsByTier,
      totalRequests: Array.from(this.developers.values()).reduce((sum, d) => sum + d.requestsThisMonth, 0),
    };
  }

  /**
   * Generate API key
   */
  private generateAPIKey(): string {
    return `pk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
  }

  /**
   * Generate API secret
   */
  private generateAPISecret(): string {
    return `sk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;
  }
}

// Export singleton instance
export const apiDocumentationManager = new APIDocumentationManager();

