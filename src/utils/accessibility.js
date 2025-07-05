/**
 * Accessibility Utilities
 * WCAG 2.1 AA Compliance Helpers
 */

// ============ KEYBOARD NAVIGATION ============
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
};

export const handleKeyboardClick = (event, callback) => {
  if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
    event.preventDefault();
    callback(event);
  }
};

export const trapFocus = container => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = e => {
    if (e.key === KEYBOARD_KEYS.TAB) {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

// ============ ARIA HELPERS ============
export const generateId = (prefix = 'id') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const setAriaAttributes = (element, attributes) => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(`aria-${key}`, value);
  });
};

export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// ============ COLOR CONTRAST ============
export const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getLuminance = rgb => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const getContrastRatio = (color1, color2) => {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

export const isAccessibleContrast = (foreground, background, level = 'AA') => {
  const ratio = getContrastRatio(foreground, background);
  const requirements = {
    AA: 4.5,
    AAA: 7,
    AA_LARGE: 3,
    AAA_LARGE: 4.5,
  };
  return ratio >= requirements[level];
};

// ============ MOTION PREFERENCES ============
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const respectedAnimation = animation => {
  return prefersReducedMotion() ? {} : animation;
};

// ============ SCREEN READER UTILITIES ============
export const createScreenReaderText = text => {
  const element = document.createElement('span');
  element.className = 'sr-only';
  element.textContent = text;
  return element;
};

export const hideFromScreenReader = element => {
  element.setAttribute('aria-hidden', 'true');
};

export const showToScreenReader = element => {
  element.removeAttribute('aria-hidden');
};

// ============ FOCUS MANAGEMENT ============
export const manageFocus = {
  store: null,

  save() {
    this.store = document.activeElement;
  },

  restore() {
    if (this.store && this.store.focus) {
      this.store.focus();
      this.store = null;
    }
  },

  focusFirst(container) {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  },

  moveTo(element) {
    if (element && element.focus) {
      element.focus();
    }
  },
};

// ============ VALIDATION HELPERS ============
export const validateAccessibility = {
  checkHeadingHierarchy(container = document) {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues = [];
    let previousLevel = 0;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1');
      }

      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }

      previousLevel = level;
    });

    return issues;
  },

  checkAltText(container = document) {
    const images = container.querySelectorAll('img');
    const issues = [];

    images.forEach(img => {
      if (
        !img.alt &&
        !img.getAttribute('aria-label') &&
        !img.getAttribute('aria-hidden')
      ) {
        issues.push(`Image missing alt text: ${img.src || img.outerHTML}`);
      }
    });

    return issues;
  },

  checkLabels(container = document) {
    const inputs = container.querySelectorAll('input, select, textarea');
    const issues = [];

    inputs.forEach(input => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        issues.push(`Form input missing label: ${input.type || input.tagName}`);
      }
    });

    return issues;
  },

  checkColorContrast(container = document) {
    // This would need more sophisticated implementation
    // For now, return a placeholder
    return [];
  },
};

// ============ ARIA LIVE REGIONS ============
export class LiveRegion {
  constructor(priority = 'polite') {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', priority);
    this.element.setAttribute('aria-atomic', 'true');
    this.element.className = 'sr-only';
    document.body.appendChild(this.element);
  }

  announce(message) {
    this.element.textContent = message;
  }

  destroy() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// ============ LANDMARK NAVIGATION ============
export const createLandmarkNavigation = () => {
  const landmarks = document.querySelectorAll(
    '[role], main, nav, aside, header, footer, section'
  );
  const landmarkList = Array.from(landmarks).map((landmark, index) => {
    const role =
      landmark.getAttribute('role') || landmark.tagName.toLowerCase();
    const label =
      landmark.getAttribute('aria-label') ||
      landmark.getAttribute('aria-labelledby') ||
      `${role} ${index + 1}`;

    return {
      element: landmark,
      role,
      label,
      focusable:
        landmark.tabIndex >= 0 ||
        landmark.querySelector('[tabindex]:not([tabindex="-1"])'),
    };
  });

  return landmarkList;
};

// ============ RESPONSIVE TEXT ============
export const calculateOptimalTextSize = containerWidth => {
  // WCAG recommends 45-75 characters per line for optimal readability
  const baseSize = 16;
  const minSize = 14;
  const maxSize = 24;

  // Approximate character width for common fonts
  const charWidth = 0.6;
  const optimalChars = 60;

  const calculatedSize = containerWidth / (optimalChars * charWidth);
  return Math.max(minSize, Math.min(maxSize, calculatedSize));
};

// ============ EXPORT ALL ============
export default {
  KEYBOARD_KEYS,
  handleKeyboardClick,
  trapFocus,
  generateId,
  setAriaAttributes,
  announceToScreenReader,
  hexToRgb,
  getLuminance,
  getContrastRatio,
  isAccessibleContrast,
  prefersReducedMotion,
  respectedAnimation,
  createScreenReaderText,
  hideFromScreenReader,
  showToScreenReader,
  manageFocus,
  validateAccessibility,
  LiveRegion,
  createLandmarkNavigation,
  calculateOptimalTextSize,
};
