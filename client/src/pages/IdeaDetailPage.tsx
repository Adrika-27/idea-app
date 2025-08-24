import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ideasApi } from '../api/ideas';
import { useAuthStore } from '@/store/authStore';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  BookmarkIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import VoteButton from '@/components/ideas/VoteButton';
import CategoryBadge from '@/components/ideas/CategoryBadge';
import CommentSection from '@/components/comments/CommentSection';
import toast from 'react-hot-toast';
import { useSocketStore } from '@/store/socketStore';

const IdeaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { socket, joinIdea, leaveIdea } = useSocketStore();

  // Fetch idea details
  const {
    data: ideaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['idea', id],
    queryFn: () => ideasApi.getIdea(id!),
    enabled: !!id,
  });

  // Real-time vote updates via Socket.IO
  useEffect(() => {
    if (!id) return;
    joinIdea(id);

    const handleVoteUpdated = (payload: any) => {
      if (!payload || payload.ideaId !== id) return;
      const { voteScore } = payload;
      // Update only the aggregate score to avoid overwriting per-user vote state
      queryClient.setQueryData(['idea', id], (old: any) => {
        if (!old?.idea) return old;
        return {
          ...old,
          idea: {
            ...old.idea,
            voteScore,
          },
        };
      });
      // Optionally refresh lists so Explore/feeds reflect new scores
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    };

    socket?.on('vote:updated', handleVoteUpdated);

    return () => {
      socket?.off('vote:updated', handleVoteUpdated);
      leaveIdea(id);
    };
  }, [id, socket, joinIdea, leaveIdea, queryClient]);

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (ideaId: string) => ideasApi.bookmarkIdea(ideaId),
    onMutate: async (ideaId: string) => {
      setIsBookmarking(true);
      await queryClient.cancelQueries({ queryKey: ['idea', ideaId] });
      
      const previousData = queryClient.getQueryData(['idea', ideaId]);
      
      queryClient.setQueryData(['idea', ideaId], (old: any) => ({
        ...old,
        idea: {
          ...old?.idea,
          isBookmarked: !old?.idea?.isBookmarked,
        },
      }));

      return { previousData };
    },
    onError: (_err: any, ideaId: string, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(['idea', ideaId], context.previousData);
      }
      toast.error('Failed to bookmark idea');
    },
    onSuccess: (data: any) => {
      toast.success(data.message);
    },
    onSettled: (_, __, ideaId) => {
      setIsBookmarking(false);
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (ideaId: string) => ideasApi.deleteIdea(ideaId),
    onSuccess: () => {
      toast.success('Idea deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      navigate('/explore');
    },
    onError: () => {
      toast.error('Failed to delete idea');
    },
  });

  const handleBookmark = () => {
    if (!isAuthenticated || !idea) {
      toast.error('Please login to bookmark ideas');
      return;
    }
    bookmarkMutation.mutate(idea.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      if (!idea) return;
      deleteMutation.mutate(idea.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ideaData?.idea.title,
          text: ideaData?.idea.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !ideaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h1>
          <p className="text-gray-600 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
          <Link to="/explore" className="btn btn-primary">
            Explore Ideas
          </Link>
        </div>
      </div>
    );
  }

  const { idea } = ideaData;
  const isOwner = user?.id === idea.author.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {idea.author.avatar ? (
                  <img
                    src={idea.author.avatar}
                    alt={idea.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <Link
                    to={`/users/${idea.author.username}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {idea.author.username}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {idea.views || 0} views
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Actions */}
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                  title="Share"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>

                {isAuthenticated && (
                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    className={`p-2 rounded-md transition-colors ${
                      idea.isBookmarked
                        ? 'text-primary-600 hover:text-primary-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={idea.isBookmarked ? 'Remove bookmark' : 'Bookmark idea'}
                  >
                    {idea.isBookmarked ? (
                      <BookmarkIconSolid className="w-5 h-5" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" />
                    )}
                  </button>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/ideas/${idea.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                      title="Edit idea"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      title="Delete idea"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Title and Category */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex-1 mr-4">
                {idea.title}
              </h1>
              {idea.category && <CategoryBadge category={idea.category} />}
            </div>

            {/* Tags */}
            {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0)) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(idea.techStack || idea.aiTechStack || []).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Vote Section */}
            <div className="flex items-center justify-between">
              <VoteButton
                ideaId={idea.id}
                currentVote={idea.userVote || null}
                voteScore={idea.voteScore}
                size="lg"
                orientation="horizontal"
              />
              
              <div className="text-sm text-gray-500">
                {idea._count?.comments || 0} comments
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {idea.description}
              </div>
            </div>

            {/* Technical Details */}
            {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0) || idea.difficulty || idea.aiComplexity || idea.estimatedTime) && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0)) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {(idea.techStack || idea.aiTechStack || []).map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white rounded text-xs text-gray-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(idea.difficulty || idea.aiComplexity) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Difficulty</h4>
                    <span className="text-sm text-gray-600 capitalize">
                      {(idea.difficulty || idea.aiComplexity || '').toLowerCase()}
                    </span>
                  </div>
                )}
                
                {idea.estimatedTime && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Estimated Time</h4>
                    <span className="text-gray-600">{idea.counts?.votes || idea._count?.votes || 0} votes</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <CommentSection ideaId={idea.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
