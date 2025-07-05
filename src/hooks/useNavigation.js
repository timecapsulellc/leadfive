/**
 * Custom Navigation Hook for LeadFive Dashboard
 * Handles navigation logic with proper React Router integration
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  NAVIGATION_CONFIG,
  getRouteBySection,
  getSectionByPath,
  getBreadcrumbs,
  getValidSectionId,
} from '../config/navigation';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    section: 'overview',
    timestamp: new Date(),
    duration: 0,
  });
  const [isNavigating, setIsNavigating] = useState(false);

  // Determine active section from current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const sectionFromPath = getSectionByPath(currentPath);
    const validSection = getValidSectionId(sectionFromPath);

    if (validSection !== activeSection) {
      setActiveSection(validSection);

      // Update current page info
      const now = new Date();
      setCurrentPage(prev => ({
        section: validSection,
        timestamp: now,
        duration: 0,
        previousSection: prev.section,
        previousDuration: now.getTime() - prev.timestamp.getTime(),
      }));
    }
  }, [location.pathname, activeSection]);

  // Navigation function with proper routing
  const navigateToSection = useCallback(
    (sectionId, options = {}) => {
      console.log('🎯 Navigation requested:', {
        sectionId,
        activeSection,
        isNavigating,
        options,
      });

      if (isNavigating) {
        console.log('⚠️ Navigation blocked: Already navigating');
        return; // Prevent double navigation
      }

      const validSectionId = getValidSectionId(sectionId);
      console.log('✅ Valid section determined:', validSectionId);

      if (validSectionId === activeSection) {
        console.log(
          'ℹ️ Navigation skipped: Already on section',
          validSectionId
        );
        return; // Already on this section
      }

      setIsNavigating(true);
      console.log(
        '🚀 Starting navigation from',
        activeSection,
        'to',
        validSectionId
      );

      try {
        const route = getRouteBySection(validSectionId);
        const now = new Date();

        // Record navigation history
        const navigationEntry = {
          from: activeSection,
          to: validSectionId,
          timestamp: now,
          duration: now.getTime() - currentPage.timestamp.getTime(),
          method: options.method || 'menu-click',
        };

        setNavigationHistory(prev => [...prev.slice(-9), navigationEntry]); // Keep last 10 entries

        // Update active section
        setActiveSection(validSectionId);

        // Navigate using React Router
        console.log('🎭 Calling React Router navigate to:', route.path);
        navigate(route.path, {
          replace: options.replace || false,
          state: {
            section: validSectionId,
            timestamp: now.toISOString(),
            previousSection: activeSection,
          },
        });

        console.log('✅ Navigation completed successfully to:', validSectionId);

        // Analytics tracking (if needed)
        if (options.trackAnalytics !== false) {
          trackNavigation(navigationEntry);
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to overview if navigation fails
        if (validSectionId !== 'overview') {
          navigateToSection('overview', {
            replace: true,
            trackAnalytics: false,
          });
        }
      } finally {
        // Reset navigation lock after a brief delay
        setTimeout(() => setIsNavigating(false), 100);
      }
    },
    [activeSection, currentPage.timestamp, navigate, isNavigating]
  );

  // Navigate back to previous section
  const navigateBack = useCallback(() => {
    if (navigationHistory.length > 0) {
      const lastNavigation = navigationHistory[navigationHistory.length - 1];
      navigateToSection(lastNavigation.from, { method: 'back-button' });
    } else {
      navigateToSection('overview', { method: 'back-button' });
    }
  }, [navigationHistory, navigateToSection]);

  // Navigate to external route (outside dashboard)
  const navigateToPage = useCallback(
    (path, options = {}) => {
      navigate(path, options);
    },
    [navigate]
  );

  // Get current route information
  const getCurrentRoute = useCallback(() => {
    return getRouteBySection(activeSection);
  }, [activeSection]);

  // Get breadcrumbs for current section
  const getCurrentBreadcrumbs = useCallback(() => {
    return getBreadcrumbs(activeSection);
  }, [activeSection]);

  // Check if section is active
  const isSectionActive = useCallback(
    sectionId => {
      return activeSection === sectionId;
    },
    [activeSection]
  );

  // Get menu items with active state
  const getMenuItems = useCallback(() => {
    return NAVIGATION_CONFIG.menuItems.map(item => ({
      ...item,
      active: item.id === activeSection,
      route: getRouteBySection(item.route || item.id),
    }));
  }, [activeSection]);

  // Get navigation analytics
  const getNavigationAnalytics = useCallback(() => {
    const totalNavigations = navigationHistory.length;
    const averageTimePerSection =
      navigationHistory.length > 0
        ? navigationHistory.reduce((sum, nav) => sum + nav.duration, 0) /
          navigationHistory.length
        : 0;

    const sectionVisits = navigationHistory.reduce((acc, nav) => {
      acc[nav.to] = (acc[nav.to] || 0) + 1;
      return acc;
    }, {});

    const mostVisitedSection =
      Object.entries(sectionVisits).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'overview';

    return {
      totalNavigations,
      averageTimePerSection: Math.round(averageTimePerSection),
      sectionVisits,
      mostVisitedSection,
      currentSession: {
        startTime: navigationHistory[0]?.timestamp || currentPage.timestamp,
        currentSection: activeSection,
        timeOnCurrentSection: Date.now() - currentPage.timestamp.getTime(),
      },
    };
  }, [navigationHistory, activeSection, currentPage.timestamp]);

  // Analytics tracking function
  const trackNavigation = useCallback(navigationEntry => {
    // Implementation for analytics tracking
    // Could integrate with Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'dashboard_navigation', {
        event_category: 'Dashboard',
        event_label: `${navigationEntry.from} -> ${navigationEntry.to}`,
        value: navigationEntry.duration,
      });
    }

    // Custom analytics can be added here
    console.log('Navigation tracked:', navigationEntry);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyboardNavigation = event => {
      // Alt + Number keys for quick navigation
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const menuIndex = parseInt(event.key) - 1;
        const menuItem = NAVIGATION_CONFIG.menuItems[menuIndex];
        if (menuItem) {
          navigateToSection(menuItem.id, { method: 'keyboard-shortcut' });
        }
      }

      // Alt + Left Arrow for back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateBack();
      }
    };

    window.addEventListener('keydown', handleKeyboardNavigation);
    return () =>
      window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [navigateToSection, navigateBack]);

  return {
    // Current state
    activeSection,
    currentRoute: getCurrentRoute(),
    breadcrumbs: getCurrentBreadcrumbs(),
    isNavigating,

    // Navigation functions
    navigateToSection,
    navigateBack,
    navigateToPage,

    // Utility functions
    isSectionActive,
    getMenuItems,

    // History and analytics
    navigationHistory,
    analytics: getNavigationAnalytics(),

    // Route information
    routes: NAVIGATION_CONFIG.routes,
    menuGroups: NAVIGATION_CONFIG.menuGroups,
  };
};
