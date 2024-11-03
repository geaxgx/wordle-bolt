import React from 'react';
import { Sun, Moon, HelpCircle, ZoomIn, ZoomOut, RefreshCw, BarChart2 } from 'lucide-react';
import GameMenu from './GameMenu';
import Button from './Button';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  onHelpClick: () => void;
  onStatsClick: () => void;
  currentGame: string;
  onGameSelect: (game: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  onNewGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, onHelpClick, onStatsClick, currentGame, onGameSelect, onZoomIn, onZoomOut, canZoomIn, canZoomOut, onNewGame }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newTheme = !isDarkMode;
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    setIsDarkMode(newTheme);
    event.currentTarget.blur();
  };

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 flex justify-between items-center">
      <div className="relative">
        <GameMenu
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
          onGameSelect={onGameSelect}
          currentGame={currentGame}
        />
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onNewGame}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Nouvelle partie"
          title="Nouvelle partie"
        >
          <RefreshCw className="w-6 h-6" />
        </Button>
        <Button
          onClick={onHelpClick}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Help"
          title="Aide"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
        <Button
          onClick={onStatsClick}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Statistics"
          title="Statistiques"
        >
          <BarChart2 className="w-6 h-6" />
        </Button>
      </div>
      <div className="space-x-2">
        <Button
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
          title="Zoom arrière"
        >
          <ZoomOut className="w-6 h-6" />
        </Button>
        <Button
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
          title="Zoom avant"
        >
          <ZoomIn className="w-6 h-6" />
        </Button>
        <Button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};

export default Header;
