import React from 'react';
import { FaBook } from 'react-icons/fa';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  cursorPosition: number;
  invalidGuess: boolean;
  onTileClick: (position: number) => void;
  gameOver?: boolean;
  wordDefinition?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  guesses, 
  currentGuess, 
  targetWord, 
  cursorPosition, 
  invalidGuess, 
  onTileClick,
  gameOver,
  wordDefinition 
}) => {
  const rows = Array(6).fill('').map((_, index) => 
    index < guesses.length ? guesses[index] : 
    index === guesses.length ? currentGuess : 
    ''
  );

  const getLetterStatuses = (guess: string) => {
    const statuses = new Array(5).fill('absent');
    const targetLetterCount: Record<string, number> = {};

    // Count target letters
    for (let i = 0; i < 5; i++) {
      const targetLetter = targetWord[i];
      targetLetterCount[targetLetter] = (targetLetterCount[targetLetter] || 0) + 1;
    }

    // Mark correct letters
    for (let i = 0; i < 5; i++) {
      if (guess[i] === targetWord[i]) {
        statuses[i] = 'correct';
        targetLetterCount[guess[i]]--;
      }
    }

    // Mark present letters
    for (let i = 0; i < 5; i++) {
      if (statuses[i] !== 'correct' && targetLetterCount[guess[i]] > 0) {
        statuses[i] = 'present';
        targetLetterCount[guess[i]]--;
      }
    }

    return statuses;
  };

  return (
    <div className="grid grid-rows-6 gap-1">
      {rows.map((guess, rowIndex) => {
        const letterStatuses = rowIndex < guesses.length ? getLetterStatuses(guess) : [];
        const isWinningRow = gameOver && guess === targetWord;
        
        return (
          <div key={rowIndex} className="flex items-center gap-2">
            <div className={`grid grid-cols-5 gap-1 ${invalidGuess && rowIndex === guesses.length ? 'shake-animation' : ''}`}>
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                let className = 'w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-all duration-300 rounded-md cursor-pointer';

                if (rowIndex < guesses.length) {
                  className += ' flip-animation';
                  const status = letterStatuses[colIndex];
                  if (status === 'correct') {
                    className += ' bg-green-500 text-white border-green-500';
                  } else if (status === 'present') {
                    className += ' bg-yellow-500 text-white border-yellow-500';
                  } else {
                    className += ' bg-gray-500 text-white border-gray-500';
                  }
                } else {
                  className += ' bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600';
                  if (rowIndex === guesses.length && colIndex === cursorPosition) {
                    className += ' border-gray-800 dark:border-white border-4 rounded-full';
                  }
                  if (invalidGuess && rowIndex === guesses.length) {
                    className += ' bg-orange-200 dark:bg-orange-400';
                  }
                }

                return (
                  <div key={colIndex} className={className} onClick={() => onTileClick(colIndex)}>
                    {letter}
                  </div>
                );
              })}
            </div>
            
            {isWinningRow && (
              <div className="relative ml-2">
                <div className="group">
                  <FaBook className="text-2xl text-blue-500 cursor-help" />
                  
                  {/* Hovercard */}
                  <div className="invisible group-hover:visible absolute left-8 top-0 w-72 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {wordDefinition || 'Chargement de la définition...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
