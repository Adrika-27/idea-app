import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ideasApi } from '@/api/ideas';
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

interface VoteButtonProps {
  ideaId: string;
  currentVote: VoteType | null;
  voteScore: number;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'vertical' | 'horizontal';
}

const VoteButton = ({ 
  ideaId, 
  currentVote, 
  voteScore, 
  size = 'md',
  orientation = 'vertical'
}: VoteButtonProps) => {
  const [optimisticVote, setOptimisticVote] = useState<VoteType | null>(currentVote);
  const [optimisticScore, setOptimisticScore] = useState(voteScore);
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (type: VoteType) => ideasApi.voteIdea(ideaId, type),
    onMutate: async (newVote) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ideas'] });
      await queryClient.cancelQueries({ queryKey: ['idea', ideaId] });

      // Calculate optimistic updates
      let newScore = voteScore;
      let newVoteType: VoteType | null = newVote;

      if (currentVote === newVote) {
        // Removing vote
        newVoteType = null;
        newScore += currentVote === VoteType.UP ? -1 : 1;
      } else if (currentVote === null) {
        // Adding new vote
        newScore += newVote === VoteType.UP ? 1 : -1;
      } else {
        // Changing vote
        newScore += newVote === VoteType.UP ? 2 : -2;
      }

      setOptimisticVote(newVoteType);
      setOptimisticScore(newScore);

      return { previousVote: currentVote, previousScore: voteScore };
    },
    onError: (_, __, context) => {
      // Revert optimistic updates on error
      if (context) {
        setOptimisticVote(context.previousVote);
        setOptimisticScore(context.previousScore);
      }
      toast.error('Failed to vote. Please try again.');
    },
    onSuccess: (data) => {
      // Update with server response
      setOptimisticVote(data.userVote);
      setOptimisticScore(data.voteScore);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });

  const handleVote = (type: VoteType) => {
    voteMutation.mutate(type);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleVote(VoteType.UP)}
          disabled={voteMutation.isPending}
          className={cn(
            'rounded-md transition-colors',
            buttonSizeClasses[size],
            optimisticVote === VoteType.UP
              ? 'text-green-600 hover:text-green-700'
              : 'text-gray-400 hover:text-gray-600',
            voteMutation.isPending && 'opacity-50 cursor-not-allowed'
          )}
          title="Upvote"
        >
          {optimisticVote === VoteType.UP ? (
            <ChevronUpIconSolid className={sizeClasses[size]} />
          ) : (
            <ChevronUpIcon className={sizeClasses[size]} />
          )}
        </button>

        <span className={cn(
          'font-medium min-w-[2rem] text-center',
          textSizeClasses[size],
          optimisticVote === VoteType.UP ? 'text-green-600' :
          optimisticVote === VoteType.DOWN ? 'text-red-600' :
          'text-gray-700'
        )}>
          {optimisticScore}
        </span>

        <button
          onClick={() => handleVote(VoteType.DOWN)}
          disabled={voteMutation.isPending}
          className={cn(
            'rounded-md transition-colors',
            buttonSizeClasses[size],
            optimisticVote === VoteType.DOWN
              ? 'text-red-600 hover:text-red-700'
              : 'text-gray-400 hover:text-gray-600',
            voteMutation.isPending && 'opacity-50 cursor-not-allowed'
          )}
          title="Downvote"
        >
          {optimisticVote === VoteType.DOWN ? (
            <ChevronDownIconSolid className={sizeClasses[size]} />
          ) : (
            <ChevronDownIcon className={sizeClasses[size]} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-1">
      <button
        onClick={() => handleVote(VoteType.UP)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded-md transition-colors',
          buttonSizeClasses[size],
          optimisticVote === VoteType.UP
            ? 'text-green-600 hover:text-green-700'
            : 'text-gray-400 hover:text-gray-600',
          voteMutation.isPending && 'opacity-50 cursor-not-allowed'
        )}
        title="Upvote"
      >
        {optimisticVote === VoteType.UP ? (
          <ChevronUpIconSolid className={sizeClasses[size]} />
        ) : (
          <ChevronUpIcon className={sizeClasses[size]} />
        )}
      </button>

      <span className={cn(
        'font-medium min-w-[2rem] text-center',
        textSizeClasses[size],
        optimisticVote === VoteType.UP ? 'text-green-600' :
        optimisticVote === VoteType.DOWN ? 'text-red-600' :
        'text-gray-700'
      )}>
        {optimisticScore}
      </span>

      <button
        onClick={() => handleVote(VoteType.DOWN)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded-md transition-colors',
          buttonSizeClasses[size],
          optimisticVote === VoteType.DOWN
            ? 'text-red-600 hover:text-red-700'
            : 'text-gray-400 hover:text-gray-600',
          voteMutation.isPending && 'opacity-50 cursor-not-allowed'
        )}
        title="Downvote"
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

export default VoteButton;
