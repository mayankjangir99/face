import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="soft-button rounded-full border border-slate-200 bg-white/80 p-3 text-slate-700 hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </button>
  );
};

export default ThemeToggle;
