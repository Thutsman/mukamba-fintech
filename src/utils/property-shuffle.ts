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
 * Enhanced seeded random number generator using Linear Congruential Generator (LCG)
 * with better distribution properties for more aggressive shuffling
 */
function seededRandom(seed: number): () => number {
  // Use a larger modulus and better constants for better randomness
  let currentSeed = seed;
  const a = 1664525; // Multiplier
  const c = 1013904223; // Increment
  const m = Math.pow(2, 32); // Modulus (2^32)
  
  return function() {
    currentSeed = (currentSeed * a + c) % m;
    return currentSeed / m;
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm with a seed
 * This ensures deterministic shuffling based on the seed
 * Uses multiple passes for more aggressive randomization
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  if (array.length <= 1) {
    return [...array];
  }
  
  const shuffled = [...array];
  const random = seededRandom(seed);
  
  // Perform Fisher-Yates shuffle - standard pass
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index from 0 to i (inclusive)
    const j = Math.floor(random() * (i + 1));
    // Swap elements
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Additional pass for more aggressive shuffling - reverse direction
  // This helps ensure properties that were near the end can move to the front
  for (let i = 0; i < shuffled.length - 1; i++) {
    const j = Math.floor(random() * (shuffled.length - i)) + i;
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
  
  // Create a more varied seed by combining period with additional factors
  // This ensures each period produces a completely different shuffle
  // Using multiple large primes and bit operations for better distribution
  const baseSeed = period * 7919; // Large prime multiplier
  const variationSeed = (period % 1000) * 1009; // Additional variation
  const lengthSeed = properties.length * 9973; // Include array length for variation
  
  // Combine seeds using bitwise XOR and addition for better mixing
  // Note: We don't use Date.now() here to keep it deterministic within the same period
  const seed = (baseSeed ^ variationSeed) + lengthSeed;
  
  // Ensure seed is positive and within reasonable range
  const finalSeed = Math.abs(seed) % 2147483647; // Max 32-bit integer
  
  // Debug log (can be removed in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Property Shuffle] Period: ${period}, Seed: ${finalSeed}, Properties: ${properties.length}`);
  }
  
  return seededShuffle(properties, finalSeed);
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

