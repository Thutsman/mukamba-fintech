/**
 * Utility functions for shuffling properties with a time-based seed
 * that changes every 2 hours, ensuring all users see the same order
 * within each 2-hour window.
 */

/**
 * Get the current 2-hour period number
 * This increments every 2 hours (7200000 ms)
 */
export function getCurrentPeriod(): number {
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  return Math.floor(now / TWO_HOURS_MS);
}

/**
 * Simple seeded random number generator
 * Uses a seed to generate deterministic pseudo-random numbers
 */
function seededRandom(seed: number): () => number {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm with a seed
 * This ensures deterministic shuffling based on the seed
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle properties based on the current 2-hour period
 * This will produce the same order for all users within the same 2-hour window
 * and automatically change every 2 hours
 */
export function shufflePropertiesByPeriod<T>(properties: T[]): T[] {
  if (properties.length === 0) {
    return properties;
  }
  
  const period = getCurrentPeriod();
  
  // Use the period as the seed, combined with a base seed for consistency
  // We multiply by a large prime to ensure different periods produce different orders
  const seed = period * 7919 + 1009;
  
  return seededShuffle(properties, seed);
}

/**
 * Get the time remaining until the next shuffle (in milliseconds)
 * Useful for debugging or displaying when the order will change
 */
export function getTimeUntilNextShuffle(): number {
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  const currentPeriod = Math.floor(now / TWO_HOURS_MS);
  const nextPeriodStart = (currentPeriod + 1) * TWO_HOURS_MS;
  return nextPeriodStart - now;
}

