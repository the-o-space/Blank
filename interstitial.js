
const params = new URLSearchParams(window.location.search);
const originalUrl = params.get('url');

let selectedWords = [];
let currentColor = '';
let isCompleted = false; 

const NUM_WORDS = typeof window.NUM_WORDS === 'number' ? window.NUM_WORDS : 3;

initializePage();

async function initializePage() {
  selectedWords = getRandomWords(NUM_WORDS);
  currentColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];

  document.getElementById('dynamicStyles').textContent = getMindfulStyles(currentColor);
  renderWords();
  setupKeyboardListener();
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
      return;
    }
  });
}

function getMindfulStyles(color) {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #f7f7f7;
      font-family: 'Segoe UI', 'Arial', sans-serif;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .column-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      justify-content: center;
      overflow: hidden;
    }
    .words {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 3rem;
      font-size: 3rem;
      font-weight: 600;
      max-width: calc(100vw - 8rem);
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      padding: 2rem;
    }
    .word {
      display: flex;
      gap: 0.1em;
      letter-spacing: 0.05em;
    }
    .letter {
      color: #d0d0d0;
      transition: color 0.3s ease;
    }
    .letter.active {
      color: ${color};
    }
  `;
}

function renderWords() {
  const wordsContainer = document.getElementById('words');
  wordsContainer.innerHTML = '';
  
  selectedWords.forEach((word, index) => {
    const wordElement = document.createElement('div');
    wordElement.className = 'word';
    wordElement.dataset.word = word;
    wordElement.dataset.index = index;
    
    [...word].forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.className = 'letter';
      wordElement.appendChild(span);
    });
    
    wordsContainer.appendChild(wordElement);
  });
}

function getRandomWords(count) {
  const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function setupKeyboardListener() {
  let currentWordIndex = 0;
  let currentLetterIndex = 0;
  let typedWords = Array(selectedWords.length).fill('');

  const handleKeyPress = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
      return;
    }

    if (isCompleted) return;
    
    const container = document.getElementById('words');
    if (!container) {
      return;
    }
    
    if ([
      'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp',
      'Tab', 'Escape', 'Enter', 'F5', 'F12'
    ].includes(e.key)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const words = document.querySelectorAll('.word');
    if (!words || words.length === 0) {
      return;
    }
    
    const currentWord = words[currentWordIndex];
    const targetWord = selectedWords[currentWordIndex];
    const letters = currentWord.querySelectorAll('.letter');
    
    if (e.key === 'Backspace') {
      if (currentLetterIndex > 0) {
        currentLetterIndex--;
        letters[currentLetterIndex].classList.remove('active');
        typedWords[currentWordIndex] = typedWords[currentWordIndex].slice(0, -1);
      } else if (currentWordIndex > 0) {
        currentWordIndex--;
        currentLetterIndex = typedWords[currentWordIndex].length;
      }
    } else if (e.key.length === 1) {
      if (currentLetterIndex < targetWord.length && e.key.toLowerCase() === targetWord[currentLetterIndex].toLowerCase()) {
        letters[currentLetterIndex].classList.add('active');
        typedWords[currentWordIndex] += e.key;
        currentLetterIndex++;
        
        if (currentLetterIndex === targetWord.length && currentWordIndex < selectedWords.length - 1) {
          currentWordIndex++;
          currentLetterIndex = 0;
        } else if (currentLetterIndex === targetWord.length && currentWordIndex === selectedWords.length - 1) {
          const allCorrect = typedWords.every((typed, i) => 
            typed.toLowerCase() === selectedWords[i].toLowerCase()
          );
          if (allCorrect) {
            completeTyping();
          }
        }
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyPress, true);
}

function completeTyping() {
  if (isCompleted) return;
  isCompleted = true;
  
  if (originalUrl) {
    window.location.replace(originalUrl);
  } else {
    console.error('No original URL to redirect to!');
  }
} 