import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../../store/themeStore';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-2.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-all duration-200 group focus-ring"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <SunIcon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform group-hover:scale-110 ${
            isDarkMode 
              ? 'opacity-0 rotate-180 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        <MoonIcon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 transform group-hover:scale-110 ${
            isDarkMode 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-180 scale-0'
          }`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;