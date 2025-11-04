import { getDb } from './db';

export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'comment' | 'client';
  title: string;
  description?: string;
  url: string;
  createdAt: Date;
  relevance: number;
}

export async function searchAll(
  query: string,
  userId: string,
  limit: number = 20
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db || !query.trim()) return [];

  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];

    // Search projects
    const projects = await db.query.projects.findMany({
      where: (projects, { ilike, eq }) =>
        and(
          eq(projects.userId, userId),
          or(
            ilike(projects.title, searchTerm),
            ilike(projects.address, searchTerm)
          )
        ),
      limit: Math.ceil(limit / 3),
    });

    results.push(
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        description: p.address,
        url: `/projects/${p.id}`,
        createdAt: p.createdAt,
        relevance: calculateRelevance(p.title, query),
      }))
    );

    // Search clients
    const clients = await db.query.clients.findMany({
      where: (clients, { ilike, eq }) =>
        and(
          eq(clients.userId, userId),
          or(
            ilike(clients.name, searchTerm),
            ilike(clients.email, searchTerm)
          )
        ),
      limit: Math.ceil(limit / 3),
    });

    results.push(
      ...clients.map((c) => ({
        id: c.id,
        type: 'client' as const,
        title: c.name,
        description: c.email,
        url: `/clients/${c.id}`,
        createdAt: c.createdAt,
        relevance: calculateRelevance(c.name, query),
      }))
    );

    // Search comments
    const comments = await db.query.comments.findMany({
      where: (comments, { ilike }) =>
        ilike(comments.content, searchTerm),
      limit: Math.ceil(limit / 3),
    });

    results.push(
      ...comments.map((c) => ({
        id: c.id,
        type: 'comment' as const,
        title: `Comment by ${c.authorName}`,
        description: c.content.substring(0, 100),
        url: `/comments/${c.id}`,
        createdAt: c.createdAt,
        relevance: calculateRelevance(c.content, query),
      }))
    );

    // Sort by relevance and limit results
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  } catch (error) {
    console.error('[Search] Failed:', error);
    return [];
  }
}

export async function searchProjects(
  query: string,
  userId: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db || !query.trim()) return [];

  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    const projects = await db.query.projects.findMany({
      where: (projects, { ilike, eq }) =>
        and(
          eq(projects.userId, userId),
          or(
            ilike(projects.title, searchTerm),
            ilike(projects.address, searchTerm),
            ilike(projects.clientName, searchTerm)
          )
        ),
      limit,
    });

    return projects.map((p) => ({
      id: p.id,
      type: 'project' as const,
      title: p.title,
      description: p.address,
      url: `/projects/${p.id}`,
      createdAt: p.createdAt,
      relevance: calculateRelevance(p.title, query),
    }));
  } catch (error) {
    console.error('[Search] Failed to search projects:', error);
    return [];
  }
}

export async function searchComments(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const db = await getDb();
  if (!db || !query.trim()) return [];

  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    const comments = await db.query.comments.findMany({
      where: (comments, { ilike }) =>
        ilike(comments.content, searchTerm),
      limit,
    });

    return comments.map((c) => ({
      id: c.id,
      type: 'comment' as const,
      title: `Comment by ${c.authorName}`,
      description: c.content.substring(0, 100),
      url: `/comments/${c.id}`,
      createdAt: c.createdAt,
      relevance: calculateRelevance(c.content, query),
    }));
  } catch (error) {
    console.error('[Search] Failed to search comments:', error);
    return [];
  }
}

function calculateRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Contains query
  if (lowerText.includes(lowerQuery)) return 60;

  // Word match
  const words = lowerText.split(/\s+/);
  if (words.some((w) => w.startsWith(lowerQuery))) return 40;

  return 20;
}
