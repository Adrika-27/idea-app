import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { useAuthStore } from '@/store/authStore';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { useSocketStore } from '@/store/socketStore';

interface CommentSectionProps {
  ideaId: string;
}

const CommentSection = ({ ideaId }: CommentSectionProps) => {
  const { isAuthenticated } = useAuthStore();
  const { joinIdea, leaveIdea } = useSocketStore();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');

  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['comments', ideaId, sortBy],
    queryFn: () => commentsApi.getComments(ideaId, { sort: sortBy }),
    staleTime: 0, // Disable caching to always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Debug: log comments data received from API
  if (commentsData) {
    console.log('[API] commentsData.comments:', commentsData.comments);
    console.log('[API] commentsData.pagination:', commentsData.pagination);
    console.log('[API] commentsData full object:', JSON.stringify(commentsData, null, 2));
  }

  // Join idea room for real-time updates
  useEffect(() => {
    joinIdea(ideaId);
    
    return () => {
      leaveIdea(ideaId);
    };
  }, [ideaId, joinIdea, leaveIdea]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'top', label: 'Top' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
          Comments ({commentsData?.pagination.total || 0})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'top')}
          className="input text-sm"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <CommentForm
          ideaId={ideaId}
          onCommentAdded={() => refetch()}
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-3">Join the conversation!</p>
          <div className="space-x-3">
            <a href="/auth/login" className="btn btn-primary btn-sm">
              Sign In
            </a>
            <a href="/auth/register" className="btn btn-outline btn-sm">
              Sign Up
            </a>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load comments</p>
            <button onClick={() => refetch()} className="btn btn-outline btn-sm">
              Try Again
            </button>
          </div>
        ) : commentsData?.comments?.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
            <p className="text-gray-600">
              Be the first to share your thoughts on this idea!
            </p>
          </div>
        ) : (
          commentsData?.comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              ideaId={ideaId}
              onUpdate={() => refetch()}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
