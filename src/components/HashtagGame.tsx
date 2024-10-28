import React, { useState } from 'react';

interface Letter {
  char: string;
  state: 'unused' | 'selected' | 'correct';
  x: number;  // Add x position
  y: number;  // Add y position
}

const HashtagGame: React.FC = () => {
  // Reorganize letters with x,y coordinates
  const [letters, setLetters] = useState<Letter[]>([
    // First row (y=0)
    { char: 'S', state: 'unused', x: 1, y: 0 },
    { char: 'C', state: 'unused', x: 3, y: 0 },  // Moved right
    // Second row (y=1)
    { char: 'N', state: 'unused', x: 0, y: 1 },
    { char: 'L', state: 'selected', x: 1, y: 1 },
    { char: 'A', state: 'selected', x: 2, y: 1 },
    { char: 'O', state: 'correct', x: 3, y: 1 },
    { char: 'B', state: 'unused', x: 4, y: 1 },
    // Third row (y=2)
    { char: 'L', state: 'selected', x: 1, y: 2 },
    { char: 'V', state: 'unused', x: 3, y: 2 },  // Moved right
    // Fourth row (y=3)
    { char: 'S', state: 'unused', x: 0, y: 3 },
    { char: 'T', state: 'correct', x: 1, y: 3 },
    { char: 'S', state: 'selected', x: 2, y: 3 },
    { char: 'E', state: 'selected', x: 3, y: 3 },
    { char: 'P', state: 'selected', x: 4, y: 3 },
    // Fifth row (y=4)
    { char: 'A', state: 'selected', x: 1, y: 4 },
    { char: 'O', state: 'selected', x: 3, y: 4 },  // Moved right
  ]);

  const [movesLeft, setMovesLeft] = useState(12);

  const getLetterStyle = (state: Letter['state']) => {
    const base = `w-12 h-12 m-1 flex items-center justify-center text-2xl font-bold rounded`;
    
    switch (state) {
      case 'correct':
        return `${base} bg-green-500 text-white`;
      case 'selected':
        return `${base} bg-gray-300 dark:bg-gray-600 text-black dark:text-white`;
      default:
        return `${base} bg-yellow-500 text-white`;
    }
  };

  // Create a grid representation
  const renderGrid = () => {
    const grid: (Letter | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
    
    // Place letters in the grid
    letters.forEach(letter => {
      grid[letter.y][letter.x] = letter;
    });

    return (
      <div className="flex flex-col items-center">
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((letter, x) => (
              letter ? (
                <div
                  key={`${x}-${y}`}
                  className={getLetterStyle(letter.state)}
                >
                  {letter.char}
                </div>
              ) : (
                <div key={`${x}-${y}`} className="w-12 h-12 m-1" /> // Empty space
              )
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black dark:text-white">Hashtag</h1>
        <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-4">
          {movesLeft} Coups restants
        </div>
      </div>

      {renderGrid()}

      <button 
        className="mt-8 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        Indice
      </button>
    </div>
  );
};

export default HashtagGame;
