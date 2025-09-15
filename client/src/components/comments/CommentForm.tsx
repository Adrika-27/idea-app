import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { commentsApi } from '@/api/comments';
import { useAuthStore } from '@/store/authStore';
import { PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const commentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters').max(2000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  ideaId: string;
  parentId?: string;
  onCommentAdded: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

const CommentForm = ({ 
  ideaId, 
  parentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "Share your thoughts..." 
}: CommentFormProps) => {
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const content = watch('content');

  const commentMutation = useMutation({
    mutationFn: (data: CommentFormData) => 
      commentsApi.createComment(ideaId, { ...data, parentCommentId: parentId }),
    onSuccess: (result) => {
      console.log('[CommentForm] Comment created successfully:', result);
      reset();
      setIsExpanded(false);
      onCommentAdded();
      toast.success('Comment added successfully!');
      if (onCancel) onCancel();
    },
    onError: (error: any) => {
      console.error('[CommentForm] Failed to create comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const onSubmit = (data: CommentFormData) => {
    commentMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsExpanded(false);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <textarea
            {...register('content')}
            placeholder={placeholder}
            rows={isExpanded ? 3 : 1}
            onFocus={() => setIsExpanded(true)}
            className={`input resize-none transition-all duration-200 ${
              errors.content ? 'border-red-500' : ''
            }`}
          />
          
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}

          {/* Character count */}
          {isExpanded && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {content?.length || 0}/2000 characters
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {isExpanded && (
        <div className="flex justify-end space-x-3 ml-11">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline btn-sm"
            disabled={commentMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={commentMutation.isPending || !content?.trim()}
            className="btn btn-primary btn-sm flex items-center"
          >
            {commentMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Posting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Post Comment
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default CommentForm;
