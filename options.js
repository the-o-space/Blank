
document.addEventListener('DOMContentLoaded', () => {
  loadUrls();
});

document.getElementById('urlInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addUrl();
});

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
  const cleaned = str.replace(/^\*+|\*+$/g, '');
  if (!cleaned.includes('.')) return false;
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