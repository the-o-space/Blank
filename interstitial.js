// Get the original URL from the query parameter
const params = new URLSearchParams(window.location.search);
const originalUrl = params.get('url');

let selectedWords = [];
let currentColor = '';
let isCompleted = false; 


const PASTEL_COLORS = [
  '#FF9B85', '#FF7B92', '#FF6B6B', '#95E6A1', '#A8E88A',
  '#FFB3D9', '#B19AEA', '#8CE5C7', '#FFB08C', '#C5E898',
  '#8AD3FF', '#A996FF', '#FFB8F5', '#FF8BDC', '#FF7ACF',
  '#C99EEC', '#9A7FFD', '#AFA4F0', '#8DDFC2', '#BE9EFF'
];

// Initialize the page
initializePage();

function initializePage() {
  console.log('[Blank Extension] Original URL:', originalUrl);
  
  // Select random words and color
  selectedWords = getRandomWords(3);
  currentColor = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  
  console.log('[Blank Extension] Selected words:', selectedWords);
  
  // Apply styles
  document.getElementById('dynamicStyles').textContent = getMindfulStyles(currentColor);
  
  // Render words
  renderMindfulWords();
  
  // Setup keyboard listener
  setupKeyboardListener();
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
    }
    .mindful-words {
      display: flex;
      flex-direction: row;
      gap: 3rem;
      font-size: 3rem;
      font-weight: 600;
    }
    .mindful-word {
      display: flex;
      gap: 0.1em;
      letter-spacing: 0.05em;
    }
    .mindful-letter {
      color: #d0d0d0;
      transition: color 0.3s ease;
    }
    .mindful-letter.active {
      color: ${color};
    }
  `;
}

function renderMindfulWords() {
  const wordsContainer = document.getElementById('mindfulWords');
  wordsContainer.innerHTML = '';
  
  selectedWords.forEach((word, index) => {
    const wordElement = document.createElement('div');
    wordElement.className = 'mindful-word';
    wordElement.dataset.word = word;
    wordElement.dataset.index = index;
    
    [...word].forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.className = 'mindful-letter';
      wordElement.appendChild(span);
    });
    
    wordsContainer.appendChild(wordElement);
  });
}

function getRandomWords(count) {
  const shuffled = [...CALMING_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function setupKeyboardListener() {
  let currentWordIndex = 0;
  let currentLetterIndex = 0;
  let typedWords = ['', '', ''];

  const handleKeyPress = (e) => {
    // Don't process if already completed
    if (isCompleted) return;
    
    // Only handle typing if our mindful page is present
    const container = document.getElementById('mindfulWords');
    if (!container) {
      return;
    }
    
    if ([
      'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp',
      'Tab', 'Escape', 'Enter', 'F5', 'F12'
    ].includes(e.key)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const words = document.querySelectorAll('.mindful-word');
    if (!words || words.length === 0) {
      return;
    }
    
    const currentWord = words[currentWordIndex];
    const targetWord = selectedWords[currentWordIndex];
    const letters = currentWord.querySelectorAll('.mindful-letter');
    
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
        
        if (currentLetterIndex === targetWord.length && currentWordIndex < 2) {
          currentWordIndex++;
          currentLetterIndex = 0;
        } else if (currentLetterIndex === targetWord.length && currentWordIndex === 2) {
          // Check if all words match (case insensitive)
          const allCorrect = typedWords.every((typed, i) => 
            typed.toLowerCase() === selectedWords[i].toLowerCase()
          );
          if (allCorrect) {
            console.log('[Blank Extension] All words typed correctly!');
            completeTyping();
          }
        }
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyPress, true);
}

function completeTyping() {
  // Prevent multiple calls
  if (isCompleted) return;
  isCompleted = true;
  
  console.log('[Blank Extension] Completing typing, redirecting to:', originalUrl);
  
  // Navigate to the original URL
  if (originalUrl) {
    // Use replace to prevent going back to the interstitial page
    window.location.replace(originalUrl);
  } else {
    console.error('[Blank Extension] No original URL to redirect to!');
  }
} 