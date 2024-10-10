import React, { useState, useEffect, useCallback } from 'react';
import { WORDS } from './words';
import { WORDS_SECRET } from './words_secret';
import GameBoard from './components/GameBoard';
import Keyboard from './components/Keyboard';

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

  useEffect(() => {
    setTargetWord(WORDS_SECRET[Math.floor(Math.random() * WORDS_SECRET.length)]);
  }, []);

  const resetGame = () => {
    setTargetWord(WORDS_SECRET[Math.floor(Math.random() * WORDS_SECRET.length)]);
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
      setCurrentGuess(prev => prev.slice(0, -1));
      setCursorPosition(prev => Math.max(0, prev - 1));
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

      if (!WORDS.includes(currentGuess)) {
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
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
      setCursorPosition(prev => Math.min(4, prev + 1));
    }
  }, [currentGuess, gameOver, guesses, targetWord, usedLetters]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace') {
        handleKeyPress('BACK');
      } else if (event.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (/^[A-Za-z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Wordle</h1>
      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        targetWord={targetWord}
        cursorPosition={cursorPosition}
        invalidGuess={invalidGuess}
      />
      {message && (
        <div className={`mt-4 mb-4 p-2 rounded ${
          messageType === 'success' ? 'bg-green-200 text-green-800' :
          messageType === 'error' ? 'bg-red-200 text-red-800' :
          messageType === 'warning' ? 'bg-yellow-200 text-yellow-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      {gameOver && (
        <button
          className="mt-2 mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={resetGame}
        >
          Rejouer
        </button>
      )}
      <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
    </div>
  );
};

export default App;