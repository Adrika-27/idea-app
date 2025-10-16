import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ideasApi } from '@/api/ideas';
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  PlusIcon,
  TrophyIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IdeaCard from '@/components/ideas/IdeaCard';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'my-ideas' | 'bookmarks' | 'activity'>('my-ideas');

  // Fetch user's ideas
  const {
    data: userIdeas,
    isLoading: ideasLoading,
  } = useQuery({
    queryKey: ['user-ideas', user?.username],
    queryFn: () => user ? ideasApi.getUserIdeas(user.username) : Promise.resolve({ data: [], ideas: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
    enabled: !!user,
  });

  // Mock data for dashboard stats (would come from API)
  const ideas = userIdeas?.data || userIdeas?.ideas || [];
  const stats = {
    totalIdeas: ideas.length || 0,
    totalVotes: ideas.reduce((sum: number, idea: any) => sum + idea.voteScore, 0) || 0,
    totalComments: ideas.reduce((sum: number, idea: any) => sum + (idea._count?.comments || 0), 0) || 0,
    totalViews: ideas.reduce((sum: number, idea: any) => sum + (idea.views || 0), 0) || 0,
  };

  const recentActivity = [
    {
      type: 'idea_created',
      message: 'You created a new idea',
      time: '2 hours ago',
      icon: LightBulbIcon,
    },
    {
      type: 'vote_received',
      message: 'Your idea received 5 new votes',
      time: '1 day ago',
      icon: HeartIcon,
    },
    {
      type: 'comment_received',
      message: 'Someone commented on your idea',
      time: '2 days ago',
      icon: ChatBubbleLeftIcon,
    },
  ];

  const tabs = [
    { id: 'my-ideas', label: 'My Ideas', count: stats.totalIdeas },
    { id: 'bookmarks', label: 'Bookmarks', count: 0 },
    { id: 'activity', label: 'Activity', count: recentActivity.length },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Enhanced Hero Section */}
      <div className="relative bg-neutral-100/50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-200/20 dark:bg-neutral-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-200/20 dark:bg-neutral-800/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.username}</span>!
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 text-lg">
                Here's what's happening with your ideas and projects.
              </p>
            </div>
            <Link to="/create" className="btn btn-white-primary glass-card flex items-center shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <PlusIcon className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Idea
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <LightBulbIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Ideas</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{stats.totalIdeas}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Votes</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">{stats.totalVotes}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Comments</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">{stats.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <EyeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Views</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Enhanced Tabs */}
            <div className="glass-card rounded-2xl mb-6 overflow-hidden">
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'my-ideas' && (
                  <div>
                    {ideasLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : ideas.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <LightBulbIcon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">No ideas yet</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                          Share your first innovative idea with the community and start building your portfolio!
                        </p>
                        <Link to="/create" className="btn btn-primary inline-flex items-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40">
                          <PlusIcon className="w-5 h-5 mr-2" />
                          Create Your First Idea
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ideas.slice(0, 5).map((idea: any) => (
                          <IdeaCard key={idea.id} idea={idea} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookmarks' && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <HeartIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">No bookmarks yet</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                      Bookmark ideas you find interesting to save them for later reference and inspiration.
                    </p>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-300 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <activity.icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{activity.message}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/create" className="btn btn-primary w-full flex items-center justify-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Idea
                </Link>
                <Link to="/explore" className="btn btn-outline w-full">
                  Explore Ideas
                </Link>
                <Link to={`/users/${user?.username}`} className="btn btn-outline w-full">
                  View Profile
                </Link>
              </div>
            </div>

            {/* Achievements */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">First Idea</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Created your first idea</p>
                  </div>
                </div>
                
                {stats.totalVotes >= 10 && (
                  <div className="flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Popular Creator</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Received 10+ votes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
