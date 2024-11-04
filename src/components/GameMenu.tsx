import React from 'react';
import { Menu, X } from 'lucide-react';

interface GameMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onGameSelect: (game: string) => void;
  currentGame: string;
}

const GameMenu: React.FC<GameMenuProps> = ({ isOpen, onToggle, onGameSelect, currentGame }) => {
  const games = [
    { id: 'wordle', name: 'Wordle' },
    { id: 'hashtag', name: 'Hashtag' },
    { id: 'jackpot', name: 'Jackpot' },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-50">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                onGameSelect(game.id);
                onToggle();
              }}
              className={`block w-full text-left px-4 py-2 rounded ${
                currentGame === game.id
                  ? 'bg-blue-500 text-white'
                  : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default GameMenu;
