/**
 * AI-Powered Chatbot Support System
 * Claude API integration for intelligent customer support
 * Context-aware responses, FAQ knowledge base, sentiment analysis
 */

import { EventEmitter } from 'events';
import { invokeLLM } from './llm';

interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  metadata?: Record<string, unknown>;
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'closed' | 'escalated';
  escalationReason?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
}

interface ChatbotAnalytics {
  totalChats: number;
  averageResponseTime: number;
  userSatisfaction: number;
  escalationRate: number;
  topQuestions: string[];
  resolutionRate: number;
}

class ChatbotSystem extends EventEmitter {
  private chatSessions: Map<string, ChatSession> = new Map();
  private faqDatabase: Map<string, FAQItem> = new Map();
  private chatAnalytics: ChatbotAnalytics = {
    totalChats: 0,
    averageResponseTime: 0,
    userSatisfaction: 0,
    escalationRate: 0,
    topQuestions: [],
    resolutionRate: 0,
  };

  private systemPrompt = `You are Venturr, an AI-powered customer support assistant for a professional roofing business management platform. You are helpful, knowledgeable, and professional. 

Your responsibilities:
1. Answer questions about Venturr features (site measurement, takeoff calculator, quote generator, compliance, etc.)
2. Provide step-by-step guidance for using the platform
3. Help with troubleshooting and technical issues
4. Provide industry-specific advice for Australian roofing contractors
5. Escalate complex issues to human support when needed

Always be:
- Professional and courteous
- Clear and concise in explanations
- Proactive in offering help
- Honest about limitations
- Focused on user success`;

  constructor() {
    super();
    this.initializeChatbot();
  }

  /**
   * Initialize chatbot system
   */
  private initializeChatbot(): void {
    this.loadFAQDatabase();
    console.log('[Chatbot] System initialized with FAQ database');
  }

  /**
   * Load FAQ database
   */
  private loadFAQDatabase(): void {
    const faqs: FAQItem[] = [
      {
        id: 'faq-1',
        question: 'How do I measure a roof using the satellite imagery tool?',
        answer: 'Open the Site Measurement tool, enter your project address, and the satellite imagery will load. Use the drawing tools to trace the roof outline, and the system will automatically calculate the area in square meters.',
        category: 'Site Measurement',
        tags: ['measurement', 'satellite', 'drawing'],
        views: 245,
        helpful: 198,
        notHelpful: 12,
      },
      {
        id: 'faq-2',
        question: 'What materials are included in the takeoff calculator?',
        answer: 'The calculator includes 100+ Australian roofing materials from Lysaght, Stramit, and Metroll, including colorbond, zincalume, and specialty products. Materials are updated regularly with current pricing.',
        category: 'Takeoff Calculator',
        tags: ['materials', 'calculator', 'database'],
        views: 189,
        helpful: 156,
        notHelpful: 8,
      },
      {
        id: 'faq-3',
        question: 'How do I generate a professional quote?',
        answer: 'Use the Quote Generator to create professional quotes with your company branding. Add line items, set pricing, and export as PDF. The system includes all compliance documentation and terms.',
        category: 'Quote Generator',
        tags: ['quote', 'pdf', 'branding'],
        views: 312,
        helpful: 287,
        notHelpful: 15,
      },
      {
        id: 'faq-4',
        question: 'What Australian building codes does Venturr comply with?',
        answer: 'Venturr complies with AS 1562.1:2018 (Metal Roofing), AS/NZS 1170.2:2021 (Wind Loads), AS 3959:2018 (Bushfire), and NCC 2022 (National Construction Code).',
        category: 'Compliance',
        tags: ['compliance', 'standards', 'codes'],
        views: 156,
        helpful: 142,
        notHelpful: 5,
      },
      {
        id: 'faq-5',
        question: 'How do I invite team members to collaborate?',
        answer: 'Go to Organization Settings and add team members by email. You can assign roles (Admin, Manager, Team Member) with specific permissions for each role.',
        category: 'Team Management',
        tags: ['team', 'collaboration', 'permissions'],
        views: 198,
        helpful: 167,
        notHelpful: 9,
      },
    ];

    faqs.forEach(faq => {
      this.faqDatabase.set(faq.id, faq);
    });
  }

  /**
   * Create new chat session
   */
  public createChatSession(userId: string, title: string = 'New Chat'): ChatSession {
    const session: ChatSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };

    this.chatSessions.set(session.id, session);
    this.emit('session_created', { sessionId: session.id, userId });
    console.log(`[Chatbot] Chat session created: ${session.id}`);

    return session;
  }

  /**
   * Send message and get response
   */
  public async sendMessage(sessionId: string, userId: string, userMessage: string): Promise<string> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message to session
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      userId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      sentiment: this.analyzeSentiment(userMessage),
    };

    session.messages.push(userMsg);

    try {
      // Check for escalation triggers
      if (this.shouldEscalate(userMessage, userMsg.sentiment)) {
        const escalationResponse = await this.handleEscalation(session, userMessage);
        return escalationResponse;
      }

      // Get response from Claude
      const response = await this.generateResponse(session, userMessage);

      // Add assistant message to session
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        userId,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      session.messages.push(assistantMsg);
      session.updatedAt = new Date();

      // Update analytics
      this.updateAnalytics(session);

      this.emit('message_sent', { sessionId, messageId: assistantMsg.id });
      return response;
    } catch (error) {
      console.error('[Chatbot] Error generating response:', error);
      throw error;
    }
  }

  /**
   * Generate response using Claude API
   */
  private async generateResponse(session: ChatSession, userMessage: string): Promise<string> {
    // Build context from recent messages
    const recentMessages = session.messages.slice(-10);
    const conversationHistory = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    // Check FAQ for relevant answers
    const relevantFAQ = this.findRelevantFAQ(userMessage);
    let contextualPrompt = this.systemPrompt;

    if (relevantFAQ) {
      contextualPrompt += `\n\nRelevant FAQ:\nQ: ${relevantFAQ.question}\nA: ${relevantFAQ.answer}`;
    }

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: contextualPrompt },
          ...conversationHistory,
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (typeof content === 'string') {
        return content;
      }

      return 'I apologize, but I was unable to generate a response. Please try again.';
    } catch (error) {
      console.error('[Chatbot] LLM error:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again or contact support.';
    }
  }

  /**
   * Find relevant FAQ
   */
  private findRelevantFAQ(userMessage: string): FAQItem | undefined {
    const keywords = userMessage.toLowerCase().split(' ');
    let bestMatch: FAQItem | undefined;
    let bestScore = 0;

    for (const faq of this.faqDatabase.values()) {
      let score = 0;
      const faqText = `${faq.question} ${faq.answer} ${faq.tags.join(' ')}`.toLowerCase();

      for (const keyword of keywords) {
        if (faqText.includes(keyword)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    return bestScore > 0 ? bestMatch : undefined;
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'love', 'amazing', 'perfect', 'thanks', 'thank you'];
    const negativeWords = ['hate', 'terrible', 'broken', 'error', 'problem', 'issue', 'frustrated', 'angry'];

    const messageLower = message.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of positiveWords) {
      if (messageLower.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (messageLower.includes(word)) negativeCount++;
    }

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  /**
   * Check if should escalate
   */
  private shouldEscalate(message: string, sentiment?: string): boolean {
    const escalationKeywords = ['urgent', 'emergency', 'critical', 'broken', 'not working', 'error', 'bug', 'crash'];
    const messageLower = message.toLowerCase();

    for (const keyword of escalationKeywords) {
      if (messageLower.includes(keyword)) {
        return true;
      }
    }

    return sentiment === 'negative';
  }

  /**
   * Handle escalation
   */
  private async handleEscalation(session: ChatSession, reason: string): Promise<string> {
    session.status = 'escalated';
    session.escalationReason = reason;

    this.emit('escalation', {
      sessionId: session.id,
      userId: session.userId,
      reason,
    });

    this.chatAnalytics.escalationRate++;

    return `I understand this is important. I'm escalating your request to our support team who will contact you shortly. Your session ID is ${session.id}. Thank you for your patience.`;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(session: ChatSession): void {
    this.chatAnalytics.totalChats++;
    const responseTime = session.messages.length > 0
      ? (session.updatedAt.getTime() - session.createdAt.getTime()) / session.messages.length
      : 0;

    this.chatAnalytics.averageResponseTime = (this.chatAnalytics.averageResponseTime + responseTime) / 2;

    // Calculate resolution rate (simplified)
    const hasEscalation = session.status === 'escalated' ? 0 : 1;
    this.chatAnalytics.resolutionRate = (this.chatAnalytics.resolutionRate + hasEscalation) / 2;
  }

  /**
   * Get chat session
   */
  public getChatSession(sessionId: string): ChatSession | undefined {
    return this.chatSessions.get(sessionId);
  }

  /**
   * Get user chat sessions
   */
  public getUserChatSessions(userId: string): ChatSession[] {
    return Array.from(this.chatSessions.values()).filter(s => s.userId === userId);
  }

  /**
   * Close chat session
   */
  public closeChatSession(sessionId: string): boolean {
    const session = this.chatSessions.get(sessionId);
    if (!session) return false;

    session.status = 'closed';
    session.updatedAt = new Date();

    this.emit('session_closed', { sessionId });
    return true;
  }

  /**
   * Get chatbot analytics
   */
  public getAnalytics(): ChatbotAnalytics {
    return { ...this.chatAnalytics };
  }

  /**
   * Get FAQ database
   */
  public getFAQDatabase(): FAQItem[] {
    return Array.from(this.faqDatabase.values());
  }

  /**
   * Add FAQ item
   */
  public addFAQItem(question: string, answer: string, category: string, tags: string[]): FAQItem {
    const faq: FAQItem = {
      id: `faq-${Date.now()}`,
      question,
      answer,
      category,
      tags,
      views: 0,
      helpful: 0,
      notHelpful: 0,
    };

    this.faqDatabase.set(faq.id, faq);
    this.emit('faq_added', { faqId: faq.id });

    return faq;
  }

  /**
   * Mark FAQ as helpful
   */
  public markFAQHelpful(faqId: string, helpful: boolean): boolean {
    const faq = this.faqDatabase.get(faqId);
    if (!faq) return false;

    if (helpful) {
      faq.helpful++;
    } else {
      faq.notHelpful++;
    }

    faq.views++;
    return true;
  }
}

// Export singleton instance
export const chatbotSystem = new ChatbotSystem();

// Set up event listeners
chatbotSystem.on('session_created', (data) => {
  console.log('[Chatbot] Chat session created:', data.sessionId);
});

chatbotSystem.on('escalation', (data) => {
  console.log('[Chatbot] Escalation triggered:', data.sessionId, data.reason);
});

chatbotSystem.on('session_closed', (data) => {
  console.log('[Chatbot] Chat session closed:', data.sessionId);
});

export { ChatbotSystem, ChatSession, ChatMessage, FAQItem, ChatbotAnalytics };

