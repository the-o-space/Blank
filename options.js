// State management
let currentSection = 0; // 0 = main, 1 = advised
let isAnimating = false;
let lastScrollTime = 0;
const scrollThrottle = 50; // ms

// Recommended websites data - positive alternatives to distracting sites
const recommendedSites = [
  {
    title: "Khan Academy",
    description: "Free online courses and educational content across various subjects",
    url: "khanacademy.org",
    icon: "🎓"
  },
  {
    title: "Coursera",
    description: "University-level courses and professional certifications",
    url: "coursera.org",
    icon: "📚"
  },
  {
    title: "Duolingo",
    description: "Learn new languages through interactive lessons",
    url: "duolingo.com",
    icon: "🌍"
  },
  {
    title: "TED Talks",
    description: "Inspiring talks from experts on technology, design, and human potential",
    url: "ted.com",
    icon: "💡"
  },
  {
    title: "Wikipedia",
    description: "Collaborative encyclopedia for learning about any topic",
    url: "wikipedia.org",
    icon: "📖"
  },
  {
    title: "Goodreads",
    description: "Discover new books and track your reading progress",
    url: "goodreads.com",
    icon: "📗"
  },
  {
    title: "Headspace",
    description: "Meditation and mindfulness exercises for mental wellbeing",
    url: "headspace.com",
    icon: "🧘"
  },
  {
    title: "Brain Pickings",
    description: "Thoughtful articles on creativity, philosophy, and human potential",
    url: "themarginalian.org",
    icon: "🧠"
  },
  {
    title: "Notion",
    description: "All-in-one workspace for notes, planning, and productivity",
    url: "notion.so",
    icon: "📝"
  },
  {
    title: "GitHub",
    description: "Collaborative platform for coding projects and open source development",
    url: "github.com",
    icon: "💻"
  },
  {
    title: "Calm",
    description: "Sleep stories, meditation, and relaxation content",
    url: "calm.com",
    icon: "🌙"
  },
  {
    title: "BBC Learning",
    description: "Quality educational content and skill-building resources",
    url: "bbc.co.uk/learning",
    icon: "🌟"
  }
];

// Load existing URLs on page load
document.addEventListener('DOMContentLoaded', () => {
  loadUrls();
  renderRecommendedSites();
  initScrollHijacking();
});

// Add event listeners for URL input
document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addUrl();
});

function initScrollHijacking() {
  const container = document.getElementById('container');
  
  // Handle wheel events (mouse scroll)
  document.addEventListener('wheel', handleScroll, { passive: false });
  
  // Handle touch events (mobile swipe)
  let startY = 0;
  let endY = 0;
  
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    endY = e.changedTouches[0].clientY;
    const deltaY = startY - endY;
    
    if (Math.abs(deltaY) > 50) { // Minimum swipe distance
      handleScroll({ deltaY, preventDefault: () => {} });
    }
  }, { passive: true });
  
  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentSection === 0) scrollToSection(1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentSection === 1) scrollToSection(0);
    }
  });
}

function handleScroll(e) {
  e.preventDefault();
  
  const now = Date.now();
  if (now - lastScrollTime < scrollThrottle || isAnimating) return;
  lastScrollTime = now;
  
  const delta = e.deltaY || e.wheelDelta || e.detail;
  
  if (delta > 0 && currentSection === 0) {
    // Scroll down from main to advised
    scrollToSection(1);
  } else if (delta < 0 && currentSection === 1) {
    // Scroll up from advised to main
    scrollToSection(0);
  }
}

function scrollToSection(sectionIndex) {
  if (isAnimating || sectionIndex === currentSection) return;
  
  isAnimating = true;
  currentSection = sectionIndex;
  
  const container = document.getElementById('container');
  const translateY = sectionIndex * -100;
  
  container.style.transform = `translateY(${translateY}vh)`;
  
  setTimeout(() => {
    isAnimating = false;
  }, 800); // Match the CSS transition duration
}

async function loadUrls() {
  const result = await chrome.storage.sync.get(['protectedUrls']);
  const urls = result.protectedUrls || [];
  renderUrls(urls);
}

function renderUrls(urls) {
  const urlList = document.getElementById('urlList');
  urlList.innerHTML = '';
  
  if (urls.length === 0) {
    urlList.innerHTML = '<li class="empty-state">No protected URLs yet. Add some websites above to get started.</li>';
    return;
  }
  
  urls.forEach((url, index) => {
    const li = document.createElement('li');
    li.className = 'url-item';
    
    const urlLink = document.createElement('a');
    urlLink.className = 'url-text';
    urlLink.textContent = url;
    // Remove wildcards for test link
    let testUrl = url.replace(/\*/g, '');
    if (!/^https?:\/\//.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }
    urlLink.href = testUrl;
    urlLink.target = '_blank';
    urlLink.rel = 'noopener noreferrer';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => removeUrl(index));
    
    li.appendChild(urlLink);
    li.appendChild(removeBtn);
    urlList.appendChild(li);
  });
}

async function addUrl() {
  const input = document.getElementById('urlInput');
  const url = input.value.trim();
  
  if (!url || !isValidUrlPattern(url)) {
    input.classList.add('input-invalid');
    setTimeout(() => input.classList.remove('input-invalid'), 600);
    return;
  }
  
  const result = await chrome.storage.sync.get(['protectedUrls']);
  const urls = result.protectedUrls || [];
  
  // Check if URL already exists
  if (urls.includes(url)) {
    input.value = '';
    return;
  }
  
  urls.push(url);
  await chrome.storage.sync.set({ protectedUrls: urls });
  
  input.value = '';
  renderUrls(urls);
}

function isValidUrlPattern(str) {
  // Accept wildcards at start/end, but must contain a valid domain with at least one dot
  const cleaned = str.replace(/^\*+|\*+$/g, ''); // Remove leading/trailing *
  if (!cleaned.includes('.')) return false;
  // Try parsing as URL
  try {
    new URL(cleaned.startsWith('http') ? cleaned : 'http://' + cleaned);
    return true;
  } catch (e) {
    return false;
  }
}

async function removeUrl(index) {
  const result = await chrome.storage.sync.get(['protectedUrls']);
  const urls = result.protectedUrls || [];
  
  urls.splice(index, 1);
  await chrome.storage.sync.set({ protectedUrls: urls });
  
  renderUrls(urls);
}

function renderRecommendedSites() {
  const advisedList = document.getElementById('advisedList');
  
  recommendedSites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'advised-item';
    
         item.innerHTML = `
       <div class="advised-title">${site.icon} ${site.title}</div>
       <div class="advised-description">${site.description}</div>
       <div class="advised-url">${site.url}</div>
       <button class="add-btn" onclick="visitRecommendedSite('${site.url}')">
         <span>→</span>
         <span>Visit Site</span>
       </button>
     `;
    
    advisedList.appendChild(item);
  });
}

function visitRecommendedSite(url) {
  // Ensure URL has proper protocol
  let fullUrl = url;
  if (!/^https?:\/\//.test(url)) {
    fullUrl = 'https://' + url;
  }
  
  // Open in new tab
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
} 