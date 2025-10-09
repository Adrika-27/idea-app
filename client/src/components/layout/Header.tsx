import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { 
  Bars3Icon, 
  XMarkIcon, 
  PlusIcon, 
  BellIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Force logout even if API call fails
      navigate('/');
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Explore', href: '/explore', icon: GlobeAltIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profile', href: `/users/${user?.username}` },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav backdrop-blur-xl border-b border-neutral-200/20 dark:border-neutral-800/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-lg">HI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text-primary">HackIdeas</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 -mt-1 tracking-wide">Pro</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                {/* Create button */}
                <Link
                  to="/create"
                  className="btn btn-primary btn-sm flex items-center space-x-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-all duration-200 group"
                >
                  <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  {/* Notification badge */}
                  <span className="absolute top-2 right-2 w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
                </Link>

                {/* User menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-all duration-200 group">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-transparent group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all duration-200">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-200">
                      {user?.username}
                    </span>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95 translate-y-1"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 translate-y-1"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-56 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 dark:border-neutral-800/50 focus:outline-none z-50 overflow-hidden">
                      <div className="py-2">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={`${
                                  active 
                                    ? 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100' 
                                    : 'text-neutral-700 dark:text-neutral-300'
                                } flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80`}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                        <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 my-1"></div>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active 
                                  ? 'bg-error-50 dark:bg-error-900/50 text-error-700 dark:text-error-400' 
                                  : 'text-neutral-700 dark:text-neutral-300'
                              } flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-error-50 dark:hover:bg-error-900/50 hover:text-error-700 dark:hover:text-error-400`}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="btn btn-primary btn-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200/50 dark:border-neutral-800/50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-neutral-200/50 dark:border-neutral-800/50 my-4"></div>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-neutral-600 dark:text-neutral-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/50 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
