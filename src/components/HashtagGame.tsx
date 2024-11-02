import React, { useState, useRef } from 'react';
import { Word, find_combination } from '../hashtag_find_words';

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

interface GameState {
  initialGrid: Letter[][];
  currentGrid: Letter[][];
  movesLeft: number;
  gameWon: boolean;
  gameLost: boolean;
  solutionShown: boolean;
}

const createInitialGrid = (words: Word[]): Letter[][] => {
  const grid: Letter[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  words.forEach(({ word, type }) => {
    switch (type) {
      case 'H1':
        for (let i = 0; i < 5; i++) {
          grid[1][i] = { char: word[i], state: 'unused', x: i, y: 1 };
        }
        break;
      case 'H2':
        for (let i = 0; i < 5; i++) {
          grid[3][i] = { char: word[i], state: 'unused', x: i, y: 3 };
        }
        break;
      case 'V1':
        for (let i = 0; i < 5; i++) {
          grid[i][1] = { char: word[i], state: 'unused', x: 1, y: i };
        }
        break;
      case 'V2':
        for (let i = 0; i < 5; i++) {
          grid[i][3] = { char: word[i], state: 'unused', x: 3, y: i };
        }
        break;
    }
  });
  
  return grid;
};

const shuffleGrid = (grid: Letter[][]): Letter[][] => {
  const intersections = [
    { x: 1, y: 1 }, // V1 × H1
    { x: 3, y: 1 }, // V2 × H1
    { x: 1, y: 3 }, // V1 × H2
    { x: 3, y: 3 }, // V2 × H2
  ];

  // Helper function to count correct letters in a grid
  const countCorrectLetters = (newGrid: Letter[][]): number => {
    return newGrid.flat().filter((letter, index) => {
      if (!letter) return false;
      const originalLetter = grid.flat()[index];
      return letter.char === originalLetter.char;
    }).length;
  };

  // Helper function to perform one shuffle attempt
  const attemptShuffle = (): Letter[][] => {
    const shuffledIntersections = [...intersections].sort(() => Math.random() - 0.5);
    const fixedPoints = shuffledIntersections.slice(0, 2);

    const lettersToShuffle = grid.flat().filter(letter => {
      if (!letter) return false;
      return !fixedPoints.some(point => point.x === letter.x && point.y === letter.y);
    });

    const shuffledLetters = [...lettersToShuffle].sort(() => Math.random() - 0.5);

    const newGrid: Letter[][] = Array(5).fill(null).map(() => Array(5).fill(null));
    let shuffleIndex = 0;

    grid.forEach((row, y) => {
      row.forEach((letter, x) => {
        if (!letter) return;

        const isFixed = fixedPoints.some(point => point.x === x && point.y === y);
        if (isFixed) {
          newGrid[y][x] = { ...letter, x, y };
        } else {
          newGrid[y][x] = { ...shuffledLetters[shuffleIndex], x, y };
          shuffleIndex++;
        }
      });
    });

    return newGrid;
  };

  // Keep shuffling until we get exactly 2 correct letters
  let shuffledGrid;
  do {
    shuffledGrid = attemptShuffle();
  } while (countCorrectLetters(shuffledGrid) !== 2);

  return shuffledGrid;
};

const updateLetterStates = (grid: Letter[][], initialGrid: Letter[][]): Letter[][] => {
  // Helper function similar to Wordle's getLetterStatuses
  const getWordStatus = (currentWord: string[], targetWord: string[]) => {
    const statuses = new Array(5).fill('unused');
    const targetLetterCount: Record<string, number> = {};

    // Count target letters
    targetWord.forEach(letter => {
      if (letter) {
        targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
      }
    });

    // Mark correct letters first
    currentWord.forEach((letter, i) => {
      if (letter === targetWord[i]) {
        statuses[i] = 'correct';
        targetLetterCount[letter]--;
      }
    });

    // Then mark present letters
    currentWord.forEach((letter, i) => {
      if (statuses[i] !== 'correct' && targetLetterCount[letter] > 0) {
        statuses[i] = 'selected';
        targetLetterCount[letter]--;
      }
    });
    return statuses;
  };

  // Get the words from the grid
  const getWord = (grid: Letter[][], type: 'H1' | 'H2' | 'V1' | 'V2'): string[] => {
    switch (type) {
      case 'H1': return Array(5).fill(null).map((_, i) => grid[1][i]?.char || '');
      case 'H2': return Array(5).fill(null).map((_, i) => grid[3][i]?.char || '');
      case 'V1': return Array(5).fill(null).map((_, i) => grid[i][1]?.char || '');
      case 'V2': return Array(5).fill(null).map((_, i) => grid[i][3]?.char || '');
    }
  };

  // Get statuses for each word
  const h1Status = getWordStatus(getWord(grid, 'H1'), getWord(initialGrid, 'H1'));
  const h2Status = getWordStatus(getWord(grid, 'H2'), getWord(initialGrid, 'H2'));
  const v1Status = getWordStatus(getWord(grid, 'V1'), getWord(initialGrid, 'V1'));
  const v2Status = getWordStatus(getWord(grid, 'V2'), getWord(initialGrid, 'V2'));
  // Create new grid with updated states
  return grid.map((row, y) => 
    row.map((letter, x) => {
      if (!letter) return letter;

      // Get all applicable statuses for this position
      const statuses: string[] = [];
      if (y === 1) statuses.push(h1Status[x]);
      if (y === 3) statuses.push(h2Status[x]);
      if (x === 1) statuses.push(v1Status[y]);
      if (x === 3) statuses.push(v2Status[y]);

      // If any status is 'correct', use that
      if (statuses.includes('correct')) {
        return { ...letter, state: 'correct' };
      }
      // If any status is 'selected' (present but misplaced), use that
      if (statuses.includes('selected')) {
        return { ...letter, state: 'selected' };
      }
      // Otherwise, the letter is unused
      return { ...letter, state: 'unused' };
    })
  );
};

interface Props {
  zoomLevel: number;
  ref: React.ForwardedRef<{ resetGame: () => void }>;
}

const HashtagGame = React.forwardRef<{ resetGame: () => void }, Props>(({ zoomLevel }, ref) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const words = find_combination();
    const initialGrid = createInitialGrid(words);
    const shuffledGrid = shuffleGrid(initialGrid);
    const coloredGrid = updateLetterStates(shuffledGrid, initialGrid);
    
    return {
      initialGrid,
      currentGrid: coloredGrid,
      movesLeft: 12,
      gameWon: false,
      gameLost: false,
      solutionShown: false
    };
  });

  const [draggedLetter, setDraggedLetter] = useState<DragInfo | null>(null);

  // Expose resetGame function through ref
  React.useImperativeHandle(ref, () => ({
    resetGame: () => {
      const words = find_combination();
      const initialGrid = createInitialGrid(words);
      const shuffledGrid = shuffleGrid(initialGrid);
      const coloredGrid = updateLetterStates(shuffledGrid, initialGrid);
      
      setGameState({
        initialGrid,
        currentGrid: coloredGrid,
        movesLeft: 12,
        gameWon: false,
        gameLost: false,
        solutionShown: false
      });
    }
  }));

  const handleDragStart = (e: React.DragEvent, x: number, y: number) => {
    setDraggedLetter({ sourceX: x, sourceY: y });

    // Create a clone of the dragged element
    const draggedEl = e.currentTarget.cloneNode(true) as HTMLElement;
    draggedEl.style.position = 'absolute';
    draggedEl.style.top = '0';
    draggedEl.style.left = '0';
    draggedEl.style.pointerEvents = 'none';
    
    // Set explicit width and height based on zoom level
    const baseSize = 56; // 56px = 3.5rem (w-14)
    draggedEl.style.width = `${baseSize * zoomLevel}px`;
    draggedEl.style.height = `${baseSize * zoomLevel}px`;
    draggedEl.style.display = 'flex';
    draggedEl.style.alignItems = 'center';
    draggedEl.style.justifyContent = 'center';
    draggedEl.style.fontSize = `${24 * zoomLevel}px`; // Scale font size too (24px = text-2xl)

    document.body.appendChild(draggedEl);

    // Calculate the offset based on the scaled size
    const offsetX = (baseSize * zoomLevel) / 2;
    const offsetY = (baseSize * zoomLevel) / 2;

    e.dataTransfer.setDragImage(draggedEl, offsetX, offsetY);

    setTimeout(() => {
      document.body.removeChild(draggedEl);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
  };

  const handleDrop = (targetX: number, targetY: number) => {
    if (!draggedLetter || gameState.gameWon || gameState.gameLost) return;

    const { sourceX, sourceY } = draggedLetter;
    
    if (sourceX === targetX && sourceY === targetY) {
      setDraggedLetter(null);
      return;
    }

    const newGrid = [...gameState.currentGrid];
    const sourceLetter = newGrid[sourceY][sourceX];
    const targetLetter = newGrid[targetY][targetX];

    if (sourceLetter && targetLetter) {
      // Swap letters
      newGrid[sourceY][sourceX] = { ...targetLetter, x: sourceX, y: sourceY };
      newGrid[targetY][targetX] = { ...sourceLetter, x: targetX, y: targetY };

      const updatedGrid = updateLetterStates(newGrid, gameState.initialGrid);
      
      // Check if all letters are in correct positions
      const isWon = updatedGrid.every((row, y) => 
        row.every((letter, x) => {
          if (!letter) return true; // Skip empty spaces
          return letter.char === gameState.initialGrid[y][x]?.char;
        })
      );

      const movesLeft = gameState.movesLeft - 1;

      setGameState({
        ...gameState,
        currentGrid: updatedGrid,
        movesLeft,
        gameWon: isWon,
        gameLost: !isWon && movesLeft === 0
      });
    }

    setDraggedLetter(null);
  };

  const getLetterStyle = (state: Letter['state'], isDragging: boolean) => {
    const base = `w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-md 
                 cursor-move transition-all duration-300 select-none`;
    
    const dragClass = isDragging ? 'opacity-50' : '';
    
    switch (state) {
      case 'correct':
        return `${base} ${dragClass} bg-green-500 text-white border-green-500`;
      case 'selected':
        return `${base} ${dragClass} bg-yellow-500 text-white border-yellow-500`;
      default:
        return `${base} ${dragClass} bg-gray-300 dark:bg-gray-600 text-black dark:text-white border-gray-300 dark:border-gray-600`;
    }
  };

  // Create a grid representation
  const renderGrid = () => {
    const grid: (Letter | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
    
    // Place letters in the grid
    gameState.currentGrid.forEach(row => {
      row.forEach(letter => {
        if (letter) {
          grid[letter.y][letter.x] = letter;
        }
      });
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
                onDragStart={(e) => handleDragStart(e, x, y)}
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

  const showSolution = () => {
    const solutionGrid = gameState.initialGrid.map(row =>
      row.map(letter =>
        letter ? { ...letter, state: 'correct' as const } : null
      )
    );

    setGameState(prev => ({
      ...prev,
      currentGrid: solutionGrid as Letter[][],
      solutionShown: true
    }));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black dark:text-white">Hashtag</h1>
        <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-4">
          {gameState.movesLeft <= 1 ? `${gameState.movesLeft} coup restant !!!` : `${gameState.movesLeft} coups restants`}
        </div>
      </div>

      {renderGrid()}

      {gameState.gameWon && (
        <div className="mt-4 text-center">
          <div className="text-green-600 dark:text-green-400 font-bold text-xl mb-4">
            Félicitations ! Vous avez gagné !
          </div>
          <button
            onClick={() => {
              if (ref.current) {
                ref.current.resetGame();
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Nouvelle partie
          </button>
        </div>
      )}
      
      {gameState.gameLost && (
        <div className="mt-4 text-center">
          <div className="text-red-600 dark:text-red-400 font-bold text-xl mb-4">
            Trop tard ! Partie terminée !
          </div>
          {!gameState.solutionShown && (
            <button
              onClick={showSolution}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mb-4"
            >
              Voir la solution
            </button>
          )}
          <div className="h-4"></div>
          <button
            onClick={() => ref.current?.resetGame()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"

          >
            Nouvelle partie
          </button>
        </div>
      )}
    </div>
  );
});

export default HashtagGame;
