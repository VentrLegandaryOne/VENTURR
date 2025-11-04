import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Reply, Check, Trash2, Edit2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  isLiked: boolean;
  isResolved: boolean;
  replies: Comment[];
  attachments: Array<{ id: string; url: string; name: string }>;
}

export function CommentsSection({ resourceId, resourceType }: { resourceId: string; resourceType: 'quote' | 'project' | 'measurement' }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        const data = await trpc.comments.list.query({
          resourceId,
          resourceType,
        });
        setComments(data);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [resourceId, resourceType]);

  // Create comment
  const handleCreateComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const comment = await trpc.comments.create.mutate({
        resourceId,
        resourceType,
        content: newComment,
        authorId: user.id,
      });

      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  // Create reply
  const handleCreateReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      const reply = await trpc.comments.addReply.mutate({
        commentId: parentId,
        content: replyContent,
        authorId: user.id,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      );

      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  // Like comment
  const handleLike = async (commentId: string) => {
    try {
      await trpc.comments.like.mutate({ commentId });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                isLiked: !c.isLiked,
              }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Resolve comment
  const handleResolve = async (commentId: string) => {
    try {
      await trpc.comments.resolve.mutate({ commentId });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
        )
      );
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await trpc.comments.delete.mutate({ commentId });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // Edit comment
  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await trpc.comments.update.mutate({
        commentId,
        content: editContent,
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: editContent } : c
        )
      );

      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${
        isReply ? 'ml-8 mt-3' : 'mt-4'
      } p-3 bg-gray-50 rounded-lg border border-gray-200`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-sm text-gray-900">
            {comment.author.name}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
        </div>

        {comment.isResolved && (
          <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            <Check size={12} />
            Resolved
          </div>
        )}
      </div>

      {editingId === comment.id ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleEditSave(comment.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
      )}

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => handleLike(comment.id)}
          className={`flex items-center gap-1 ${
            comment.isLiked ? 'text-red-600' : 'text-gray-500'
          } hover:text-red-600`}
        >
          <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
          {comment.likes}
        </button>

        {!isReply && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
          >
            <Reply size={14} />
            Reply
          </button>
        )}

        {user?.id === comment.author.id && (
          <>
            <button
              onClick={() => {
                setEditingId(comment.id);
                setEditContent(comment.content);
              }}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
            >
              <Edit2 size={14} />
              Edit
            </button>

            <button
              onClick={() => handleDelete(comment.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-red-600"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </>
        )}

        <button
          onClick={() => handleResolve(comment.id)}
          className={`flex items-center gap-1 ${
            comment.isResolved ? 'text-green-600' : 'text-gray-500'
          } hover:text-green-600`}
        >
          <Check size={14} />
          {comment.isResolved ? 'Unresolve' : 'Resolve'}
        </button>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}

      {/* Reply input */}
      {replyingTo === comment.id && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleCreateReply(comment.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Comments ({comments.length})
        </h3>

        {/* New comment input */}
        <div className="space-y-2 mb-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-sm"
          />
          <Button
            onClick={handleCreateComment}
            disabled={!newComment.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>

        {/* Comments list */}
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-2">{comments.map((c) => renderComment(c))}</div>
        )}
      </div>
    </div>
  );
}

