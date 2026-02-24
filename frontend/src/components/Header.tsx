import { ShieldCheck, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Theme toggle is visual only for now - full implementation later
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-6 md:px-10 py-4 bg-background-dark sticky top-0 z-50">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          DermAI Assist
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300"
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User avatar placeholder */}
        <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden bg-slate-700 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-400">DR</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
