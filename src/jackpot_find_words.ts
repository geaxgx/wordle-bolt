import { WORDS_WORDLE } from './WORDS5';

const LETTRES_RARES: string[] = "PGBVHFQYXJKWZ".split('');

// Vérifie si les lettres à la même position sont différentes pour les 3 mots
function areLettersDifferentAtPosition(words: string[], position: number): boolean {
    const letters = new Set(words.map(word => word[position]));
    return letters.size === words.length;
}

// Compte les lettres rares dans un ensemble de mots
function countRareLetters(words: string[]): number {
    const allLetters = words.join('').split('');
    return allLetters.filter(letter => LETTRES_RARES.includes(letter)).length;
}

//
function countMatchingElements<T>(array1: T[], array2: T[]): number {
    let count = 0;
    
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] === array2[i]) {
        count++;
      }
    }
    return count;
  }

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function findValidPermutation(array: number[], consecutivePairsLeftCount: number): [number[], number] {
    // Add maximum attempts to prevent infinite loops
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;
        const shuffledArray = shuffleArray([...array]);
        const matchingElementsCount = countMatchingElements(shuffledArray, array);
        if (matchingElementsCount === array.length) {
            continue;
        }
        if (matchingElementsCount === 1) {
            if (consecutivePairsLeftCount > 0) {
                if (Math.random() < 0.2) {
                    consecutivePairsLeftCount--;
                    return [shuffledArray, consecutivePairsLeftCount];
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else {
            return [shuffledArray, consecutivePairsLeftCount];
        }
    }
}

function replaceCharAt(str: string, index: number, replacement: string): string {
    if (index < 0 || index >= str.length) {
      throw new Error("Index out of bounds");
    }
    return str.substring(0, index) + replacement + str.substring(index + 1);
  }

// Mélange les lettres à la même position pour les 3 mots
// On ne change pas la première lettre
// On veut éviter les paires consécutives de lettres qui apparaissent dans un mot d'origine et un mot mélangé (un seul cas autorisé au maximum)
function shuffleLettersAtPosition(words: string[]): string[] {
    let shuffledWords = [...words];
    let lastLetterOfShufWordIsFromWord = Array.from({length: words.length}, (_, i) => i);

    let consecutivePairsLeftCount = words.length - 1;
    for (let position = 1; position < 5; position++) { // Pas besoin de mélanger la première lettre
        console.log("1) lastLetterOfShufWordIsFromWord:", lastLetterOfShufWordIsFromWord);    

        [lastLetterOfShufWordIsFromWord, consecutivePairsLeftCount] = findValidPermutation(lastLetterOfShufWordIsFromWord, consecutivePairsLeftCount);
        console.log("2) lastLetterOfShufWordIsFromWord:", lastLetterOfShufWordIsFromWord, "consecutivePairsLeftCount:", consecutivePairsLeftCount);    
        for (let i =0; i<words.length; i++) {
            shuffledWords[i] = replaceCharAt(shuffledWords[i], position, words[lastLetterOfShufWordIsFromWord[i]][position]);
        }
    }
    console.log("shuffledWords:", shuffledWords, "consecutivePairsLeftCount:", consecutivePairsLeftCount);
    return shuffledWords;
}

export type JackpotWord = {
    originalWord: string;
    currentWord: string;
    isValid: boolean;
};

export function findJackpotWords(wordCount: number = 3): JackpotWord[] {
    if (wordCount < 3 || wordCount > 5) {
        throw new Error("Word count must be between 3 and 5");
    }

    let validCombinationFound = false;
    let selectedWords: string[] = [];

    while (!validCombinationFound) {
        // Select wordCount words at random
        selectedWords = Array(wordCount).fill('').map(() => 
            WORDS_WORDLE[Math.floor(Math.random() * WORDS_WORDLE.length)]
        );

        // Verify words are different
        if (new Set(selectedWords).size !== wordCount) continue;

        // Verify letters are different at each position
        const differentLettersAtEachPosition = Array.from({length: 5}, (_, i) => i)
            .every(pos => areLettersDifferentAtPosition(selectedWords, pos));

        if (!differentLettersAtEachPosition) continue;

        // Verify the number of rare letters
        if (countRareLetters(selectedWords) >= wordCount) {
            validCombinationFound = true;
        }
    }
    console.log(selectedWords);

    // Mélanger les lettres à chaque position
    const shuffledWords = shuffleLettersAtPosition(selectedWords);

    return selectedWords.map((word, index) => ({
        originalWord: word,
        currentWord: shuffledWords[index],
        isValid: false
    }));
}

export function isValidWord(word: string): boolean {
    return WORDS_WORDLE.includes(word);
} 