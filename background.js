// Store dynamic rules IDs
let ruleIdCounter = 1;
const RULE_ID_MAP = new Map();

// Handle extension icon click - open options page
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Initialize rules on startup
chrome.runtime.onInstalled.addListener(() => {
  updateRules();
});

// Update rules when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.protectedUrls) {
    updateRules();
  }
});

// Update declarative net request rules based on protected URLs
async function updateRules() {
  try {
    // Get current protected URLs
    const result = await chrome.storage.sync.get(['protectedUrls']);
    const protectedUrls = result.protectedUrls || [];
    
    // Remove all existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(rule => rule.id);
    
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: removeRuleIds
      });
    }
    
    // Clear the map
    RULE_ID_MAP.clear();
    ruleIdCounter = 1;
    
    // Create new rules for each protected URL pattern
    const addRules = [];
    
    for (const pattern of protectedUrls) {
      const ruleId = ruleIdCounter++;
      RULE_ID_MAP.set(pattern, ruleId);
      
      // Convert simple wildcards to proper URL filter format
      let urlFilter = pattern;
      // Escape special regex characters except * and |
      urlFilter = urlFilter.replace(/[.+?^${}()[\]\\]/g, '\\$&');
      // Convert * to .*
      urlFilter = urlFilter.replace(/\*/g, '*');
      
      // Ensure the pattern matches as expected
      if (!urlFilter.includes('://')) {
        // If no protocol, match both http and https
        urlFilter = '*://' + urlFilter;
      }
      
      const rule = {
        id: ruleId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/interstitial.html',
            transform: {
              queryTransform: {
                addOrReplaceParams: [
                  {
                    key: 'url',
                    value: '\\0'  // This will be replaced with the actual URL
                  }
                ]
              }
            }
          }
        },
        condition: {
          urlFilter: urlFilter,
          resourceTypes: ['main_frame']
        }
      };
      
      addRules.push(rule);
    }
    
    // Add all rules at once
    if (addRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: addRules
      });
    }
    
    console.log(`Updated ${addRules.length} redirect rules`);
    
  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

// Use webNavigation to capture the original URL and redirect properly
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only process main frame navigations
  if (details.frameId !== 0) return;
  
  // Skip if we're navigating FROM our interstitial page
  if (details.url.includes(chrome.runtime.getURL('interstitial.html'))) {
    console.log('[Blank Extension] Skipping interstitial page navigation');
    return;
  }
  
  // Get the tab info to check if we're navigating FROM the interstitial
  try {
    const tab = await chrome.tabs.get(details.tabId);
    if (tab.url && tab.url.includes(chrome.runtime.getURL('interstitial.html'))) {
      console.log('[Blank Extension] Navigating from interstitial, allowing redirect');
      return;
    }
  } catch (e) {
    // Tab might not exist yet, continue checking
  }
  
  const result = await chrome.storage.sync.get(['protectedUrls']);
  const protectedUrls = result.protectedUrls || [];
  
  const isProtected = protectedUrls.some(pattern => {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(details.url);
    } catch (e) {
      return details.url.includes(pattern);
    }
  });
  
  if (isProtected) {
    console.log('[Blank Extension] Redirecting to interstitial for:', details.url);
    // Redirect to interstitial with the original URL as a parameter
    const interstitialUrl = chrome.runtime.getURL('interstitial.html') + 
                          '?url=' + encodeURIComponent(details.url);
    
    chrome.tabs.update(details.tabId, { url: interstitialUrl });
  }
}); 