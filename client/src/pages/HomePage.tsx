import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  ArrowRightIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: LightBulbIcon,
      title: 'Share Ideas',
      description: 'Post your hackathon and project ideas to get feedback from the community.',
    },
    {
      icon: UserGroupIcon,
      title: 'Community Driven',
      description: 'Vote, comment, and collaborate with fellow developers and innovators.',
    },
    {
      icon: SparklesIcon,
      title: 'AI Enhancement',
      description: 'Get AI-powered suggestions to improve and refine your ideas.',
    },
    {
      icon: RocketLaunchIcon,
      title: 'Build Together',
      description: 'Find team members and turn your ideas into reality.',
    },
  ];

  const stats = [
    { label: 'Ideas Shared', value: '10,000+' },
    { label: 'Active Users', value: '5,000+' },
    { label: 'Projects Built', value: '2,500+' },
    { label: 'Success Rate', value: '85%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Turn Your{' '}
              <span className="gradient-text">Ideas</span>{' '}
              Into Reality
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate platform for hackathon and project ideas. Share, discover, vote, and collaborate 
              with a community of innovators to build amazing projects together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/create" className="btn btn-primary btn-lg">
                    <LightBulbIcon className="w-5 h-5 mr-2" />
                    Share Your Idea
                  </Link>
                  <Link to="/explore" className="btn btn-outline btn-lg">
                    Explore Ideas
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth/register" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/explore" className="btn btn-outline btn-lg">
                    Explore Ideas
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From idea conception to project completion, we provide all the tools 
              and community support you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Loved by Innovators
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Full-stack Developer',
                content: 'HackIdeas Pro helped me find the perfect team for my AI project. The community feedback was invaluable!',
                rating: 5,
              },
              {
                name: 'Marcus Johnson',
                role: 'Product Manager',
                content: 'The AI enhancement feature gave me insights I never thought of. My idea went from good to great!',
                rating: 5,
              },
              {
                name: 'Elena Rodriguez',
                role: 'UX Designer',
                content: 'Amazing platform for collaboration. I\'ve contributed to 5 projects and learned so much.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Share Your Next Big Idea?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of innovators who are already building the future together.
          </p>
          
          {isAuthenticated ? (
            <Link to="/create" className="btn btn-white btn-lg">
              <LightBulbIcon className="w-5 h-5 mr-2" />
              Create Your First Idea
            </Link>
          ) : (
            <Link to="/auth/register" className="btn btn-white btn-lg">
              Get Started Free
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
