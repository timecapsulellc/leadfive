/**
 * Memory monitoring hook for development
 * Helps detect memory leaks and performance issues
 */

import { useEffect, useRef } from 'react';

export const useMemoryMonitor = (
  componentName,
  enabled = process.env.NODE_ENV === 'development'
) => {
  const intervalRef = useRef(null);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled || !window.performance?.memory) {
      return;
    }

    console.log(
      `🔍 [${componentName}] Component mounted - Starting memory monitoring`
    );

    intervalRef.current = setInterval(() => {
      const memory = window.performance.memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;

      // Only warn if memory usage is above 95% to reduce noise
      if (memoryUsage > 0.95) {
        console.warn(
          `⚠️ [${componentName}] Critical memory usage: ${(memoryUsage * 100).toFixed(1)}%`
        );
        console.log('Memory details:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB`,
        });
      }
    }, 60000); // Check every 60 seconds instead of 30

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const uptime = Date.now() - mountTimeRef.current;
      console.log(
        `🔄 [${componentName}] Component unmounted after ${uptime}ms`
      );
    };
  }, [componentName, enabled]);

  // Return memory stats for debugging
  return {
    getMemoryStats: () => {
      if (window.performance?.memory) {
        const memory = window.performance.memory;
        return {
          usage: memory.usedJSHeapSize / memory.totalJSHeapSize,
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
      }
      return null;
    },
  };
};

export default useMemoryMonitor;
