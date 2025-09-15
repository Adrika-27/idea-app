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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight mb-6">
                Where 
                <span className="gradient-text"> Innovation</span>
                <br />
                Meets 
                <span className="gradient-text"> Community</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Share your hackathon ideas, get feedback from developers worldwide, and turn your concepts into reality with the power of community collaboration.
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Turn Your{' '}
              <span className="gradient-text">Ideas</span>{' '}
              Into Reality
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate platform for hackathon and project ideas. Share, discover, vote, and collaborate 
              with a community of innovators to build amazing projects together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="btn btn-primary btn-xl group"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Share Your Idea
                  </Link>
                  <Link
                    to="/explore"
                    className="btn btn-secondary btn-xl group"
                  >
                    <SparklesIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Explore Ideas
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/register"
                    className="btn btn-primary btn-xl group"
                  >
                    <RocketLaunchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Get Started
                  </Link>
                  <Link
                    to="/explore"
                    className="btn btn-secondary btn-xl group"
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
                  <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2 group-hover:scale-110 transition-transform duration-200">
                    {stat.value}
                  </div>
                  <div className="text-sm text-neutral-600 font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-full mb-6">
              <span className="badge badge-primary text-sm font-semibold">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
              Everything You Need to 
              <span className="gradient-text"> Succeed</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              From idea conception to project completion, we provide all the tools 
              and community support you need to turn your vision into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-fade">
            {features.map((feature, index) => (
              <div key={index} className="card card-interactive group p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="heading-4 mb-4 group-hover:text-primary-600 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="body-base text-neutral-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-accent-100 rounded-full mb-6">
              <span className="badge badge-accent text-sm font-semibold">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
              Loved by 
              <span className="gradient-text"> Innovators</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              See what our community has to say about their transformative experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-fade">
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
                <p className="body-large text-neutral-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="avatar avatar-md bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                    <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Share Your Next 
            <br />
            <span className="text-accent-200">Big Idea?</span>
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of innovators who are already building the future together. 
            Turn your concepts into reality with the power of community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/create" className="btn bg-white text-primary-700 hover:bg-neutral-50 btn-xl group shadow-xl">
                <LightBulbIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Create Your First Idea
              </Link>
            ) : (
              <>
                <Link to="/auth/register" className="btn bg-white text-primary-700 hover:bg-neutral-50 btn-xl group shadow-xl">
                  Get Started Free
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-200" />
                </Link>
                <Link to="/explore" className="btn btn-ghost text-white border-white hover:bg-white/10 btn-xl group">
                  Explore Ideas
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
