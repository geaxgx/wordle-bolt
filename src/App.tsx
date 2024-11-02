import React, { useState, useEffect, useCallback } from 'react';
import { WORDS_ALL } from './WORDS_ODS9_5';
import { WORDS_WORDLE, WORDS_HASHTAG } from './WORDS5';
import GameBoard from './components/WordleGameBoard';
import Keyboard from './components/Keyboard';
import Header from './components/Header';
import Modal from './components/Modal';
import HashtagGame from './components/HashtagGame';

const App: React.FC = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | ''>('');
  const [usedLetters, setUsedLetters] = useState<Record<string, string>>({});
  const [cursorPosition, setCursorPosition] = useState(0);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState('wordle');
  const [isHashtagHelpModalOpen, setIsHashtagHelpModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setTargetWord(WORDS_WORDLE[Math.floor(Math.random() * WORDS_WORDLE.length)]);
  }, []);

  const resetGame = () => {
    setTargetWord(WORDS_WORDLE[Math.floor(Math.random() * WORDS_WORDLE.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setMessage('');
    setMessageType('');
    setUsedLetters({});
    setCursorPosition(0);
    setInvalidGuess(false);
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'BACK') {
      if (cursorPosition > 0) {
        const newGuess = currentGuess.slice(0, cursorPosition - 1) + currentGuess.slice(cursorPosition);
        setCurrentGuess(newGuess);
        setCursorPosition(prev => prev - 1);
      }
    } else if (key === 'LEFT') {
      setCursorPosition(prev => Math.max(0, prev - 1));
    } else if (key === 'RIGHT') {
      setCursorPosition(prev => Math.min(4, prev + 1));
    } else if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Le mot doit contenir 5 lettres');
        setMessageType('error');
        setInvalidGuess(true);
        setTimeout(() => {
          setInvalidGuess(false);
          setMessage('');
        }, 1000);
        return;
      }

      if (!WORDS_ALL.includes(currentGuess)) {
        setMessage('Mot non valide');
        setMessageType('error');
        setInvalidGuess(true);
        setTimeout(() => {
          setInvalidGuess(false);
          setCurrentGuess('');
          setCursorPosition(0);
          setMessage('');
        }, 1000);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');
      setCursorPosition(0);

      // Update used letters
      const newUsedLetters = { ...usedLetters };
      for (let i = 0; i < 5; i++) {
        const letter = currentGuess[i];
        if (letter === targetWord[i]) {
          newUsedLetters[letter] = 'correct';
        } else if (targetWord.includes(letter) && newUsedLetters[letter] !== 'correct') {
          newUsedLetters[letter] = 'present';
        } else if (!targetWord.includes(letter)) {
          newUsedLetters[letter] = 'absent';
        }
      }
      setUsedLetters(newUsedLetters);

      if (currentGuess === targetWord) {
        setMessage('Félicitations ! Vous avez trouvé le mot !');
        setMessageType('success');
        setGameOver(true);
      } else if (newGuesses.length === 6) {
        setMessage(`Partie terminée. Le mot était ${targetWord}`);
        setMessageType('error');
        setGameOver(true);
      }
    } else if (/^[A-Z]$/.test(key)) {
      // Create a new guess string that's padded with spaces up to the cursor position
      let newGuess = currentGuess.padEnd(cursorPosition, ' ');
      
      // Insert the new letter at cursor position
      newGuess = newGuess.slice(0, cursorPosition) + key + newGuess.slice(cursorPosition + 1);
      
      // Remove any trailing spaces
      newGuess = newGuess.trimEnd();

      if (newGuess.length <= 5) {
        setCurrentGuess(newGuess);
        setCursorPosition(prev => Math.min(prev + 1, 4));
      }
    }
  }, [currentGuess, gameOver, cursorPosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent the event from bubbling up
      event.stopPropagation();
      
      if (event.key === 'Backspace') {
        handleKeyPress('BACK');
      } else if (event.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (event.key === 'ArrowLeft') {
        handleKeyPress('LEFT');
      } else if (event.key === 'ArrowRight') {
        handleKeyPress('RIGHT');
      } else if (/^[A-Za-z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900');
    }
  }, [isDarkMode]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.05 : prev - 0.05;
      return Math.min(Math.max(newZoom, 0.75), 2); // Clamp between 0.75 and 2
    });
  };

  // Add a new handler for tile clicks
  const handleTileClick = (position: number) => {
    if (!gameOver) {
      setCursorPosition(position);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        onHelpClick={() => currentGame === 'wordle' ? setIsHelpModalOpen(true) : setIsHashtagHelpModalOpen(true)}
        currentGame={currentGame}
        onGameSelect={setCurrentGame}
        onZoomIn={() => handleZoom('in')}
        onZoomOut={() => handleZoom('out')}
        canZoomIn={zoomLevel < 2}
        canZoomOut={zoomLevel > 0.75}
      />
      <div 
        className="flex flex-col items-center flex-grow"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
      >
        {currentGame === 'wordle' ? (
          <>
            <h1 className="text-4xl font-bold my-8 text-black dark:text-white">Wordle</h1>
            <Modal
              isOpen={isHelpModalOpen}
              onClose={() => setIsHelpModalOpen(false)}
              title="Comment jouer"
            >
              <div className="space-y-4">
                <p>Devinez le mot en 6 essais.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Chaque essai doit être un mot valide de 5 lettres.</li>
                  <li>La couleur des tuiles changera pour montrer si les lettres font partie du mot :</li>
                  <ul className="list-none pl-5 space-y-2 mt-2">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-sm mr-2"></span>
                      Vert : La lettre est dans le mot et bien placée
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-yellow-500 rounded-sm mr-2"></span>
                      Jaune : La lettre est dans le mot mais mal placée
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-gray-500 rounded-sm mr-2"></span>
                      Gris : La lettre n'est pas dans le mot
                    </li>
                  </ul>
                </ul>
              </div>
            </Modal>
            <GameBoard
              guesses={guesses}
              currentGuess={currentGuess}
              targetWord={targetWord}
              cursorPosition={cursorPosition}
              invalidGuess={invalidGuess}
              onTileClick={handleTileClick}
            />
            {message && (
              <div className={`mt-4 mb-4 p-2 rounded ${
                messageType === 'success' ? 'bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-900' :
                messageType === 'error' ? 'bg-red-200 dark:bg-red-400 text-red-800 dark:text-red-900' :
                messageType === 'warning' ? 'bg-yellow-200 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-900' :
                'bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-900'
              }`}>
                {message}
              </div>
            )}
            {gameOver && (
              <button
                className="mt-2 mb-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors"
                onClick={resetGame}
              >
                Rejouer
              </button>
            )}
            <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
          </>
        ) : (
          <>
            <HashtagGame zoomLevel={zoomLevel} />
            <Modal
              isOpen={isHashtagHelpModalOpen}
              onClose={() => setIsHashtagHelpModalOpen(false)}
              title="Comment jouer au Hashtag"
            >
              <div className="space-y-4">
                <p>Déplacez les lettres sur la grille pour découvrir les mots cachés.</p>
                <p>La couleur des tuiles changera pour montrer si les lettres font partie du mot :</p>
                  <ul className="list-none pl-5 space-y-2 mt-2">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-green-500 rounded-sm mr-2"></span>
                      Vert : La lettre est dans le mot et bien placée
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-yellow-500 rounded-sm mr-2"></span>
                      Jaune : La lettre est dans le mot mais mal placée. 
                      
                    </li>
                    <li>Si la lettre est à l'intersection de 2 mots, cela signifie que la lettre est dans au moins un des 2 mots, mais pas forcément dans les 2.</li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-gray-500 rounded-sm mr-2"></span>
                      Gris : La lettre n'est pas dans le mot
                    </li>
                  </ul>
                <p>Pour gagner vous disposez de 12 coups pour placer toutes les lettres à la bonne place.</p>
                <p>Bonne chance !</p>

              </div>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
