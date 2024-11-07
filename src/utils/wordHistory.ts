const MAX_HISTORY_SIZE = 50;

export const getWordHistory = (): string[] => {
  const history = localStorage.getItem('wordHistory');
  return history ? JSON.parse(history) : [];
};

export const addWordToHistory = (word: string) => {
  const history = getWordHistory();
  
  // Ajouter le nouveau mot au début
  const newHistory = [word, ...history];
  
  // Garder seulement les 50 derniers mots
  const trimmedHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
  
  localStorage.setItem('wordHistory', JSON.stringify(trimmedHistory));
};

export const isWordInHistory = (word: string): boolean => {
  const history = getWordHistory();
  return history.includes(word);
};

export const getRandomWordNotInHistory = (wordList: string[]): string => {
  const history = getWordHistory();
  let attempts = 0;
  const maxAttempts = 100; // Éviter une boucle infinie
  
  while (attempts < maxAttempts) {
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    if (!history.includes(word)) {
      return word;
    }
    attempts++;
  }
  
  // Si on ne trouve pas de mot après 100 tentatives, on prend un mot au hasard
  return wordList[Math.floor(Math.random() * wordList.length)];
}; 