# Mindful Browse

A Chrome extension that promotes mindful web browsing by requiring users to type three calming words before accessing selected websites.

## Features

- **Mindful Intervention**: When visiting protected URLs, a milk-white overlay appears with three random calming words
- **Elegant Typography**: Words fill with a random pastel color as you type them correctly
- **Minimal Design**: Clean, distraction-free interface with no unnecessary elements
- **Customizable Protection**: Add any website URL pattern through the settings page
- **Wildcard Support**: Use `*` to match URL patterns (e.g., `*youtube.com*`)

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and active

## Usage

1. Click the extension icon to open the settings page
2. Add URLs you want to protect (e.g., `youtube.com`, `*reddit.com*`, `twitter.com/home`)
3. When you visit a protected URL, you'll see three calming words
4. Type each word correctly to access the site
5. The words will fill with a pastel color as you type

## Architecture

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker for URL monitoring
├── content.js            # Overlay logic and word validation
├── words.js              # Hardcoded list of calming words
├── style.css             # Overlay styling
├── options.html          # Settings page UI
├── options.js            # Settings page functionality
└── README.md            # Project documentation
```

## Word List

The extension includes 50 calming words related to nature, peace, and tranquility:
- Nature: ocean, forest, mountain, river, sunset, etc.
- Elements: breeze, rain, mist, dew, etc.
- States: calm, serene, peaceful, gentle, etc.

## Technical Details

- **Manifest V3**: Uses the latest Chrome extension architecture
- **Storage**: Chrome sync storage for cross-device URL synchronization
- **Performance**: Lightweight content script injection only on protected URLs
- **Accessibility**: Responsive design works on all screen sizes

## Privacy

This extension:
- Does not collect any user data
- Stores URL patterns locally in Chrome sync storage
- Does not communicate with external servers
- Has minimal permissions (storage, tabs, activeTab)

## License

MIT License - feel free to modify and distribute as needed. 