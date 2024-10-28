import React from 'react';
import { Sun, Moon, HelpCircle } from 'lucide-react';
import GameMenu from './GameMenu';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  onHelpClick: () => void;
  currentGame: string;
  onGameSelect: (game: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, onHelpClick, currentGame, onGameSelect }) => {
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
      <div className="space-x-2">
        <button
          onClick={onHelpClick}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default Header;
