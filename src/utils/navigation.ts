import { useRouter } from 'next/navigation';

/**
 * Utility function to navigate to a page and scroll to the top
 * @param router - Next.js router instance
 * @param path - Path to navigate to
 * @param scrollBehavior - Scroll behavior ('smooth' | 'instant' | 'auto')
 */
export const navigateWithScrollToTop = (
  router: ReturnType<typeof useRouter>,
  path: string,
  scrollBehavior: 'smooth' | 'instant' | 'auto' = 'smooth'
) => {
  // Navigate to the path
  router.push(path);
  
  // Scroll to top after a brief delay to ensure navigation has started
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }
  }, 100);
};

/**
 * Utility function to navigate back and scroll to top
 * @param router - Next.js router instance
 * @param fallbackPath - Fallback path if history.back() fails
 * @param scrollBehavior - Scroll behavior ('smooth' | 'instant' | 'auto')
 */
export const navigateBackWithScrollToTop = (
  router: ReturnType<typeof useRouter>,
  fallbackPath: string = '/',
  scrollBehavior: 'smooth' | 'instant' | 'auto' = 'smooth'
) => {
  try {
    // Check if we can go back in history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      // Try native browser back first (works better on mobile)
      window.history.back();
    } else {
      // Fallback to Next.js router
      router.back();
    }
    
    // Scroll to top after navigation
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: scrollBehavior });
      }
    }, 100);
  } catch (error) {
    console.error('Navigation error:', error);
    // Ultimate fallback to home page with scroll to top
    navigateWithScrollToTop(router, fallbackPath, scrollBehavior);
  }
};

/**
 * Utility function to scroll to top of current page
 * @param scrollBehavior - Scroll behavior ('smooth' | 'instant' | 'auto')
 */
export const scrollToTop = (scrollBehavior: 'smooth' | 'instant' | 'auto' = 'smooth') => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  }
};
