
/**
 * Utility file for performance optimizations
 */

// Debounce function to limit how often a function can be called
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Memoize function results based on input parameters
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Function to optimize images
export const optimizeImageLoading = () => {
  // Add lazy loading to all images
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

// Run performance optimizations when the page loads
export const applyPerformanceOptimizations = () => {
  // Wait for the page to fully load
  window.addEventListener('load', () => {
    // Optimize image loading
    optimizeImageLoading();
    
    // Defer non-critical JavaScript
    setTimeout(() => {
      // Any non-critical JavaScript operations can go here
    }, 100);
  });
};
