/**
 * Real-Time Collaboration System
 * WebSocket-based multi-user project editing with live synchronization
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';

// Types for real-time collaboration
export interface UserPresence {
  userId: string;
  userName: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: Date;
}

export interface ProjectChange {
  id: string;
  projectId: string;
  userId: string;
  type: 'create' | 'update' | 'delete';
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  version: number;
}

export interface ConflictResolution {
  changeId: string;
  conflictType: 'concurrent_edit' | 'delete_conflict' | 'version_mismatch';
  resolution: 'keep_local' | 'keep_remote' | 'merge' | 'manual';
  mergedValue?: any;
  timestamp: Date;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

// Validation schemas
const UserPresenceSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  color: z.string(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  selection: z.object({ start: z.number(), end: z.number() }).optional(),
  lastActive: z.date()
});

const ProjectChangeSchema = z.object({
  projectId: z.string(),
  type: z.enum(['create', 'update', 'delete']),
  field: z.string(),
  oldValue: z.any().optional(),
  newValue: z.any().optional()
});

// Real-Time Collaboration Manager
export class RealTimeCollaborationManager {
  private io: SocketIOServer;
  private userPresence: Map<string, Map<string, UserPresence>> = new Map(); // projectId -> userId -> presence
  private projectChanges: Map<string, ProjectChange[]> = new Map(); // projectId -> changes
  private conflictLog: Map<string, ConflictResolution[]> = new Map(); // projectId -> conflicts
  private activityLog: Map<string, ActivityLog[]> = new Map(); // projectId -> activities
  private changeVersions: Map<string, number> = new Map(); // projectId -> version

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.VITE_FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);

      // User joins project
      socket.on('join-project', (data: { projectId: string; userId: string; userName: string }) => {
        this.handleJoinProject(socket, data);
      });

      // User leaves project
      socket.on('leave-project', (data: { projectId: string; userId: string }) => {
        this.handleLeaveProject(socket, data);
      });

      // Project change
      socket.on('project-change', (data: any) => {
        this.handleProjectChange(socket, data);
      });

      // Cursor movement
      socket.on('cursor-move', (data: { projectId: string; userId: string; x: number; y: number }) => {
        this.handleCursorMove(socket, data);
      });

      // Text selection
      socket.on('selection-change', (data: { projectId: string; userId: string; start: number; end: number }) => {
        this.handleSelectionChange(socket, data);
      });

      // Request presence
      socket.on('request-presence', (data: { projectId: string }) => {
        this.handleRequestPresence(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[WebSocket] User disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle user joining project
   */
  private handleJoinProject(socket: Socket, data: { projectId: string; userId: string; userName: string }): void {
    const { projectId, userId, userName } = data;

    // Join room
    socket.join(`project-${projectId}`);

    // Generate user color
    const color = this.generateUserColor();

    // Create presence
    const presence: UserPresence = {
      userId,
      userName,
      color,
      lastActive: new Date()
    };

    // Store presence
    if (!this.userPresence.has(projectId)) {
      this.userPresence.set(projectId, new Map());
    }
    this.userPresence.get(projectId)!.set(userId, presence);

    // Initialize version if needed
    if (!this.changeVersions.has(projectId)) {
      this.changeVersions.set(projectId, 0);
    }

    // Broadcast presence
    this.io.to(`project-${projectId}`).emit('user-joined', {
      userId,
      userName,
      color,
      timestamp: new Date()
    });

    // Send current presence to joining user
    const currentPresence = Array.from(this.userPresence.get(projectId)!.values());
    socket.emit('presence-update', { users: currentPresence });

    // Log activity
    this.logActivity(projectId, userId, 'joined_project', { projectId });
  }

  /**
   * Handle user leaving project
   */
  private handleLeaveProject(socket: Socket, data: { projectId: string; userId: string }): void {
    const { projectId, userId } = data;

    // Remove presence
    this.userPresence.get(projectId)?.delete(userId);

    // Leave room
    socket.leave(`project-${projectId}`);

    // Broadcast departure
    this.io.to(`project-${projectId}`).emit('user-left', {
      userId,
      timestamp: new Date()
    });

    // Log activity
    this.logActivity(projectId, userId, 'left_project', { projectId });
  }

  /**
   * Handle project change
   */
  private handleProjectChange(socket: Socket, data: any): void {
    try {
      const validated = ProjectChangeSchema.parse(data);
      const { projectId, type, field, oldValue, newValue } = validated;
      const userId = data.userId;

      // Get current version
      const version = (this.changeVersions.get(projectId) || 0) + 1;
      this.changeVersions.set(projectId, version);

      // Create change record
      const change: ProjectChange = {
        id: `change-${Date.now()}-${Math.random()}`,
        projectId,
        userId,
        type,
        field,
        oldValue,
        newValue,
        timestamp: new Date(),
        version
      };

      // Store change
      if (!this.projectChanges.has(projectId)) {
        this.projectChanges.set(projectId, []);
      }
      this.projectChanges.get(projectId)!.push(change);

      // Broadcast change to all users in project
      this.io.to(`project-${projectId}`).emit('project-change', {
        ...change,
        userId,
        timestamp: new Date()
      });

      // Log activity
      this.logActivity(projectId, userId, 'modified_project', {
        type,
        field,
        oldValue,
        newValue
      });
    } catch (error) {
      console.error('[WebSocket] Invalid project change:', error);
      socket.emit('error', { message: 'Invalid project change format' });
    }
  }

  /**
   * Handle cursor movement
   */
  private handleCursorMove(socket: Socket, data: { projectId: string; userId: string; x: number; y: number }): void {
    const { projectId, userId, x, y } = data;

    // Update presence
    const presence = this.userPresence.get(projectId)?.get(userId);
    if (presence) {
      presence.cursor = { x, y };
      presence.lastActive = new Date();
    }

    // Broadcast cursor to other users
    socket.to(`project-${projectId}`).emit('cursor-move', {
      userId,
      x,
      y,
      timestamp: new Date()
    });
  }

  /**
   * Handle selection change
   */
  private handleSelectionChange(socket: Socket, data: { projectId: string; userId: string; start: number; end: number }): void {
    const { projectId, userId, start, end } = data;

    // Update presence
    const presence = this.userPresence.get(projectId)?.get(userId);
    if (presence) {
      presence.selection = { start, end };
      presence.lastActive = new Date();
    }

    // Broadcast selection to other users
    socket.to(`project-${projectId}`).emit('selection-change', {
      userId,
      start,
      end,
      timestamp: new Date()
    });
  }

  /**
   * Handle presence request
   */
  private handleRequestPresence(socket: Socket, data: { projectId: string }): void {
    const { projectId } = data;
    const presence = Array.from(this.userPresence.get(projectId)?.values() || []);
    socket.emit('presence-update', { users: presence });
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    // Find and remove user from all projects
    this.userPresence.forEach((users, projectId) => {
      users.forEach((presence, userId) => {
        this.io.to(`project-${projectId}`).emit('user-left', {
          userId,
          timestamp: new Date()
        });
      });
    });
  }

  /**
   * Resolve conflicts between concurrent edits
   */
  resolveConflict(projectId: string, change1: ProjectChange, change2: ProjectChange): ConflictResolution {
    const resolution: ConflictResolution = {
      changeId: change1.id,
      conflictType: 'concurrent_edit',
      resolution: 'merge',
      timestamp: new Date()
    };

    // Implement conflict resolution strategies
    if (change1.field === change2.field) {
      // Same field edited by different users
      if (change1.type === 'update' && change2.type === 'update') {
        // Last write wins
        resolution.resolution = change1.timestamp > change2.timestamp ? 'keep_local' : 'keep_remote';
      } else if (change1.type === 'delete' || change2.type === 'delete') {
        // Delete wins
        resolution.resolution = 'keep_local';
      }
    }

    // Log conflict
    if (!this.conflictLog.has(projectId)) {
      this.conflictLog.set(projectId, []);
    }
    this.conflictLog.get(projectId)!.push(resolution);

    return resolution;
  }

  /**
   * Get change history
   */
  getChangeHistory(projectId: string, since?: Date): ProjectChange[] {
    const changes = this.projectChanges.get(projectId) || [];
    if (since) {
      return changes.filter(c => c.timestamp > since);
    }
    return changes;
  }

  /**
   * Get activity log
   */
  getActivityLog(projectId: string, limit: number = 50): ActivityLog[] {
    const activities = this.activityLog.get(projectId) || [];
    return activities.slice(-limit);
  }

  /**
   * Log activity
   */
  private logActivity(projectId: string, userId: string, action: string, details: Record<string, any>): void {
    const activity: ActivityLog = {
      id: `activity-${Date.now()}-${Math.random()}`,
      projectId,
      userId,
      action,
      details,
      timestamp: new Date()
    };

    if (!this.activityLog.has(projectId)) {
      this.activityLog.set(projectId, []);
    }
    this.activityLog.get(projectId)!.push(activity);

    // Keep only last 1000 activities
    const activities = this.activityLog.get(projectId)!;
    if (activities.length > 1000) {
      activities.splice(0, activities.length - 1000);
    }
  }

  /**
   * Generate user color
   */
  private generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C41A'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton instance
let collaborationManager: RealTimeCollaborationManager | null = null;

export function initializeCollaboration(httpServer: HTTPServer): RealTimeCollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new RealTimeCollaborationManager(httpServer);
  }
  return collaborationManager;
}

export function getCollaborationManager(): RealTimeCollaborationManager | null {
  return collaborationManager;
}

