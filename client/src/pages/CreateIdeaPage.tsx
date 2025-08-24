import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ideasApi } from '@/api/ideas';
import { IdeaCategory, IdeaStatus } from '@/types';
import { 
  LightBulbIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const createIdeaSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title is too long (max 200 characters)'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(500, 'Description is too long (max 500 characters)'),
  category: z.nativeEnum(IdeaCategory),
  status: z.nativeEnum(IdeaStatus).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  estimatedTime: z.string().optional(),
  tags: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const arr = val
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        if (arr.length > 10) return false;
        return arr.every((t) => t.length >= 2 && t.length <= 30);
      },
      { message: 'Up to 10 tags allowed, each 2-30 characters' }
    ),
  techStack: z.string().optional(),
});

type CreateIdeaFormData = z.infer<typeof createIdeaSchema>;

const CreateIdeaPage = () => {
  const navigate = useNavigate();
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateIdeaFormData>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      status: IdeaStatus.DRAFT,
      difficulty: 'BEGINNER',
    },
  });

  const description = watch('description');
  const title = watch('title');

  const createMutation = useMutation({
    mutationFn: (data: CreateIdeaFormData) => {
      const formattedData = {
        ...data,
        content: data.description, // Use description as content
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        techStack: data.techStack ? data.techStack.split(',').map(tech => tech.trim()).filter(Boolean) : undefined,
      };
      return ideasApi.createIdea(formattedData);
    },
    onSuccess: (data) => {
      toast.success('Idea created successfully!');
      navigate(`/ideas/${data.idea.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create idea');
    },
  });

  const onSubmit = (data: CreateIdeaFormData) => {
    createMutation.mutate(data);
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

  const categories = [
    { value: 'WEB', label: 'Web Application' },
    { value: 'MOBILE', label: 'Mobile Application' },
    { value: 'AI_ML', label: 'AI/Machine Learning' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'Internet of Things' },
    { value: 'GAME_DEV', label: 'Game Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' },
    { value: 'DEVTOOLS', label: 'Developer Tools' },
    { value: 'FINTECH', label: 'Financial Technology' },
    { value: 'HEALTHTECH', label: 'Health & Fitness' },
    { value: 'EDTECH', label: 'Educational Tool' },
    { value: 'SOCIAL', label: 'Social Platform' },
    { value: 'ECOMMERCE', label: 'E-commerce' },
    { value: 'PRODUCTIVITY', label: 'Productivity Tool' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statuses = [
    { value: IdeaStatus.DRAFT, label: 'Draft' },
    { value: IdeaStatus.PUBLISHED, label: 'Published' },
  ];

  const difficulties = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Share Your Idea</h1>
          </div>
          <p className="text-gray-600">
            Tell the community about your amazing project idea and get feedback, collaborators, and support.
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
                placeholder="Describe your idea in detail. What problem does it solve? How would it work? What makes it unique?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {description?.length || 0}/500 characters
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
                <p className="font-medium mb-1">Tips for a great idea post:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Be specific about the problem you're solving</li>
                  <li>Explain what makes your idea unique</li>
                  <li>Include technical details if relevant</li>
                  <li>Use relevant tags to help others find your idea</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary flex items-center"
            >
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <LightBulbIcon className="w-4 h-4 mr-2" />
                  Share Idea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIdeaPage;
