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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.username}! Here's what's happening with your ideas.
              </p>
            </div>
            <Link to="/create" className="btn btn-primary flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Idea
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIdeas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-900'
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
                      <div className="text-center py-8">
                        <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
                        <p className="text-gray-600 mb-4">
                          Share your first idea with the community!
                        </p>
                        <Link to="/create" className="btn btn-primary">
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
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HeartIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                    <p className="text-gray-600">
                      Bookmark ideas you find interesting to save them for later.
                    </p>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <activity.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/create" className="btn btn-primary w-full flex items-center justify-center">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">First Idea</p>
                    <p className="text-xs text-gray-500">Created your first idea</p>
                  </div>
                </div>
                
                {stats.totalVotes >= 10 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <HeartIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Popular Creator</p>
                      <p className="text-xs text-gray-500">Received 10+ votes</p>
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
