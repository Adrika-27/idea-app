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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-accent-400/20 dark:from-primary-600/30 dark:to-accent-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 dark:from-accent-600/30 dark:to-primary-600/30 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight mb-6">
                Where 
                <span className="gradient-text-primary"> Innovation</span>
                <br />
                Meets 
                <span className="gradient-text-primary"> Community</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                Share your hackathon ideas, get feedback from developers worldwide, and turn your concepts into reality with the power of community collaboration.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="btn btn-primary btn-xl group shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Share Your Idea
                  </Link>
                  <Link
                    to="/explore"
                    className="btn btn-outline btn-xl group"
                  >
                    <SparklesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Explore Ideas
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="btn btn-primary btn-xl group shadow-2xl shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Get Started
                  </Link>
                  <Link
                    to="/explore"
                    className="btn btn-outline btn-xl group"
                  >
                    <SparklesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Explore Ideas
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:scale-110 transition-transform duration-200">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary-500 text-white">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
              Everything You Need to 
              <span className="gradient-text-primary"> Succeed</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              From idea conception to project completion, we provide all the tools 
              and community support you need to turn your vision into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card group p-8 text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-neutral-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-accent-100 dark:bg-accent-900/50 rounded-full mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-accent-500 text-white">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
              Loved by 
              <span className="gradient-text-primary"> Innovators</span>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              See what our community has to say about their transformative experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Full-stack Developer',
                content: 'HackIdeas Pro helped me find the perfect team for my AI project. The community feedback was invaluable and helped shape my idea into something amazing!',
                rating: 5,
                avatar: 'SC'
              },
              {
                name: 'Marcus Johnson',
                role: 'Product Manager',
                content: 'The AI enhancement feature gave me insights I never thought of. My idea went from good to great in just a few iterations!',
                rating: 5,
                avatar: 'MJ'
              },
              {
                name: 'Elena Rodriguez',
                role: 'UX Designer',
                content: 'Amazing platform for collaboration. I\'ve contributed to 5 projects and learned so much from the community.',
                rating: 5,
                avatar: 'ER'
              },
            ].map((testimonial, index) => (
              <div key={index} className="card p-8 group hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold rounded-full flex items-center justify-center text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{testimonial.name}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 overflow-hidden">
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 via-transparent to-transparent rounded-full"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center p-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white">
              ✨ Ready to innovate?
            </span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to Share Your Next 
            <br />
            <span className="text-accent-200 bg-gradient-to-r from-accent-200 via-white to-accent-200 bg-clip-text text-transparent">
              Revolutionary Idea?
            </span>
          </h2>
          
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of innovators who are already building the future together. 
            Turn your concepts into reality with the power of our global community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link 
                to="/create" 
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 hover:text-primary-800 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-xl"
              >
                <LightBulbIcon className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Create Your First Idea
                <span className="ml-3 opacity-70 group-hover:opacity-100 transition-opacity duration-200">→</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/auth/register" 
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 hover:text-primary-800 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl shadow-xl"
                >
                  Get Started Free
                  <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
                <Link 
                  to="/explore" 
                  className="group inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                >
                  Explore Ideas
                  <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">✨</span>
                </Link>
              </>
            )}
          </div>
          
          {/* Enhanced social proof */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-primary-200 text-sm mb-4">Trusted by innovators worldwide</p>
            <div className="flex items-center justify-center space-x-6 opacity-70">
              <div className="text-white/80 text-xs font-medium">🚀 500+ Projects Launched</div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="text-white/80 text-xs font-medium">🌍 50+ Countries</div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="text-white/80 text-xs font-medium">⭐ 4.9/5 Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
