import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { findJackpotWords, isValidWord, JackpotWord } from '../jackpot_find_words';

interface DragInfo {
    row: number;
    col: number;
}

interface LineDropInfo {
    row: number;
}

interface JackpotGameProps {
  onGameEnd: (won: boolean, moves: number) => void;
  renderGameStats: (gameType: GameType) => React.ReactNode;
  zoomLevel: number;
}

export const JackpotGame = forwardRef<{ resetGame: () => void }, JackpotGameProps>(
  ({ onGameEnd, renderGameStats, zoomLevel }, ref) => {
    const [words, setWords] = useState<JackpotWord[]>([]);
    const [draggedLetter, setDraggedLetter] = useState<DragInfo | null>(null);
    const [gameWon, setGameWon] = useState(false);
    const [moves, setMoves] = useState(0);
    const [wordCount, setWordCount] = useState(3);
    const [draggedLine, setDraggedLine] = useState<LineDropInfo | null>(null);
    const [dropTargetRow, setDropTargetRow] = useState<number | null>(null);

    useEffect(() => {
        startNewGame();
    }, [wordCount]);

    const startNewGame = () => {
        setWords(findJackpotWords(wordCount));
        setDraggedLetter(null);
        setGameWon(false);
        setMoves(0);
    };

    const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
        setDraggedLetter({ row, col });

        // Get the original element's position
        const originalRect = e.currentTarget.getBoundingClientRect();
        
        // Create dragged element clone
        const draggedEl = e.currentTarget.cloneNode(true) as HTMLElement;
        draggedEl.style.position = 'absolute';
        draggedEl.style.left = `${originalRect.left}px`;
        draggedEl.style.top = '0';
        draggedEl.style.pointerEvents = 'none';
        draggedEl.style.opacity = '0.6';
        
        // Add performance-oriented CSS properties
        draggedEl.style.willChange = 'transform';
        draggedEl.style.transform = 'translateY(0)';
        draggedEl.style.transition = 'none';
        
        const baseSize = 56;
        draggedEl.style.width = `${baseSize * zoomLevel}px`;
        draggedEl.style.height = `${baseSize * zoomLevel}px`;
        draggedEl.style.display = 'flex';
        draggedEl.style.alignItems = 'center';
        draggedEl.style.justifyContent = 'center';
        draggedEl.style.fontSize = `${24 * zoomLevel}px`;

        document.body.appendChild(draggedEl);

        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);

        // Use requestAnimationFrame for smoother updates
        let rafId: number;
        const handleDragMove = (moveEvent: DragEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const y = moveEvent.clientY - (baseSize * zoomLevel / 2);
                draggedEl.style.transform = `translateY(${y}px)`;
            });
        };

        document.addEventListener('dragover', handleDragMove);
        document.addEventListener('dragend', () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener('dragover', handleDragMove);
            document.body.removeChild(draggedEl);
        }, { once: true });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetRow: number, targetCol: number) => {
        if (!draggedLetter || gameWon) return;

        const { row: sourceRow, col: sourceCol } = draggedLetter;

        // Vérifier que c'est dans la même colonne
        if (sourceCol !== targetCol || sourceRow === targetRow) {
            setDraggedLetter(null);
            return;
        }

        const newMoves = moves + 1;
        setMoves(newMoves);

        // Échanger les lettres
        const newWords = [...words];
        const word1 = newWords[sourceRow].currentWord;
        const word2 = newWords[targetRow].currentWord;

        const word1Array = word1.split('');
        const word2Array = word2.split('');
        [word1Array[sourceCol], word2Array[sourceCol]] = [word2Array[sourceCol], word1Array[sourceCol]];

        newWords[sourceRow].currentWord = word1Array.join('');
        newWords[targetRow].currentWord = word2Array.join('');

        // Vérifier si les mots sont valides
        newWords.forEach(wordObj => {
            wordObj.isValid = isValidWord(wordObj.currentWord);
        });

        setWords(newWords);
        setDraggedLetter(null);

        // Vérifier si le jeu est gagné
        const currentWords = newWords.map(word => word.currentWord).sort();
        const originalWords = newWords.map(word => word.originalWord).sort();
        const isWon = currentWords.every((word, index) => word === originalWords[index]);
        
        if (isWon) {
            setGameWon(true);
            onGameEnd(true, newMoves);
        }
    };

    const handleLineDragStart = (e: React.DragEvent, row: number) => {
        setDraggedLine({ row });
        
         // Get the original row element
        const originalRow = e.currentTarget.parentElement;
        if (!originalRow) return;
        
        // Find the letter grid element (the second child of the row)
        const letterGrid = originalRow.children[1];
        if (!letterGrid) return;
        
        // Get both the row and grid positions
        const originalRect = originalRow.getBoundingClientRect();
        const letterGridRect = letterGrid.getBoundingClientRect();
        
        // Create clone of the entire row
        const draggedEl = originalRow.cloneNode(true) as HTMLElement;
        draggedEl.style.position = 'fixed';
        // Position the clone exactly where the original row is
        draggedEl.style.left = `${originalRect.left}px`;
        draggedEl.style.transformOrigin = 'left center';
        draggedEl.style.transform = `translateY(0)`;
        draggedEl.style.top = '0';
        draggedEl.style.width = `${originalRect.width}px`;
        draggedEl.style.pointerEvents = 'none';
        draggedEl.style.opacity = '0.8';
        draggedEl.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        draggedEl.style.willChange = 'transform';
        draggedEl.style.transition = 'none';
        draggedEl.style.zIndex = '1000';
        
        
        document.body.appendChild(draggedEl);

        // Hide the default drag image
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);

        // Use requestAnimationFrame for smooth movement
        let rafId: number;
        const handleDragMove = (moveEvent: DragEvent) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const y = moveEvent.clientY - (originalRow.offsetHeight / 2);
                draggedEl.style.transform = `translateY(${y}px) scale(${zoomLevel})`;
            });
        };

        document.addEventListener('dragover', handleDragMove);
        document.addEventListener('dragend', () => {
            cancelAnimationFrame(rafId);
            document.removeEventListener('dragover', handleDragMove);
            document.body.removeChild(draggedEl);
            setDropTargetRow(null);  // Reset drop target when drag ends
        }, { once: true });
    };

    const handleLineDrop = (targetRow: number) => {
        if (!draggedLine || gameWon) return;

        const { row: sourceRow } = draggedLine;

        if (sourceRow === targetRow) {
            setDraggedLine(null);
            return;
        }

        const newMoves = moves + 1;
        setMoves(newMoves);

        // Swap entire words
        const newWords = [...words];
        [newWords[sourceRow], newWords[targetRow]] = [newWords[targetRow], newWords[sourceRow]];

        // Update validity
        newWords.forEach(wordObj => {
            wordObj.isValid = isValidWord(wordObj.currentWord);
        });

        setWords(newWords);
        setDraggedLine(null);

        // Check win condition
        const currentWords = newWords.map(word => word.currentWord).sort();
        const originalWords = newWords.map(word => word.originalWord).sort();
        const isWon = currentWords.every((word, index) => word === originalWords[index]);
        
        if (isWon) {
            setGameWon(true);
            onGameEnd(true, newMoves);
        }
    };

    // Expose resetGame method through ref
    useImperativeHandle(ref, () => ({
      resetGame: () => {
        startNewGame();
      }
    }));

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-4xl font-bold mb-4 text-black dark:text-white">Jackpot</h1>
            
            {/* Word count selection */}
            <div className="flex flex-col items-center mb-4 bg-green-100 dark:bg-green-900/20 p-4 rounded-lg shadow-md">
                <p className="text-black dark:text-white mb-2">Nombre de mots à trouver :</p>
                <div className="flex gap-4">
                    {[3, 4, 5].map((count) => (
                        <label key={count} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="wordCount"
                                value={count}
                                checked={wordCount === count}
                                onChange={(e) => setWordCount(Number(e.target.value))}
                                className="form-radio text-blue-500"
                            />
                            <span className="text-black dark:text-white">{count}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Update the grid to use dynamic rows based on wordCount */}
            <div className={`grid gap-1`} style={{ gridTemplateRows: `repeat(${wordCount}, minmax(0, 1fr))` }}>
                {words.map((wordObj, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2">
                        <div
                            className={`w-6 h-14 bg-gray-200 dark:bg-gray-700 rounded-md cursor-move flex items-center justify-center
                                ${dropTargetRow === rowIndex ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/40' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleLineDragStart(e, rowIndex)}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDropTargetRow(rowIndex);
                            }}
                            onDragLeave={() => setDropTargetRow(null)}
                            onDrop={() => {
                                handleLineDrop(rowIndex);
                                setDropTargetRow(null);
                            }}
                        >
                            ⋮⋮
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1">
                            {wordObj.currentWord.split('').map((letter, colIndex) => {
                                let className = 'w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-all duration-300 rounded-md cursor-move';
                                
                                if (wordObj.isValid) {
                                    className += ' bg-green-500 text-white border-green-500';
                                } else {
                                    className += ' bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600';
                                    if (draggedLetter?.row === rowIndex && draggedLetter?.col === colIndex) {
                                        className += ' opacity-50';
                                    }
                                }

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={className}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(rowIndex, colIndex)}
                                    >
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {gameWon && (
                <div className="text-2xl font-bold text-green-500 dark:text-green-400 mt-4">
                    Félicitations ! Vous avez gagné !
                </div>
            )}
            <button 
                onClick={startNewGame}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                Nouvelle partie
            </button>
        </div>
    );
}); 