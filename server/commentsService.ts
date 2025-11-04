import { nanoid } from "nanoid";

/**
 * Comments and feedback system for Venturr
 * Enables client communication on quotes and projects
 */

export interface Comment {
  id: string;
  resourceType: "quote" | "project" | "measurement";
  resourceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  mentions: string[]; // @username mentions
  parentCommentId?: string; // For threaded comments
  replies: Comment[];
  likes: string[]; // User IDs who liked this comment
  attachments: CommentAttachment[];
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isResolved: boolean;
}

export interface CommentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface CommentNotification {
  id: string;
  userId: string;
  commentId: string;
  type: "mention" | "reply" | "like" | "resolve";
  message: string;
  read: boolean;
  createdAt: Date;
}

/**
 * In-memory comment store
 * In production, use database
 */
class CommentsStore {
  private comments = new Map<string, Comment[]>();
  private notifications = new Map<string, CommentNotification[]>();

  /**
   * Create a new comment
   */
  createComment(
    resourceType: "quote" | "project" | "measurement",
    resourceId: string,
    userId: string,
    userName: string,
    userEmail: string,
    content: string,
    parentCommentId?: string
  ): Comment {
    const commentId = nanoid();
    const mentions = this.extractMentions(content);

    const comment: Comment = {
      id: commentId,
      resourceType,
      resourceId,
      userId,
      userName,
      userEmail,
      content,
      mentions,
      parentCommentId,
      replies: [],
      likes: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      isResolved: false,
    };

    const key = `${resourceType}:${resourceId}`;
    if (!this.comments.has(key)) {
      this.comments.set(key, []);
    }

    this.comments.get(key)!.push(comment);

    // Create notifications for mentions
    mentions.forEach((mention) => {
      this.createNotification(
        mention,
        commentId,
        "mention",
        `${userName} mentioned you in a comment`
      );
    });

    return comment;
  }

  /**
   * Get all comments for a resource
   */
  getComments(
    resourceType: "quote" | "project" | "measurement",
    resourceId: string
  ): Comment[] {
    const key = `${resourceType}:${resourceId}`;
    return this.comments.get(key) || [];
  }

  /**
   * Get a specific comment
   */
  getComment(commentId: string): Comment | null {
    for (const comments of this.comments.values()) {
      const comment = this.findCommentById(comments, commentId);
      if (comment) return comment;
    }
    return null;
  }

  /**
   * Update a comment
   */
  updateComment(
    commentId: string,
    content: string,
    userId: string
  ): Comment | null {
    const comment = this.getComment(commentId);
    if (!comment || comment.userId !== userId) return null;

    comment.content = content;
    comment.updatedAt = new Date();
    comment.isEdited = true;
    comment.mentions = this.extractMentions(content);

    return comment;
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string, userId: string): boolean {
    for (const comments of this.comments.values()) {
      const index = comments.findIndex((c) => c.id === commentId);
      if (index !== -1 && comments[index].userId === userId) {
        comments.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Add a reply to a comment
   */
  addReply(
    parentCommentId: string,
    userId: string,
    userName: string,
    userEmail: string,
    content: string
  ): Comment | null {
    const parentComment = this.getComment(parentCommentId);
    if (!parentComment) return null;

    const replyId = nanoid();
    const mentions = this.extractMentions(content);

    const reply: Comment = {
      id: replyId,
      resourceType: parentComment.resourceType,
      resourceId: parentComment.resourceId,
      userId,
      userName,
      userEmail,
      content,
      mentions,
      parentCommentId,
      replies: [],
      likes: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      isResolved: false,
    };

    parentComment.replies.push(reply);

    // Notify parent comment author
    this.createNotification(
      parentComment.userId,
      replyId,
      "reply",
      `${userName} replied to your comment`
    );

    // Notify mentioned users
    mentions.forEach((mention) => {
      this.createNotification(
        mention,
        replyId,
        "mention",
        `${userName} mentioned you in a reply`
      );
    });

    return reply;
  }

  /**
   * Like a comment
   */
  likeComment(commentId: string, userId: string): boolean {
    const comment = this.getComment(commentId);
    if (!comment) return false;

    if (!comment.likes.includes(userId)) {
      comment.likes.push(userId);

      // Notify comment author
      if (comment.userId !== userId) {
        this.createNotification(
          comment.userId,
          commentId,
          "like",
          "Someone liked your comment"
        );
      }

      return true;
    }

    return false;
  }

  /**
   * Unlike a comment
   */
  unlikeComment(commentId: string, userId: string): boolean {
    const comment = this.getComment(commentId);
    if (!comment) return false;

    const index = comment.likes.indexOf(userId);
    if (index !== -1) {
      comment.likes.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Mark comment as resolved
   */
  resolveComment(commentId: string): boolean {
    const comment = this.getComment(commentId);
    if (!comment) return false;

    comment.isResolved = true;
    return true;
  }

  /**
   * Add attachment to comment
   */
  addAttachment(
    commentId: string,
    fileName: string,
    fileUrl: string,
    fileType: string,
    fileSize: number
  ): CommentAttachment | null {
    const comment = this.getComment(commentId);
    if (!comment) return null;

    const attachment: CommentAttachment = {
      id: nanoid(),
      fileName,
      fileUrl,
      fileType,
      fileSize,
      uploadedAt: new Date(),
    };

    comment.attachments.push(attachment);
    return attachment;
  }

  /**
   * Get notifications for a user
   */
  getNotifications(userId: string): CommentNotification[] {
    return this.notifications.get(userId) || [];
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): boolean {
    for (const notifications of this.notifications.values()) {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Private helper methods
   */

  private createNotification(
    userId: string,
    commentId: string,
    type: "mention" | "reply" | "like" | "resolve",
    message: string
  ): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const notification: CommentNotification = {
      id: nanoid(),
      userId,
      commentId,
      type,
      message,
      read: false,
      createdAt: new Date(),
    };

    this.notifications.get(userId)!.push(notification);
  }

  private findCommentById(comments: Comment[], id: string): Comment | null {
    for (const comment of comments) {
      if (comment.id === id) return comment;

      const foundInReplies = this.findCommentById(comment.replies, id);
      if (foundInReplies) return foundInReplies;
    }
    return null;
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  }
}

// Export singleton instance
export const commentsStore = new CommentsStore();

/**
 * Helper function to format comment for display
 */
export function formatCommentForDisplay(comment: Comment): {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isResolved: boolean;
} {
  return {
    id: comment.id,
    author: comment.userName,
    content: comment.content,
    timestamp: comment.createdAt.toISOString(),
    likes: comment.likes.length,
    replies: comment.replies.length,
    isResolved: comment.isResolved,
  };
}

/**
 * Helper function to format mentions in comment content
 */
export function formatMentionsInContent(content: string): string {
  return content.replace(
    /@(\w+)/g,
    '<span class="mention">@$1</span>'
  );
}

/**
 * Helper function to get comment thread
 */
export function getCommentThread(comment: Comment): Comment[] {
  const thread = [comment];
  comment.replies.forEach((reply) => {
    thread.push(...getCommentThread(reply));
  });
  return thread;
}

