import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("quotes.upload", () => {
  it("creates a quote record with S3 file upload", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small test file (1KB)
    const testFileContent = "Test quote content";
    const fileData = Buffer.from(testFileContent).toString('base64');

    const result = await caller.quotes.upload({
      fileName: "test-quote.pdf",
      fileType: "application/pdf",
      fileSize: testFileContent.length,
      fileData,
    });

    // Verify quote was created
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.userId).toBe(ctx.user.id);
    expect(result.fileName).toBe("test-quote.pdf");
    expect(result.fileType).toBe("application/pdf");
    expect(result.status).toBe("uploaded");
    expect(result.progressPercentage).toBe(0);
    
    // Verify S3 file key and URL are set
    expect(result.fileKey).toContain(`quotes/${ctx.user.id}/`);
    expect(result.fileKey).toContain("test-quote.pdf");
    expect(result.fileUrl).toBeTruthy();
  });

  it("prevents unauthorized access to other users' quotes", { timeout: 30000 }, async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 uploads a quote
    const testFileContent = "Test quote content";
    const fileData = Buffer.from(testFileContent).toString('base64');

    const quote = await caller1.quotes.upload({
      fileName: "test-quote.pdf",
      fileType: "application/pdf",
      fileSize: testFileContent.length,
      fileData,
    });

    // User 2 tries to access user 1's quote
    await expect(
      caller2.quotes.getById({ quoteId: quote.id })
    ).rejects.toThrow("Quote not found or access denied");
  });

  it("allows user to list their own quotes", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Upload two quotes
    const testFileContent = "Test quote content";
    const fileData = Buffer.from(testFileContent).toString('base64');

    await caller.quotes.upload({
      fileName: "quote1.pdf",
      fileType: "application/pdf",
      fileSize: testFileContent.length,
      fileData,
    });

    await caller.quotes.upload({
      fileName: "quote2.pdf",
      fileType: "application/pdf",
      fileSize: testFileContent.length,
      fileData,
    });

    // List quotes
    const quotes = await caller.quotes.list();

    expect(quotes.length).toBeGreaterThanOrEqual(2);
    expect(quotes.every(q => q.userId === ctx.user.id)).toBe(true);
  });

  it("allows user to update their own quote status", { timeout: 30000 }, async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Upload a quote
    const testFileContent = "Test quote content";
    const fileData = Buffer.from(testFileContent).toString('base64');

    const quote = await caller.quotes.upload({
      fileName: "test-quote.pdf",
      fileType: "application/pdf",
      fileSize: testFileContent.length,
      fileData,
    });

    // Update status to processing
    await caller.quotes.updateStatus({
      quoteId: quote.id,
      status: "processing",
      progressPercentage: 50,
    });

    // Verify status was updated
    const updatedQuote = await caller.quotes.getById({ quoteId: quote.id });
    expect(updatedQuote.status).toBe("processing");
    expect(updatedQuote.progressPercentage).toBeGreaterThanOrEqual(25);
    expect(updatedQuote.progressPercentage).toBeLessThanOrEqual(50);
  });
});
