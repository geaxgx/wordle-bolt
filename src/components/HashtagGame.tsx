import React, { useState } from 'react';

interface Letter {
  char: string;
  state: 'unused' | 'selected' | 'correct';
  x: number;
  y: number;
}

interface DragInfo {
  sourceX: number;
  sourceY: number;
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
  const [draggedLetter, setDraggedLetter] = useState<DragInfo | null>(null);

  const handleDragStart = (x: number, y: number) => {
    setDraggedLetter({ sourceX: x, sourceY: y });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (targetX: number, targetY: number) => {
    if (!draggedLetter) return;

    const { sourceX, sourceY } = draggedLetter;
    
    // Don't swap if dropping on the same square
    if (sourceX === targetX && sourceY === targetY) {
      setDraggedLetter(null);
      return;
    }

    // Find the source and target letters
    const sourceLetter = letters.find(l => l.x === sourceX && l.y === sourceY);
    const targetLetter = letters.find(l => l.x === targetX && l.y === targetY);

    if (sourceLetter && targetLetter) {
      // Create new array with swapped positions
      const newLetters = letters.map(letter => {
        if (letter === sourceLetter) {
          return { ...letter, x: targetX, y: targetY };
        }
        if (letter === targetLetter) {
          return { ...letter, x: sourceX, y: sourceY };
        }
        return letter;
      });

      setLetters(newLetters);
      setMovesLeft(prev => prev - 1);
    }

    setDraggedLetter(null);
  };

  const getLetterStyle = (state: Letter['state'], isDragging: boolean) => {
    const base = `w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-md 
                 cursor-move transition-all duration-300`;
    
    const dragClass = isDragging ? 'opacity-50 scale-95' : '';
    
    switch (state) {
      case 'correct':
        return `${base} ${dragClass} bg-green-500 text-white border-green-500`;
      case 'selected':
        return `${base} ${dragClass} bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-gray-300 dark:border-gray-600`;
      default:
        return `${base} ${dragClass} bg-yellow-500 text-white border-yellow-500`;
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
      <div className="flex flex-col gap-1">
        {grid.map((row, y) => (
          <div key={y} className="flex gap-1">
            {row.map((letter, x) => (
              <div
                key={`${x}-${y}`}
                className={letter ? getLetterStyle(
                  letter.state,
                  draggedLetter?.sourceX === x && draggedLetter?.sourceY === y
                ) : 'w-14 h-14'}
                draggable={!!letter}
                onDragStart={() => handleDragStart(x, y)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(x, y)}
              >
                {letter?.char}
              </div>
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
        disabled={movesLeft <= 0}
      >
        Indice
      </button>
    </div>
  );
};

export default HashtagGame;
