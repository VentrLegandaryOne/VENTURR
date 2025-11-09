/**
 * OpenRouter AI Service
 * 
 * Provides access to multiple AI models for Venturr intelligence features
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://venturr.manus.space',
      'X-Title': 'Venturr AI',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Auto-generate quote from project description
 */
export async function generateQuoteFromDescription(params: {
  description: string;
  projectType: string;
  location?: string;
  budget?: number;
}): Promise<{
  materials: Array<{ name: string; quantity: number; unit: string; unitPrice: number }>;
  labor: { hours: number; rate: number; total: number };
  totalCost: number;
  notes: string;
}> {
  const response = await callOpenRouter({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: `You are an expert Australian roofing estimator. Generate detailed, accurate quotes from project descriptions.

Output format (JSON only, no markdown):
{
  "materials": [
    { "name": "Material name", "quantity": 10, "unit": "squares", "unitPrice": 150 }
  ],
  "labor": { "hours": 40, "rate": 75, "total": 3000 },
  "totalCost": 5000,
  "notes": "Additional notes about the project"
}`,
      },
      {
        role: 'user',
        content: `Generate a detailed roofing quote for:

Description: ${params.description}
Project Type: ${params.projectType}
${params.location ? `Location: ${params.location}` : ''}
${params.budget ? `Budget: $${params.budget}` : ''}

Provide realistic material quantities, labor hours, and pricing based on Australian industry standards.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  // Parse JSON from response (remove markdown code blocks if present)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[OpenRouter] Failed to parse quote JSON:', error);
    throw new Error('Failed to generate quote from description');
  }
}

/**
 * Estimate labor time for roofing tasks
 */
export async function estimateLaborTime(params: {
  task: string;
  area: number;
  complexity: 'simple' | 'standard' | 'complex' | 'very_complex';
  crewSize?: number;
}): Promise<{
  hours: number;
  crewSize: number;
  breakdown: string;
  factors: string[];
}> {
  const response = await callOpenRouter({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: `You are an expert Australian roofing project manager. Estimate accurate labor time for roofing tasks.

Output format (JSON only):
{
  "hours": 40,
  "crewSize": 3,
  "breakdown": "Detailed breakdown of time allocation",
  "factors": ["Factor 1", "Factor 2"]
}`,
      },
      {
        role: 'user',
        content: `Estimate labor time for:

Task: ${params.task}
Area: ${params.area} square metres
Complexity: ${params.complexity}
${params.crewSize ? `Crew size: ${params.crewSize}` : ''}

Consider tear-off, installation, cleanup, and complexity factors for Australian conditions.`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[OpenRouter] Failed to parse labor estimate JSON:', error);
    throw new Error('Failed to estimate labor time');
  }
}

/**
 * Analyze project risk
 */
export async function analyzeProjectRisk(params: {
  projectDescription: string;
  location: string;
  timeline: string;
  budget: number;
}): Promise<{
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  risks: Array<{ category: string; description: string; severity: string; mitigation: string }>;
  recommendations: string[];
  successProbability: number;
}> {
  const response = await callOpenRouter({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: `You are an Australian roofing project risk analyst. Identify potential risks and provide mitigation strategies.

Output format (JSON only):
{
  "riskLevel": "medium",
  "risks": [
    {
      "category": "Weather",
      "description": "Risk description",
      "severity": "high",
      "mitigation": "Mitigation strategy"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "successProbability": 85
}`,
      },
      {
        role: 'user',
        content: `Analyze risks for this Australian roofing project:

Description: ${params.projectDescription}
Location: ${params.location}
Timeline: ${params.timeline}
Budget: $${params.budget}

Identify weather, structural, financial, scheduling, and safety risks specific to Australian conditions.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : content;
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('[OpenRouter] Failed to parse risk analysis JSON:', error);
    throw new Error('Failed to analyze project risk');
  }
}

/**
 * General AI chat with context
 */
export async function chat(params: {
  message: string;
  context?: any;
  history?: OpenRouterMessage[];
  model?: string;
}): Promise<{ response: string }> {
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: `You are Venturr AI, an intelligent assistant for Australian roofing professionals.

${params.context ? `Current context:\n${JSON.stringify(params.context, null, 2)}` : ''}

Provide helpful, accurate, and actionable advice specific to Australian roofing industry standards and regulations.`,
    },
    ...(params.history || []),
    {
      role: 'user',
      content: params.message,
    },
  ];

  const response = await callOpenRouter({
    model: params.model || 'anthropic/claude-3.5-sonnet',
    messages,
    temperature: 0.5,
    max_tokens: 2000,
  });

  return {
    response: response.choices[0]?.message?.content || '',
  };
}

export default {
  generateQuoteFromDescription,
  estimateLaborTime,
  analyzeProjectRisk,
  chat,
};

