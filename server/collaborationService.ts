import { nanoid } from "nanoid";

/**
 * Real-time collaboration service for Venturr
 * Handles multi-user editing with conflict resolution
 */

export interface CollaborationSession {
  id: string;
  projectId: string;
  resourceType: "measurement" | "quote" | "project";
  resourceId: string;
  users: CollaborationUser[];
  drawings: DrawingObject[];
  cursors: UserCursor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationUser {
  userId: string;
  userName: string;
  email: string;
  color: string;
  joinedAt: Date;
  lastActivity: Date;
}

export interface DrawingObject {
  id: string;
  userId: string;
  type: "line" | "polygon" | "circle" | "rectangle" | "freehand";
  coordinates: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth: number;
  label?: string;
  measurement?: {
    value: number;
    unit: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface UserCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  timestamp: Date;
}

export interface CollaborationEvent {
  type:
    | "user_joined"
    | "user_left"
    | "drawing_created"
    | "drawing_updated"
    | "drawing_deleted"
    | "cursor_moved"
    | "measurement_added"
    | "conflict_resolved";
  sessionId: string;
  userId: string;
  data: unknown;
  timestamp: Date;
  version: number;
}

/**
 * In-memory collaboration session store
 * In production, use Redis or similar
 */
class CollaborationStore {
  private sessions = new Map<string, CollaborationSession>();
  private eventLog: CollaborationEvent[] = [];

  createSession(
    projectId: string,
    resourceType: "measurement" | "quote" | "project",
    resourceId: string
  ): CollaborationSession {
    const sessionId = nanoid();
    const session: CollaborationSession = {
      id: sessionId,
      projectId,
      resourceType,
      resourceId,
      users: [],
      drawings: [],
      cursors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  addUser(
    sessionId: string,
    userId: string,
    userName: string,
    email: string
  ): CollaborationUser | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
    ];
    const color = colors[session.users.length % colors.length];

    const user: CollaborationUser = {
      userId,
      userName,
      email,
      color,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };

    session.users.push(user);
    session.updatedAt = new Date();

    this.logEvent({
      type: "user_joined",
      sessionId,
      userId,
      data: user,
      timestamp: new Date(),
      version: session.users.length,
    });

    return user;
  }

  removeUser(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.users.findIndex((u) => u.userId === userId);
    if (index === -1) return false;

    session.users.splice(index, 1);
    session.updatedAt = new Date();

    this.logEvent({
      type: "user_left",
      sessionId,
      userId,
      data: { userId },
      timestamp: new Date(),
      version: session.users.length,
    });

    // Clean up cursors for this user
    session.cursors = session.cursors.filter((c) => c.userId !== userId);

    return true;
  }

  addDrawing(
    sessionId: string,
    userId: string,
    drawing: Omit<DrawingObject, "id" | "createdAt" | "updatedAt" | "version">
  ): DrawingObject | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const drawingObject: DrawingObject = {
      ...drawing,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    session.drawings.push(drawingObject);
    session.updatedAt = new Date();

    this.logEvent({
      type: "drawing_created",
      sessionId,
      userId,
      data: drawingObject,
      timestamp: new Date(),
      version: session.drawings.length,
    });

    return drawingObject;
  }

  updateDrawing(
    sessionId: string,
    userId: string,
    drawingId: string,
    updates: Partial<DrawingObject>
  ): DrawingObject | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const drawing = session.drawings.find((d) => d.id === drawingId);
    if (!drawing) return null;

    // Conflict resolution: last-write-wins with version tracking
    const updatedDrawing = {
      ...drawing,
      ...updates,
      updatedAt: new Date(),
      version: drawing.version + 1,
    };

    const index = session.drawings.findIndex((d) => d.id === drawingId);
    session.drawings[index] = updatedDrawing;
    session.updatedAt = new Date();

    this.logEvent({
      type: "drawing_updated",
      sessionId,
      userId,
      data: updatedDrawing,
      timestamp: new Date(),
      version: updatedDrawing.version,
    });

    return updatedDrawing;
  }

  deleteDrawing(sessionId: string, userId: string, drawingId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.drawings.findIndex((d) => d.id === drawingId);
    if (index === -1) return false;

    session.drawings.splice(index, 1);
    session.updatedAt = new Date();

    this.logEvent({
      type: "drawing_deleted",
      sessionId,
      userId,
      data: { drawingId },
      timestamp: new Date(),
      version: session.drawings.length,
    });

    return true;
  }

  updateCursor(
    sessionId: string,
    userId: string,
    x: number,
    y: number
  ): UserCursor | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const user = session.users.find((u) => u.userId === userId);
    if (!user) return null;

    const cursorIndex = session.cursors.findIndex((c) => c.userId === userId);
    const cursor: UserCursor = {
      userId,
      userName: user.userName,
      x,
      y,
      color: user.color,
      timestamp: new Date(),
    };

    if (cursorIndex === -1) {
      session.cursors.push(cursor);
    } else {
      session.cursors[cursorIndex] = cursor;
    }

    // Update last activity
    user.lastActivity = new Date();

    this.logEvent({
      type: "cursor_moved",
      sessionId,
      userId,
      data: cursor,
      timestamp: new Date(),
      version: session.cursors.length,
    });

    return cursor;
  }

  getDrawings(sessionId: string): DrawingObject[] {
    const session = this.sessions.get(sessionId);
    return session?.drawings || [];
  }

  getCursors(sessionId: string): UserCursor[] {
    const session = this.sessions.get(sessionId);
    return session?.cursors || [];
  }

  getUsers(sessionId: string): CollaborationUser[] {
    const session = this.sessions.get(sessionId);
    return session?.users || [];
  }

  private logEvent(event: CollaborationEvent): void {
    this.eventLog.push(event);

    // Keep only last 1000 events in memory
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  getEventLog(sessionId: string, since?: Date): CollaborationEvent[] {
    return this.eventLog.filter((e) => {
      if (e.sessionId !== sessionId) return false;
      if (since && e.timestamp < since) return false;
      return true;
    });
  }

  closeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

// Export singleton instance
export const collaborationStore = new CollaborationStore();

/**
 * Conflict resolution strategies
 */
export function resolveConflict(
  local: DrawingObject,
  remote: DrawingObject
): DrawingObject {
  // Last-write-wins strategy
  if (local.updatedAt > remote.updatedAt) {
    return local;
  }

  // If timestamps are equal, use version number
  if (local.version > remote.version) {
    return local;
  }

  // Default to remote
  return remote;
}

/**
 * Generate user color for presence indicator
 */
export function generateUserColor(index: number): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB6BD9",
    "#2EC4B6",
  ];
  return colors[index % colors.length];
}

/**
 * Validate drawing coordinates
 */
export function validateDrawing(drawing: DrawingObject): boolean {
  if (!drawing.coordinates || drawing.coordinates.length === 0) {
    return false;
  }

  // Validate all coordinates are valid numbers
  return drawing.coordinates.every(
    (coord) =>
      typeof coord.x === "number" &&
      typeof coord.y === "number" &&
      isFinite(coord.x) &&
      isFinite(coord.y)
  );
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate area of polygon from coordinates
 */
export function calculatePolygonArea(
  coordinates: Array<{ x: number; y: number }>
): number {
  if (coordinates.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];

    area += current.x * next.y;
    area -= next.x * current.y;
  }

  return Math.abs(area / 2);
}

