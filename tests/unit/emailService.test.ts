import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the notification module
vi.mock('../../server/_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock fetch for SendGrid API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
    delete process.env.SENDGRID_FROM_NAME;
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('sendEmail', () => {
    it('should fall back to notification when SendGrid is not configured', async () => {
      const { sendEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test body content',
      });

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledWith({
        title: 'Email: Test Subject',
        content: expect.stringContaining('test@example.com'),
      });
    });

    it('should use SendGrid when configured', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.SENDGRID_FROM_EMAIL = 'noreply@test.com';
      process.env.SENDGRID_FROM_NAME = 'Test Sender';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
      });

      // Need to re-import to get fresh module with new env vars
      vi.resetModules();
      const { sendEmail } = await import('../../server/emailService');

      const result = await sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test body content',
      });

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include HTML content when provided', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.SENDGRID_FROM_EMAIL = 'noreply@test.com';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
      });

      vi.resetModules();
      const { sendEmail } = await import('../../server/emailService');

      await sendEmail({
        to: 'recipient@example.com',
        subject: 'HTML Test',
        body: 'Plain text version',
        html: '<p>HTML version</p>',
      });

      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      // Should have both plain text and HTML content
      expect(body.content).toHaveLength(2);
      expect(body.content[0].type).toBe('text/plain');
      expect(body.content[1].type).toBe('text/html');
    });

    it('should fall back to notification on SendGrid failure', async () => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.SENDGRID_FROM_EMAIL = 'noreply@test.com';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      vi.resetModules();
      const { sendEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');

      await sendEmail({
        to: 'recipient@example.com',
        subject: 'Fallback Test',
        body: 'Test content',
      });

      // Should fall back to notification
      expect(notifyOwner).toHaveBeenCalled();
    });
  });

  describe('sendQuoteEmail', () => {
    it('should send quote email with proper formatting', async () => {
      const { sendQuoteEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');

      const result = await sendQuoteEmail(
        'client@example.com',
        'John Smith',
        'Roof Replacement Project',
        'Q-2024-001',
        '15000.00',
        'https://example.com/quote.pdf'
      );

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Q-2024-001'),
          content: expect.stringContaining('John Smith'),
        })
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new users', async () => {
      const { sendWelcomeEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');

      const result = await sendWelcomeEmail('newuser@example.com', 'Jane Doe');

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Welcome'),
          content: expect.stringContaining('Jane Doe'),
        })
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with link', async () => {
      const { sendVerificationEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');

      const verificationLink = 'https://example.com/verify?token=abc123';
      const result = await sendVerificationEmail(
        'user@example.com',
        'Test User',
        verificationLink
      );

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Verify'),
          content: expect.stringContaining(verificationLink),
        })
      );
    });
  });

  describe('sendProjectUpdateEmail', () => {
    it('should send project status update', async () => {
      const { sendProjectUpdateEmail } = await import('../../server/emailService');
      const { notifyOwner } = await import('../../server/_core/notification');

      const result = await sendProjectUpdateEmail(
        'client@example.com',
        'John Smith',
        'Roof Project',
        'In Progress',
        'Work has started on your roof.'
      );

      expect(result).toBe(true);
      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Project Update'),
          content: expect.stringContaining('In Progress'),
        })
      );
    });
  });
});

describe('Email HTML Escaping', () => {
  it('should escape HTML special characters in email body', async () => {
    process.env.SENDGRID_API_KEY = 'test-api-key';
    process.env.SENDGRID_FROM_EMAIL = 'noreply@test.com';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
    });

    vi.resetModules();
    const { sendQuoteEmail } = await import('../../server/emailService');

    await sendQuoteEmail(
      'client@example.com',
      '<script>alert("xss")</script>',
      'Test Project',
      'Q-001',
      '1000.00'
    );

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    
    // HTML content should have escaped the script tag
    const htmlContent = body.content.find((c: any) => c.type === 'text/html');
    if (htmlContent) {
      expect(htmlContent.value).not.toContain('<script>');
      expect(htmlContent.value).toContain('&lt;script&gt;');
    }
  });
});
