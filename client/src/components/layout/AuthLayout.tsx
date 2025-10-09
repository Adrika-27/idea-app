import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/30 dark:from-neutral-950 dark:via-primary-950/30 dark:to-accent-950/30 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-accent-400/20 dark:from-primary-600/30 dark:to-accent-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 dark:from-accent-600/30 dark:to-primary-600/30 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Enhanced Logo Section */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/25 hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">HI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold gradient-text-primary">HackIdeas</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1 tracking-wide">Pro</span>
              </div>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Welcome to the future of innovation
            </p>
          </div>

          {/* Enhanced Auth Form Container */}
          <div className="relative">
            {/* Glassmorphism container */}
            <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-neutral-800/50 shadow-2xl"></div>
            <div className="relative bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-800/50">
              <Outlet />
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span>© 2025 HackIdeas Pro</span>
              <div className="w-1 h-1 bg-neutral-400 dark:bg-neutral-600 rounded-full"></div>
              <span>All rights reserved</span>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-neutral-400 dark:text-neutral-500">
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
