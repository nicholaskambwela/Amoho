const adjectives = [
  "Blue", "Quiet", "Gentle", "Soft", "Warm", "Kind", "Calm", "Brave",
  "Bright", "Peaceful", "Tender", "Sweet", "Serene", "Loyal", "Humble",
  "Hopeful", "Steady", "Pure", "Shy", "Mild", "Patient", "Honest",
  "Cozy", "Silent", "Graceful", "Noble", "Tranquil", "Faint", "Dewy",
  "Velvet", "Mellow", "Sincere", "Harmonious", "Tender", "Radiant",
  "Amber", "Ruby", "Jade", "Coral", "Sage", "Pearl", "Ivory", "Lunar"
];

const nouns = [
  "Sky", "Heart", "Wave", "Breeze", "Cloud", "Star", "River", "Forest",
  "Rain", "Sun", "Moon", "Lake", "Meadow", "Dawn", "Dusk", "Garden",
  "Petal", "Leaf", "Feather", "Stone", "Seashell", "Rainbow", "Firefly",
  "Owl", "Dove", "Deer", "Swallow", "Robin", "Willow", "Rose", "Lily",
  "Lotus", "Fern", "Blossom", "Horizon", "Compass", "Lighthouse",
  "Anchor", "Haven", "Sanctuary", "Ember", "Aurora", "Mist", "Brook",
  "Valley", "Summit", "Trail", "Cedar", "Pine", "Clover", "Orchid",
  "Violet", "Magnolia", "Cypress", "Birch", "Aspen", "Maple", "Jasmine"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(): string {
  return Math.floor(Math.random() * 99 + 1).toString();
}

export function generateAnonymousName(): string {
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const number = getRandomNumber();
  return `${adjective}${noun}${number}`;
}
