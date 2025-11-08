/**
 * Team Collaboration System
 * Real-time chat, project comments, task assignments, activity feeds
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'team_member';
  joinedAt: Date;
  status: 'online' | 'offline' | 'away';
}

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[]; // User IDs mentioned
  attachments: Array<{ url: string; name: string; type: string }>;
  reactions: Map<string, string[]>; // emoji -> user IDs
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  attachments: Array<{ url: string; name: string; type: string }>;
  replies: ProjectComment[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TaskAssignment {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  dueDate: Date;
  tags: string[];
  attachments: Array<{ url: string; name: string; type: string }>;
  comments: ProjectComment[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ActivityFeedItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'comment' | 'task_assigned' | 'task_completed' | 'file_uploaded' | 'member_joined' | 'status_changed';
  title: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface TeamNotification {
  id: string;
  userId: string;
  type: 'mention' | 'task_assigned' | 'comment_reply' | 'task_due_soon' | 'team_update';
  title: string;
  message: string;
  relatedId: string; // Task/Comment/Message ID
  read: boolean;
  createdAt: Date;
}

class TeamCollaborationManager {
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private projectComments: Map<string, ProjectComment[]> = new Map();
  private taskAssignments: Map<string, TaskAssignment[]> = new Map();
  private activityFeeds: Map<string, ActivityFeedItem[]> = new Map();
  private teamMembers: Map<string, TeamMember[]> = new Map();
  private notifications: Map<string, TeamNotification[]> = new Map();

  /**
   * Initialize team collaboration for a project
   */
  public initializeProject(projectId: string, members: TeamMember[]): void {
    this.chatMessages.set(projectId, []);
    this.projectComments.set(projectId, []);
    this.taskAssignments.set(projectId, []);
    this.activityFeeds.set(projectId, []);
    this.teamMembers.set(projectId, members);

    console.log(`[TeamCollaboration] Project initialized: ${projectId}`);
  }

  /**
   * Add chat message
   */
  public addChatMessage(
    projectId: string,
    userId: string,
    userName: string,
    content: string,
    mentions: string[] = [],
    attachments: any[] = []
  ): ChatMessage {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      projectId,
      userId,
      userName,
      content,
      mentions,
      attachments,
      reactions: new Map(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.chatMessages.has(projectId)) {
      this.chatMessages.set(projectId, []);
    }

    this.chatMessages.get(projectId)!.push(message);

    // Create activity feed item
    this.addActivityFeedItem(projectId, userId, userName, 'comment', 'New message', content, {
      messageId: message.id,
    });

    // Create notifications for mentioned users
    mentions.forEach((mentionedUserId) => {
      this.createNotification(mentionedUserId, 'mention', `${userName} mentioned you`, content, message.id);
    });

    console.log(`[TeamCollaboration] Chat message added: ${message.id}`);
    return message;
  }

  /**
   * Add project comment
   */
  public addProjectComment(
    projectId: string,
    userId: string,
    userName: string,
    content: string,
    taskId?: string,
    mentions: string[] = []
  ): ProjectComment {
    const comment: ProjectComment = {
      id: `comment-${Date.now()}`,
      projectId,
      taskId,
      userId,
      userName,
      content,
      mentions,
      attachments: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.projectComments.has(projectId)) {
      this.projectComments.set(projectId, []);
    }

    this.projectComments.get(projectId)!.push(comment);

    // Create activity feed item
    this.addActivityFeedItem(
      projectId,
      userId,
      userName,
      'comment',
      'Added a comment',
      content,
      { commentId: comment.id, taskId }
    );

    // Create notifications for mentioned users
    mentions.forEach((mentionedUserId) => {
      this.createNotification(
        mentionedUserId,
        'comment_reply',
        `${userName} mentioned you in a comment`,
        content,
        comment.id
      );
    });

    console.log(`[TeamCollaboration] Comment added: ${comment.id}`);
    return comment;
  }

  /**
   * Create task assignment
   */
  public createTaskAssignment(
    projectId: string,
    title: string,
    description: string,
    assignedTo: string,
    assignedBy: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    dueDate: Date = new Date(Date.now() + 7 * 86400000)
  ): TaskAssignment {
    const task: TaskAssignment = {
      id: `task-${Date.now()}`,
      projectId,
      title,
      description,
      assignedTo,
      assignedBy,
      priority,
      status: 'todo',
      dueDate,
      tags: [],
      attachments: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.taskAssignments.has(projectId)) {
      this.taskAssignments.set(projectId, []);
    }

    this.taskAssignments.get(projectId)!.push(task);

    // Get assignee name
    const members = this.teamMembers.get(projectId) || [];
    const assigneeName = members.find((m) => m.id === assignedTo)?.name || 'Team Member';
    const assignerName = members.find((m) => m.id === assignedBy)?.name || 'Admin';

    // Create activity feed item
    this.addActivityFeedItem(projectId, assignedBy, assignerName, 'task_assigned', `Assigned task to ${assigneeName}`, title, {
      taskId: task.id,
      assignedTo,
    });

    // Create notification for assigned user
    this.createNotification(
      assignedTo,
      'task_assigned',
      `${assignerName} assigned you a task`,
      title,
      task.id
    );

    console.log(`[TeamCollaboration] Task created: ${task.id}`);
    return task;
  }

  /**
   * Update task status
   */
  public updateTaskStatus(
    projectId: string,
    taskId: string,
    newStatus: 'todo' | 'in_progress' | 'review' | 'completed',
    userId: string,
    userName: string
  ): TaskAssignment | null {
    const tasks = this.taskAssignments.get(projectId) || [];
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return null;

    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date();

    if (newStatus === 'completed') {
      task.completedAt = new Date();
    }

    // Create activity feed item
    this.addActivityFeedItem(
      projectId,
      userId,
      userName,
      'status_changed',
      `Changed task status from ${oldStatus} to ${newStatus}`,
      task.title,
      { taskId, oldStatus, newStatus }
    );

    // Notify task assignee if status changed by someone else
    if (task.assignedTo !== userId) {
      this.createNotification(
        task.assignedTo,
        'task_due_soon',
        `${userName} updated task status`,
        task.title,
        task.id
      );
    }

    console.log(`[TeamCollaboration] Task status updated: ${taskId} -> ${newStatus}`);
    return task;
  }

  /**
   * Add activity feed item
   */
  private addActivityFeedItem(
    projectId: string,
    userId: string,
    userName: string,
    type: 'comment' | 'task_assigned' | 'task_completed' | 'file_uploaded' | 'member_joined' | 'status_changed',
    title: string,
    description: string,
    metadata: Record<string, any>
  ): ActivityFeedItem {
    const item: ActivityFeedItem = {
      id: `activity-${Date.now()}`,
      projectId,
      userId,
      userName,
      type,
      title,
      description,
      metadata,
      createdAt: new Date(),
    };

    if (!this.activityFeeds.has(projectId)) {
      this.activityFeeds.set(projectId, []);
    }

    this.activityFeeds.get(projectId)!.unshift(item);

    // Keep only last 100 items
    const feed = this.activityFeeds.get(projectId)!;
    if (feed.length > 100) {
      feed.pop();
    }

    return item;
  }

  /**
   * Create notification
   */
  private createNotification(
    userId: string,
    type: 'mention' | 'task_assigned' | 'comment_reply' | 'task_due_soon' | 'team_update',
    title: string,
    message: string,
    relatedId: string
  ): TeamNotification {
    const notification: TeamNotification = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      relatedId,
      read: false,
      createdAt: new Date(),
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId)!.push(notification);

    return notification;
  }

  /**
   * Get chat messages for project
   */
  public getChatMessages(projectId: string, limit: number = 50): ChatMessage[] {
    const messages = this.chatMessages.get(projectId) || [];
    return messages.slice(-limit);
  }

  /**
   * Get project comments
   */
  public getProjectComments(projectId: string): ProjectComment[] {
    return this.projectComments.get(projectId) || [];
  }

  /**
   * Get task assignments
   */
  public getTaskAssignments(projectId: string, status?: string): TaskAssignment[] {
    const tasks = this.taskAssignments.get(projectId) || [];
    if (status) {
      return tasks.filter((t) => t.status === status);
    }
    return tasks;
  }

  /**
   * Get activity feed
   */
  public getActivityFeed(projectId: string, limit: number = 50): ActivityFeedItem[] {
    const feed = this.activityFeeds.get(projectId) || [];
    return feed.slice(0, limit);
  }

  /**
   * Get user notifications
   */
  public getUserNotifications(userId: string, unreadOnly: boolean = false): TeamNotification[] {
    const notifications = this.notifications.get(userId) || [];
    if (unreadOnly) {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }

  /**
   * Mark notification as read
   */
  public markNotificationAsRead(userId: string, notificationId: string): void {
    const notifications = this.notifications.get(userId) || [];
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Get team members
   */
  public getTeamMembers(projectId: string): TeamMember[] {
    return this.teamMembers.get(projectId) || [];
  }

  /**
   * Add team member
   */
  public addTeamMember(projectId: string, member: TeamMember): void {
    if (!this.teamMembers.has(projectId)) {
      this.teamMembers.set(projectId, []);
    }

    this.teamMembers.get(projectId)!.push(member);

    // Create activity feed item
    this.addActivityFeedItem(
      projectId,
      member.id,
      member.name,
      'member_joined',
      `${member.name} joined the team`,
      `New team member with role: ${member.role}`,
      { memberId: member.id, role: member.role }
    );
  }

  /**
   * Get unread notification count
   */
  public getUnreadNotificationCount(userId: string): number {
    return (this.notifications.get(userId) || []).filter((n) => !n.read).length;
  }

  /**
   * Get project statistics
   */
  public getProjectStats(projectId: string) {
    const messages = this.chatMessages.get(projectId) || [];
    const comments = this.projectComments.get(projectId) || [];
    const tasks = this.taskAssignments.get(projectId) || [];
    const members = this.teamMembers.get(projectId) || [];

    return {
      totalMessages: messages.length,
      totalComments: comments.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      totalMembers: members.length,
      onlineMembers: members.filter((m) => m.status === 'online').length,
      tasksByPriority: {
        critical: tasks.filter((t) => t.priority === 'critical').length,
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
      },
      tasksByStatus: {
        todo: tasks.filter((t) => t.status === 'todo').length,
        in_progress: tasks.filter((t) => t.status === 'in_progress').length,
        review: tasks.filter((t) => t.status === 'review').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
      },
    };
  }
}

// Export singleton instance
export const teamCollaborationManager = new TeamCollaborationManager();

