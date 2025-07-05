import React from 'react';

/**
 * Custom hook for device detection and responsive handling
 * Manages device-specific state and responsive behavior
 */
export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isMobile: false,
    isTablet: false,
    screenWidth: window.innerWidth,
    orientation: 'landscape',
  });

  // Update device information
  const updateDeviceInfo = React.useCallback(() => {
    const width = window.innerWidth;
    setDeviceInfo({
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      screenWidth: width,
      orientation: width > window.innerHeight ? 'landscape' : 'portrait',
    });
  }, []);

  // Set up responsive listeners
  React.useEffect(() => {
    updateDeviceInfo();

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [updateDeviceInfo]);

  // Get responsive grid configuration
  const getResponsiveGrid = React.useCallback(
    (itemCount, minWidth = 200) => {
      if (deviceInfo.isMobile) {
        return '1fr';
      } else if (deviceInfo.isTablet) {
        return 'repeat(2, 1fr)';
      } else {
        return `repeat(auto-fit, minmax(${minWidth}px, 1fr))`;
      }
    },
    [deviceInfo]
  );

  // Get responsive font size
  const getResponsiveFontSize = React.useCallback(
    (baseSize = '1rem') => {
      if (deviceInfo.isMobile) {
        return `calc(${baseSize} * 0.9)`;
      } else if (deviceInfo.isTablet) {
        return `calc(${baseSize} * 0.95)`;
      }
      return baseSize;
    },
    [deviceInfo]
  );

  // Get responsive spacing
  const getResponsiveSpacing = React.useCallback(
    (baseSpacing = '1rem') => {
      if (deviceInfo.isMobile) {
        return `calc(${baseSpacing} * 0.8)`;
      } else if (deviceInfo.isTablet) {
        return `calc(${baseSpacing} * 0.9)`;
      }
      return baseSpacing;
    },
    [deviceInfo]
  );

  // Check if touch device
  const isTouchDevice = React.useMemo(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  return {
    deviceInfo,
    getResponsiveGrid,
    getResponsiveFontSize,
    getResponsiveSpacing,
    isTouchDevice,
  };
}
