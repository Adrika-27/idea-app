import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ideasApi } from '@/api/ideas';
import { useAuthStore } from '@/store/authStore';
import { IdeaCategory, IdeaStatus } from '@/types';
import { 
  PencilIcon,
  SparklesIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const editIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description is too long'),
  category: z.nativeEnum(IdeaCategory),
  status: z.nativeEnum(IdeaStatus).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  estimatedTime: z.string().optional(),
  tags: z.string().optional(),
  techStack: z.string().optional(),
});

type EditIdeaFormData = z.infer<typeof editIdeaSchema>;

const EditIdeaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditIdeaFormData>({
    resolver: zodResolver(editIdeaSchema),
  });

  const description = watch('description');
  const title = watch('title');

  // Populate form when idea data is loaded
  useEffect(() => {
    if (ideaData?.idea) {
      const { idea } = ideaData;
      reset({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        status: idea.status,
        difficulty: idea.difficulty || undefined,
        estimatedTime: idea.estimatedTime || '',
        tags: idea.tags?.join(', ') || '',
        techStack: idea.techStack?.join(', ') || '',
      });
    }
  }, [ideaData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditIdeaFormData) => {
      const formattedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        techStack: data.techStack ? data.techStack.split(',').map(tech => tech.trim()).filter(Boolean) : undefined,
      };
      return ideasApi.updateIdea(id!, formattedData);
    },
    onSuccess: (data) => {
      toast.success('Idea updated successfully!');
      navigate(`/ideas/${data.idea.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update idea');
    },
  });

  const onSubmit = (data: EditIdeaFormData) => {
    updateMutation.mutate(data);
  };

  const handleAiEnhance = async () => {
    if (!title || !description) {
      toast.error('Please add a title and description first');
      return;
    }

    setIsAiEnhancing(true);
    try {
      // This would call the AI enhancement API
      // For now, we'll just show a placeholder
      toast.success('AI enhancement feature coming soon!');
    } catch (error) {
      toast.error('AI enhancement failed');
    } finally {
      setIsAiEnhancing(false);
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
          <p className="text-gray-600 mb-6">The idea you're trying to edit doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { idea } = ideaData;

  // Check if user owns this idea
  if (user?.id !== idea.author.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You can only edit your own ideas.</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'WEB_APP', label: 'Web Application' },
    { value: 'MOBILE_APP', label: 'Mobile Application' },
    { value: 'AI_ML', label: 'AI/Machine Learning' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'Internet of Things' },
    { value: 'GAME', label: 'Game Development' },
    { value: 'PRODUCTIVITY', label: 'Productivity Tool' },
    { value: 'SOCIAL', label: 'Social Platform' },
    { value: 'EDUCATION', label: 'Educational Tool' },
    { value: 'HEALTH', label: 'Health & Fitness' },
    { value: 'FINTECH', label: 'Financial Technology' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statuses = [
    { value: 'IDEA', label: 'Just an Idea' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ON_HOLD', label: 'On Hold' },
  ];

  const difficulties = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <PencilIcon className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Idea</h1>
          </div>
          <p className="text-gray-600">
            Update your idea details and share new insights with the community.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Idea Title *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter a catchy title for your idea..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {title?.length || 0}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <button
                  type="button"
                  onClick={handleAiEnhance}
                  disabled={isAiEnhancing || !title || !description}
                  className="btn btn-outline btn-sm flex items-center"
                >
                  {isAiEnhancing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      AI Enhance
                    </>
                  )}
                </button>
              </div>
              <textarea
                {...register('description')}
                id="description"
                rows={8}
                className={`input w-full resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your idea in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {description?.length || 0}/5000 characters
              </p>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category')}
                  id="category"
                  className={`input w-full ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  id="status"
                  className="input w-full"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Difficulty and Estimated Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  id="difficulty"
                  className="input w-full"
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time
                </label>
                <input
                  {...register('estimatedTime')}
                  type="text"
                  id="estimatedTime"
                  className="input w-full"
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                id="tags"
                className="input w-full"
                placeholder="react, typescript, ai, mobile (comma-separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add relevant tags to help others discover your idea
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack
              </label>
              <input
                {...register('techStack')}
                type="text"
                id="techStack"
                className="input w-full"
                placeholder="React, Node.js, PostgreSQL, AWS (comma-separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                List the technologies you plan to use
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Editing your idea:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Changes will be visible to everyone immediately</li>
                  <li>Consider notifying followers about major updates</li>
                  <li>Updated ideas may get more visibility in feeds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/ideas/${id}`)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="btn btn-primary flex items-center"
            >
              {updateMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Update Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIdeaPage;
