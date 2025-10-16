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
import AIEnhancementPanel from '@/components/ai/AIEnhancementPanel';
import AISuggestionTooltip from '@/components/ai/AISuggestionTooltip';
import FeasibilityScoreDisplay from '@/components/ai/FeasibilityScoreDisplay';
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateIdeaFormData>({
    resolver: zodResolver(createIdeaSchema),
    defaultValues: {
      status: IdeaStatus.DRAFT,
      difficulty: 'BEGINNER',
    },
  });

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
              <LightBulbIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Share Your 
              <span className="block text-accent-200">Brilliant Idea</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Transform your innovative concept into reality. Get feedback, find collaborators, and inspire the community.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        {/* Enhanced Form Container */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Title Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Give Your Idea a Catchy Title</h2>
              </div>
              
              <div className="form-group">
                <label htmlFor="title" className="label">
                  Title <span className="text-error-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="title"
                  placeholder="Enter a catchy title for your idea..."
                  className={`input h-14 text-lg ${errors.title ? 'input-error' : ''}`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.title && (
                    <p className="form-error flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4" />
                      {errors.title.message}
                    </p>
                  )}
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-auto">
                    {watch('title')?.length || 0}/200 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Describe Your Vision</h2>
              </div>
              
              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="description" className="label">
                    Description <span className="text-error-500">*</span>
                  </label>
                  <AISuggestionTooltip
                    title={watch('title') || ''}
                    description={watch('description') || ''}
                    onSuggestionSelect={(suggestion) => {
                      const currentDesc = watch('description') || '';
                      const newDesc = currentDesc ? `${currentDesc}\n\n${suggestion}` : suggestion;
                      setValue('description', newDesc);
                    }}
                  />
                </div>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={6}
                  placeholder="Describe your idea in detail. What problem does it solve? How would it work? What makes it unique?"
                  className={`textarea resize-none ${errors.description ? 'input-error' : ''}`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.description && (
                    <p className="form-error flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-auto">
                    {watch('description')?.length || 0}/500 characters
                  </span>
                </div>
              </div>

              {/* Feasibility Score Display */}
              {watch('title') && watch('description') && watch('description').length > 50 && (
                <FeasibilityScoreDisplay
                  title={watch('title')}
                  description={watch('description')}
                  category={watch('category')}
                  className="mt-4"
                />
              )}
            </div>

            {/* Category and Status Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Categorize & Configure</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="category" className="label">
                    Category <span className="text-error-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    id="category"
                    className={`select ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="form-error flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="label">Status</label>
                  <select
                    {...register('status')}
                    id="status"
                    className="select"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty" className="label">Difficulty Level</label>
                  <select
                    {...register('difficulty')}
                    id="difficulty"
                    className="select"
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedTime" className="label">Estimated Time</label>
                  <input
                    {...register('estimatedTime')}
                    type="text"
                    id="estimatedTime"
                    placeholder="e.g., 2 weeks, 1 month"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Tags and Tech Stack Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Add Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="tags" className="label">Tags</label>
                  <input
                    {...register('tags')}
                    type="text"
                    id="tags"
                    placeholder="react, typescript, ai, mobile (comma-separated)"
                    className={`input ${errors.tags ? 'input-error' : ''}`}
                  />
                  <p className="form-helper">Add relevant tags to help others discover your idea</p>
                  {errors.tags && (
                    <p className="form-error flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4" />
                      {errors.tags.message}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="techStack" className="label">Tech Stack</label>
                  <input
                    {...register('techStack')}
                    type="text"
                    id="techStack"
                    placeholder="React, Node.js, PostgreSQL, AWS (comma-separated)"
                    className="input"
                  />
                  <p className="form-helper">List the technologies you plan to use</p>
                </div>
              </div>
            </div>



            {/* AI Enhancement Panel */}
            {watch('title') && watch('description') && watch('description').length > 50 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">AI-Powered Insights</h2>
                </div>
                
                <AIEnhancementPanel
                  title={watch('title')}
                  description={watch('description')}
                  category={watch('category')}
                  tags={watch('tags') ? watch('tags')!.split(',').map(t => t.trim()).filter(Boolean) : []}
                  onSuggestionsApplied={(suggestions) => {
                    if (suggestions.tags) {
                      const currentTags = watch('tags') || '';
                      const newTags = suggestions.tags.join(', ');
                      setValue('tags', currentTags ? `${currentTags}, ${newTags}` : newTags);
                    }
                    if (suggestions.description) {
                      setValue('description', suggestions.description);
                    }
                    if (suggestions.techStack) {
                      const currentTechStack = watch('techStack') || '';
                      const newTechStack = suggestions.techStack.join(', ');
                      setValue('techStack', currentTechStack ? `${currentTechStack}, ${newTechStack}` : newTechStack);
                    }
                  }}
                />
              </div>
            )}

            {/* Enhanced Submit Section */}
            <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn btn-primary btn-lg flex-1 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Publish Idea
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline btn-lg px-8"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4 text-center">
                By publishing, you agree to share your idea with the community under our 
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline ml-1">Terms of Service</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

};

export default CreateIdeaPage;
