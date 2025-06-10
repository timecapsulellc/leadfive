// PerformanceMonitor.jsx - Simple performance monitoring for development
import { useEffect, useRef } from 'react';

const PerformanceMonitor = ({ componentName }) => {
  const renderTimeRef = useRef();
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const startTime = performance.now();
    renderTimeRef.current = startTime;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - renderTimeRef.current;
      
      // Only log in development mode
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (Render #${renderCountRef.current})`);
      }
    };
  });

  // Log component mounting in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 ${componentName} mounted`);
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`👋 ${componentName} unmounted after ${renderCountRef.current} renders`);
      }
    };
  }, [componentName]);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
