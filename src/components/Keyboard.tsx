import React from 'react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Record<string, string>;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, usedLetters }) => {
  console.log('Keyboard rendering', { usedLetters }); // Add this line for debugging

  const rows = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['BACK', 'W', 'X', 'C', 'V', 'B', 'N', 'ENTER'] // Switched 'ENTER' and 'BACK'
  ];

  const getKeyClass = (key: string) => {
    let className = 'px-2 py-3 rounded font-bold text-sm sm:text-base m-1 cursor-pointer transition-colors duration-200';
    if (key === 'ENTER' || key === 'BACK') {
      className += ' px-3 sm:px-4';
    }
    switch (usedLetters[key]) {
      case 'correct':
        return `${className} bg-green-500 text-white`;
      case 'present':
        return `${className} bg-yellow-500 text-white`;
      case 'absent':
        return `${className} bg-gray-500 text-gray-400`;
        // return `${className} bg-gray-500 text-white`;
      default:
        return `${className} bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600`;
    }
  };

  return (
    <div className="mt-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => onKeyPress(key)}
            >
              {key === 'BACK' ? <span style={{ fontSize: '2.5em', fontWeight: 'bold' }}>←</span> : key} 
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
