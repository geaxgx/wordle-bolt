import React, { useState, useEffect } from 'react';
import { findJackpotWords, isValidWord, JackpotWord } from '../jackpot_find_words';

interface DragInfo {
    row: number;
    col: number;
}

interface JackpotGameProps {
  onGameEnd: (won: boolean, moves: number) => void;
  renderGameStats: (gameType: GameType) => React.ReactNode;
  zoomLevel: number;
}

export const JackpotGame: React.FC<JackpotGameProps> = ({ onGameEnd, renderGameStats, zoomLevel }) => {
    const [words, setWords] = useState<JackpotWord[]>([]);
    const [draggedLetter, setDraggedLetter] = useState<DragInfo | null>(null);
    const [gameWon, setGameWon] = useState(false);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        setWords(findJackpotWords());
        setDraggedLetter(null);
        setGameWon(false);
        setMoves(0);
    };

    const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
        setDraggedLetter({ row, col });

        // Créer un clone de l'élément traîné
        const draggedEl = e.currentTarget.cloneNode(true) as HTMLElement;
        draggedEl.style.position = 'absolute';
        draggedEl.style.top = '0';
        draggedEl.style.left = '0';
        draggedEl.style.pointerEvents = 'none';
        
        // Définir la taille en fonction du niveau de zoom
        const baseSize = 56; // 56px = 3.5rem (w-14)
        draggedEl.style.width = `${baseSize * zoomLevel}px`;
        draggedEl.style.height = `${baseSize * zoomLevel}px`;
        draggedEl.style.display = 'flex';
        draggedEl.style.alignItems = 'center';
        draggedEl.style.justifyContent = 'center';
        draggedEl.style.fontSize = `${24 * zoomLevel}px`;

        document.body.appendChild(draggedEl);

        const offsetX = (baseSize * zoomLevel) / 2;
        const offsetY = (baseSize * zoomLevel) / 2;

        e.dataTransfer.setDragImage(draggedEl, offsetX, offsetY);

        setTimeout(() => {
            document.body.removeChild(draggedEl);
        }, 0);
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

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">Jackpot</h1>
            <div className="grid grid-rows-3 gap-1">
                {words.map((wordObj, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-5 gap-1">
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
            {renderGameStats('jackpot' as const)}
        </div>
    );
}; 