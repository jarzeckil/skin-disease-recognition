import { ShieldCheck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="flex items-center justify-between theme-border border-b px-6 md:px-10 py-4 theme-bg sticky top-0 z-50 transition-colors">
      {/* Logo and title */}
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg flex items-center justify-center text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight theme-text">
          DermAI Assist
        </h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full theme-surface-hover transition-colors theme-text-secondary"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User avatar placeholder */}
        <div className="h-10 w-10 rounded-full border-2 border-primary overflow-hidden theme-surface flex items-center justify-center">
          <span className="text-sm font-bold theme-text-muted">DR</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
