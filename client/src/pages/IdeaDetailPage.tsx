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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-600 dark:text-neutral-400 mt-4">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (error || !ideaData) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center glass-card rounded-2xl p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Idea not found</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">The idea you're looking for doesn't exist or has been removed.</p>
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-all duration-300 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to ideas
        </button>

        {/* Main Content */}
        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {idea.author.avatar ? (
                  <img
                    src={idea.author.avatar}
                    alt={idea.author.username}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary-500/20"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-7 h-7 text-neutral-600 dark:text-neutral-400" />
                  </div>
                )}
                <div>
                  <Link
                    to={`/users/${idea.author.username}`}
                    className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300"
                  >
                    {idea.author.username}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
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
                {/* Enhanced Actions */}
                <button
                  onClick={handleShare}
                  className="p-3 text-neutral-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-300 group"
                  title="Share idea"
                >
                  <ShareIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </button>

                {isAuthenticated && !isOwner && (
                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking}
                    className={`p-3 rounded-xl transition-all duration-300 group ${
                      idea.isBookmarked
                        ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/30'
                        : 'text-neutral-400 dark:text-neutral-500 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={idea.isBookmarked ? 'Remove bookmark' : 'Bookmark idea'}
                  >
                    {idea.isBookmarked ? (
                      <BookmarkIconSolid className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </button>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/ideas/${idea.id}/edit`}
                      className="p-3 text-neutral-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-300 group"
                      title="Edit idea"
                    >
                      <PencilIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="p-3 text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 group"
                      title="Delete idea"
                    >
                      <TrashIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Title and Category */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {idea.title}
              </h1>
              {idea.category && (
                <div className="flex-shrink-0">
                  <CategoryBadge category={idea.category} />
                </div>
              )}
            </div>

            {/* Tags */}
            {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0)) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(idea.techStack || idea.aiTechStack || []).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                  >
                    <TagIcon className="w-3 h-3 mr-1.5" />
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
              
              <div className="text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                {idea._count?.comments || 0} comments
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-8 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">About this idea</h2>
            <div className="prose max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
                {idea.description}
              </div>
            </div>

            {/* Technical Details */}
            {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0) || idea.difficulty || idea.aiComplexity || idea.estimatedTime) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                {((idea.techStack && idea.techStack.length > 0) || (idea.aiTechStack && idea.aiTechStack.length > 0)) && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center">
                      <TagIcon className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400" />
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(idea.techStack || idea.aiTechStack || []).map((tech: string, index: number) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-white dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(idea.difficulty || idea.aiComplexity) && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Difficulty</h4>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium border border-orange-200 dark:border-orange-800">
                      {(idea.difficulty || idea.aiComplexity || '').toLowerCase()}
                    </div>
                  </div>
                )}
                
                {idea.estimatedTime && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Estimated Time</h4>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
                      <CalendarIcon className="w-4 h-4 mr-1.5" />
                      {idea.estimatedTime}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Discussion</h2>
              <CommentSection ideaId={idea.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailPage;
