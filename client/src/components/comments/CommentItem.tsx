import { useState } from 'react';
import { socketService } from '../../services/socket';
import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { commentsApi } from '@/api/comments';
import { useAuthStore } from '@/store/authStore';
import { Comment } from '@/types';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import CommentVoteButton from './CommentVoteButton';
import CommentForm from './CommentForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: Comment;
  ideaId: string;
  onUpdate: () => void;
  level?: number;
}

const CommentItem = ({ comment, ideaId, onUpdate, level = 0 }: CommentItemProps) => {
  // Import socketService
  // Real-time reply handler
  useEffect(() => {
    const handleReplyAdded = (payload: any) => {
      if (payload?.parentCommentId === comment.id) {
        onUpdate();
      }
    };
    socketService.onReplyAdded(handleReplyAdded);
    return () => {
      socketService.offReplyAdded(handleReplyAdded);
    };
  }, [comment.id, onUpdate]);
  const { user, isAuthenticated } = useAuthStore();
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = user?.id === comment.author.id;
  const maxLevel = 3; // Maximum nesting level

  // Fetch replies
  const {
    data: repliesData,
    isLoading: repliesLoading,
  } = useQuery({
    queryKey: ['comment-replies', comment.id],
    queryFn: () => commentsApi.getReplies(comment.id),
    enabled: showReplies && (comment._count?.replies || 0) > 0,
  });

  // Update comment mutation
  const updateMutation = useMutation({
    mutationFn: (content: string) => commentsApi.updateComment(comment.id, content),
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
      toast.success('Comment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      console.log('[Delete] Attempting to delete comment:', comment.id);
      return commentsApi.deleteComment(comment.id);
    },
    onSuccess: (result) => {
      console.log('[Delete] Comment deleted successfully:', result);
      onUpdate();
      toast.success('Comment deleted successfully');
    },
    onError: (error: any) => {
      console.error('[Delete] Failed to delete comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });

  const handleEdit = () => {
    updateMutation.mutate(editContent);
  };

  const handleDelete = () => {
    console.log('[Delete] Delete button clicked for comment:', comment.id);
    console.log('[Delete] Is owner?', isOwner);
    console.log('[Delete] User ID:', user?.id);
    console.log('[Delete] Comment author ID:', comment.author.id);
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      console.log('[Delete] User confirmed deletion');
      deleteMutation.mutate();
    } else {
      console.log('[Delete] User cancelled deletion');
    }
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    setShowReplies(true);
    onUpdate();
  };

  if (comment.isDeleted) {
    return (
      <div className={`${level > 0 ? 'ml-8' : ''} py-4`}>
        <div className="text-neutral-500 dark:text-neutral-400 italic">This comment has been deleted.</div>
      </div>
    );
  }

  return (
    <div className={`${level > 0 ? 'ml-8' : ''} space-y-3`}>
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
              {comment.author.username}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">(edited)</span>
            )}
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input w-full resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  disabled={updateMutation.isPending || !editContent.trim()}
                  className="btn btn-primary btn-sm"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-neutral-700 dark:text-neutral-300 text-sm whitespace-pre-wrap mb-2">
              {comment.content}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4 text-xs">
              {/* Vote */}
              <div className="flex items-center">
                <CommentVoteButton
                  ideaId={ideaId}
                  commentId={comment.id}
                  currentVote={comment.userVote || null}
                  voteScore={comment.voteScore}
                  size="sm"
                  orientation="horizontal"
                />
              </div>

              {/* Reply */}
              {isAuthenticated && level < maxLevel && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center"
                >
                  <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                  Reply
                </button>
              )}

              {/* Show Replies */}
              {(comment._count?.replies || 0) > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center"
                >
                  {showReplies ? (
                    <ChevronUpIcon className="w-3 h-3 mr-1" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3 mr-1" />
                  )}
                  {comment._count?.replies || 0} {(comment._count?.replies || 0) === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <PencilIcon className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className={`text-gray-500 hover:text-red-600 flex items-center ${
                      deleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <TrashIcon className="w-3 h-3 mr-1" />
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                ideaId={ideaId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-4 space-y-3">
              {repliesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                repliesData?.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    ideaId={ideaId}
                    onUpdate={onUpdate}
                    level={level + 1}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
