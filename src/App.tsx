import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WORDS_ALL } from './WORDS_ODS9_5';
import { WORDS_WORDLE} from './WORDS5';
import GameBoard from './components/WordleGameBoard';
import Keyboard from './components/Keyboard';
import Header from './components/Header';
import Modal from './components/Modal';
import HashtagGame from './components/HashtagGame';
import { JackpotGame } from './components/JackpotGame';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  totalMovesToWin: number;
}

interface AllGameStats {
  wordle: GameStats;
  hashtag: GameStats;
  jackpot: GameStats;
}

// Définir un type pour les jeux possibles
type GameType = 'wordle' | 'hashtag' | 'jackpot';

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
  const [currentGame, setCurrentGame] = useState(() => {
    const savedGame = localStorage.getItem('currentGame');
    return savedGame || 'wordle';
  });
  const [isHashtagHelpModalOpen, setIsHashtagHelpModalOpen] = useState(false);
  const [isJackpotHelpModalOpen, setIsJackpotHelpModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('zoomLevel');
    return savedZoom ? parseFloat(savedZoom) : 1;
  });
  const hashtagGameRef = useRef<{ resetGame: () => void }>(null);
  const [gameStats, setGameStats] = useState<AllGameStats>(() => {
    const savedStats = localStorage.getItem('gameStats');
    return savedStats ? JSON.parse(savedStats) : {
      wordle: {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalMovesToWin: 0
      },
      hashtag: {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalMovesToWin: 0
      },
      jackpot: {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalMovesToWin: 0
      }
    };
  });
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  useEffect(() => {
    if (currentGame === 'wordle') {
      setTargetWord(WORDS_WORDLE[Math.floor(Math.random() * WORDS_WORDLE.length)]);
    }
  }, [currentGame]);

  const resetGame = () => {
    if (currentGame === 'wordle') {
      setTargetWord(WORDS_WORDLE[Math.floor(Math.random() * WORDS_WORDLE.length)]);
      setGuesses([]);
      setCurrentGuess('');
      setGameOver(false);
      setMessage('');
      setMessageType('');
      setUsedLetters({});
      setCursorPosition(0);
      setInvalidGuess(false);
    } else if (currentGame === 'hashtag') {
      hashtagGameRef.current?.resetGame();
    }
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
        updateGameStats('wordle', true, guesses.length + 1);
      } else if (newGuesses.length === 6) {
        setMessage(`Partie terminée. Le mot était ${targetWord}`);
        setMessageType('error');
        setGameOver(true);
        updateGameStats('wordle', false, 6);
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
      // Prevent the using of the arrow keys to move the whole page
      event.preventDefault();
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
      const clampedZoom = Math.min(Math.max(newZoom, 0.75), 2);
      localStorage.setItem('zoomLevel', clampedZoom.toString());
      return clampedZoom;
    });
  };

  // Add a new handler for tile clicks
  const handleTileClick = (position: number) => {
    if (!gameOver) {
      setCursorPosition(position);
    }
  };

  useEffect(() => {
    localStorage.setItem('currentGame', currentGame);
  }, [currentGame]);

  const updateGameStats = (gameType: 'wordle' | 'hashtag' | 'jackpot', won: boolean, moves: number) => {
    setGameStats(prevStats => {
      const gameStats = prevStats[gameType];
      const newStats = {
        ...gameStats,
        gamesPlayed: gameStats.gamesPlayed + 1,
        gamesWon: won ? gameStats.gamesWon + 1 : gameStats.gamesWon,
        currentStreak: won ? gameStats.currentStreak + 1 : 0,
        bestStreak: won ? Math.max(gameStats.currentStreak + 1, gameStats.bestStreak) : gameStats.bestStreak,
        totalMovesToWin: won ? gameStats.totalMovesToWin + moves : gameStats.totalMovesToWin
      };
      
      const newAllStats = {
        ...prevStats,
        [gameType]: newStats
      };
      
      localStorage.setItem('gameStats', JSON.stringify(newAllStats));
      return newAllStats;
    });
  };

  // Modifier la signature de renderGameStats
  const renderGameStats = (gameType: GameType) => {
    const stats = gameStats[gameType];  // Maintenant TypeScript sait que gameType est une clé valide
    const averageMoves = stats.gamesWon > 0 
      ? (stats.totalMovesToWin / stats.gamesWon).toFixed(1) 
      : '-';

    return (
      <div className="mt-4 p-4 bg-green-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-2 dark:text-white">Statistiques</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="font-bold dark:text-white">Taux de victoire : {((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)}% <div className="dark:text-white">pour {stats.gamesPlayed} parties jouées</div></div>
          <div className="dark:text-white">Moyenne de coups par victoire : {averageMoves}</div>
          <div className="dark:text-white">Série en cours : {stats.currentStreak}</div>
          <div className="dark:text-white">Meilleure série : {stats.bestStreak}</div>
        </div>
      </div>
    );
  };

  // Add resetGameStats function
  const resetGameStats = (gameType: 'wordle' | 'hashtag' | 'jackpot') => {
    setGameStats(prevStats => {
      const newStats = {
        ...prevStats,
        [gameType]: {
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          totalMovesToWin: 0
        }
      };
      localStorage.setItem('gameStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        onHelpClick={() => {
          switch (currentGame) {
            case 'wordle':
              setIsHelpModalOpen(true);
              break;
            case 'hashtag':
              setIsHashtagHelpModalOpen(true);
              break;
            case 'jackpot':
              setIsJackpotHelpModalOpen(true);
              break;
          }
        }}
        onStatsClick={() => setIsStatsModalOpen(true)}
        currentGame={currentGame}
        onGameSelect={setCurrentGame}
        onZoomIn={() => handleZoom('in')}
        onZoomOut={() => handleZoom('out')}
        canZoomIn={zoomLevel < 2}
        canZoomOut={zoomLevel > 0.75}
        onNewGame={resetGame}
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
              title="Comment jouer à Wordle"
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
            {!gameOver && message && (
              <div className={`mt-4 mb-4 p-2 rounded font-bold ${
                messageType === 'success' ? 'bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-900' :
                messageType === 'error' ? 'bg-red-200 dark:bg-red-400 text-red-800 dark:text-red-900' :
                messageType === 'warning' ? 'bg-yellow-200 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-900' :
                'bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-900'
              }`}>
                {message}
              </div>
            )}
            {gameOver && (
              <>
                <div className={`mt-4 mb-4 p-2 rounded font-bold ${
                  messageType === 'success' ? 'bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-900' :
                  messageType === 'error' ? 'bg-red-200 dark:bg-red-400 text-red-800 dark:text-red-900' :
                  'bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-900'
                }`}>
                  {message}
                </div>
                {renderGameStats('wordle')}
                <button
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  onClick={resetGame}
                >
                  Nouvelle partie
                </button>
              </>
            )}
            <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
          </>
        ) : (
          <>
            {currentGame === 'hashtag' ? (
              <HashtagGame ref={hashtagGameRef} zoomLevel={zoomLevel} onGameEnd={(won, moves) => updateGameStats('hashtag', won, moves)} renderGameStats={renderGameStats} />
            ) : (
              <JackpotGame 
                onGameEnd={(won, moves) => updateGameStats('jackpot', won, moves)}
                renderGameStats={renderGameStats}
                zoomLevel={zoomLevel}
              />
            )}
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
                      <span className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm mr-2"></span>
                      Gris : La lettre n'est pas dans le mot
                    </li>
                    <li>Si la lettre est à l'intersection de 2 mots, cela signifie que la lettre n'est dans aucun des 2.</li>

                  </ul>
                <p>Pour gagner vous disposez de 12 coups pour placer toutes les lettres à la bonne place.</p>
                <p>Bonne chance !</p>

              </div>
            </Modal>
            <Modal
              isOpen={isJackpotHelpModalOpen}
              onClose={() => setIsJackpotHelpModalOpen(false)}
              title="Comment jouer au Jackpot"
            >
              <div className="space-y-4">
                <p>Trouvez trois mots de 5 lettres, un mot par ligne en sachant que les lettres ont été mélangées VERTICALEMENT.</p>
                <p>Utilisez la souris pour échanger 2 lettres d'une même colonne</p>
                <p> Lorsqu'un mot du dictionnaire du jeu est reconstitué, ses cases prennent la couleur verte. Mais attention, cela ne veut pas dire que ce mot fait partie des mots à trouver.</p>
              </div>
            </Modal>
          </>
        )}
      </div>
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title={currentGame.toUpperCase()}
      >
        <div>
          {renderGameStats(currentGame as GameType)}
          <button
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les statistiques ?')) {
                resetGameStats(currentGame as GameType);
              }
            }}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Réinitialiser les statistiques
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
