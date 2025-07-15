const WORD_CATEGORIES = {
  ENVIRONMENTS: [
    'forest', 'mountain', 'river', 'lake', 'ocean', 'meadow',
    'valley', 'glacier', 'spring', 'desert', 'canyon', 'plateau',
    'prairie', 'coast', 'cliff', 'waterfall'
  ],
  FLORA: [
    'tree', 'flower', 'leaf', 'grass', 'moss', 'fern',
    'bamboo', 'willow', 'cedar', 'oak', 'maple',
    'pine', 'birch', 'elm', 'sycamore', 'willow',
    'cedar', 'oak', 'maple', 'pine', 'birch', 'elm',
    'sycamore', 'willow', 'cedar', 'oak', 'maple',
    'pine', 'birch', 'elm', 'sycamore', 'willow',
    'cedar', 'oak', 'maple', 'pine', 'birch', 'elm',
    'sycamore', 'willow', 'cedar', 'oak', 'maple'
  ],
  WATER: [
    'tide', 'current', 'ripple', 'cascade'
  ],
  LIGHT: [
    'glow', 'shimmer', 'sparkle', 'glimmer', 'radiance',
    'shine', 'dusk', 'dawn', 'twilight', 'penumbra',
    'glare', 'moonlight', 'glint'
  ]
};

const WORDS = Object.values(WORD_CATEGORIES).flat();



