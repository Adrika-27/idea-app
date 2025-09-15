import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments';
import { VoteType } from '@/types';
import { 
  ChevronUpIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { 
  ChevronUpIcon as ChevronUpIconSolid, 
  ChevronDownIcon as ChevronDownIconSolid 
} from '@heroicons/react/24/solid';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface CommentVoteButtonProps {
  commentId: string;
  ideaId: string;
  currentVote: VoteType | null;
  voteScore: number;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
}

const CommentVoteButton = ({ 
  commentId,
  ideaId,
  currentVote, 
  voteScore, 
  size = 'md',
  orientation = 'vertical'
}: CommentVoteButtonProps) => {
  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(currentVote);
  const [optimisticScore, setOptimisticScore] = useState(voteScore);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => {
      console.log(`[CommentVote] Voting ${type} on comment ${commentId}`);
      return commentsApi.voteComment(commentId, type);
    },
    onMutate: async (newVote) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', ideaId] });

      // Optimistic update
      let scoreChange = 0;
      if (optimisticVote === null) {
        scoreChange = newVote === VoteType.UP ? 1 : -1;
      } else if (optimisticVote !== newVote) {
        scoreChange = newVote === VoteType.UP ? 2 : -2;
      } else {
        // Removing vote
        scoreChange = optimisticVote === VoteType.UP ? -1 : 1;
        setOptimisticVote(null);
        setOptimisticScore(prev => prev + scoreChange);
        return;
      }

      setOptimisticVote(newVote);
      setOptimisticScore(prev => prev + scoreChange);
    },
    onSuccess: (data) => {
      console.log(`[CommentVote] Vote successful:`, data);
      setOptimisticVote(data.userVote);
      setOptimisticScore(data.voteScore);
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
      toast.success('Vote updated!');
    },
    onError: (error: any) => {
      console.error(`[CommentVote] Vote failed:`, error);
      // Revert optimistic update
      setOptimisticVote(currentVote);
      setOptimisticScore(voteScore);
      toast.error(error.response?.data?.message || 'Failed to vote');
    },
  });

  const handleVote = (type: VoteType) => {
    if (voteMutation.isPending) return;
    
    // If clicking the same vote type, remove the vote
    const newVote = optimisticVote === type ? null : type;
    console.log(`[CommentVote] Handling vote: current=${optimisticVote}, new=${newVote}`);
    
    if (newVote === null) {
      // Remove vote by sending the opposite type (API handles toggle)
      voteMutation.mutate(type);
    } else {
      voteMutation.mutate(newVote);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const scoreClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn(
      'flex items-center gap-1',
      isVertical ? 'flex-col' : 'flex-row'
    )}>
      {/* Upvote Button */}
      <button
        onClick={() => handleVote(VoteType.UP)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded-full transition-colors duration-200',
          buttonClasses[size],
          optimisticVote === VoteType.UP
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50',
          voteMutation.isPending && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Upvote comment"
      >
        {optimisticVote === VoteType.UP ? (
          <ChevronUpIconSolid className={sizeClasses[size]} />
        ) : (
          <ChevronUpIcon className={sizeClasses[size]} />
        )}
      </button>

      {/* Score */}
      <span className={cn(
        'font-medium tabular-nums min-w-[2ch] text-center',
        scoreClasses[size],
        optimisticScore > 0 
          ? 'text-green-600' 
          : optimisticScore < 0 
          ? 'text-red-600' 
          : 'text-gray-600'
      )}>
        {optimisticScore}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote(VoteType.DOWN)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded-full transition-colors duration-200',
          buttonClasses[size],
          optimisticVote === VoteType.DOWN
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50',
          voteMutation.isPending && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Downvote comment"
      >
        {optimisticVote === VoteType.DOWN ? (
          <ChevronDownIconSolid className={sizeClasses[size]} />
        ) : (
          <ChevronDownIcon className={sizeClasses[size]} />
        )}
      </button>
    </div>
  );
};

export default CommentVoteButton;