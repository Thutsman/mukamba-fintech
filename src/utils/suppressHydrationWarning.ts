import React, { useEffect, useState } from 'react';

/**
 * Hook to suppress hydration warnings for components that might have
 * browser extension interference (like fdprocessedid attributes)
 */
export function useSuppressHydrationWarning() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * HOC to wrap components that might have hydration issues
 */
export function withHydrationSuppression<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function HydrationSuppressedComponent(props: P): React.ReactElement {
    const isClient = useSuppressHydrationWarning();

    if (!isClient) {
      // Return a skeleton or loading state during SSR
      return React.createElement('div', { className: 'animate-pulse' },
        React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-3/4 mb-2' }),
        React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-1/2' })
      );
    }

    return React.createElement(Component, props);
  };
}
