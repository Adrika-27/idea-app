import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { ideasApi } from '@/api/ideas';
import { useAuthStore } from '@/store/authStore';
import { 
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IdeaCard from '@/components/ideas/IdeaCard';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'ideas' | 'activity'>('ideas');

  // Fetch user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => userApi.getUserProfile(username!),
    enabled: !!username,
  });

  // Fetch user's ideas
  const {
    data: userIdeas,
    isLoading: ideasLoading,
  } = useQuery({
    queryKey: ['user-ideas', username],
    queryFn: () => ideasApi.getUserIdeas(username!),
    enabled: !!username && activeTab === 'ideas',
  });

  // Fetch user stats
  const {
    data: userStats,
  } = useQuery({
    queryKey: ['user-stats', username],
    queryFn: () => userApi.getUserStats(username!),
    enabled: !!username,
  });

  const isOwnProfile = currentUser?.username === username;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Link to="/explore" className="btn btn-primary">
            Explore Ideas
          </Link>
        </div>
      </div>
    );
  }

  const { user } = profileData;

  const stats = [
    {
      label: 'Ideas',
      value: userStats?.totalIdeas || 0,
      icon: HeartIcon,
    },
    {
      label: 'Total Votes',
      value: userStats?.totalVotes || 0,
      icon: HeartIcon,
    },
    {
      label: 'Comments',
      value: userStats?.totalComments || 0,
      icon: ChatBubbleLeftIcon,
    },
    {
      label: 'Views',
      value: userStats?.totalViews || 0,
      icon: EyeIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                {user.isVerified && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-gray-600 mb-3">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                
                {user.location && (
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {user.location}
                  </span>
                )}
                
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              {isOwnProfile ? (
                <Link to="/settings" className="btn btn-outline">
                  Edit Profile
                </Link>
              ) : isAuthenticated ? (
                <button
                  className={`btn ${user.isFollowing ? 'btn-outline' : 'btn-primary'} flex items-center`}
                >
                  {user.isFollowing ? (
                    <>
                      <UserMinusIcon className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'ideas', label: 'Ideas', count: userStats?.totalIdeas || 0 },
                { id: 'activity', label: 'Activity', count: 0 },
              ].map((tab) => (
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
            {activeTab === 'ideas' && (
              <div>
                {ideasLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : userIdeas?.ideas.length === 0 ? (
                  <div className="text-center py-8">
                    <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isOwnProfile ? "You haven't" : `${user.username} hasn't`} shared any ideas yet
                    </h3>
                    <p className="text-gray-600">
                      {isOwnProfile ? (
                        <>
                          Share your first idea with the community!{' '}
                          <Link to="/create" className="text-primary-600 hover:text-primary-700">
                            Create an idea
                          </Link>
                        </>
                      ) : (
                        'Check back later for new ideas.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userIdeas?.ideas.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">
                  Activity feed coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
