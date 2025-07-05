/**
 * Modern DOM mutation observer utilities
 * Replaces deprecated mutation events with modern MutationObserver API
 */

export class DOMWatcher {
  constructor() {
    this.observers = new Map();
  }

  /**
   * Watch for DOM changes (replaces DOMNodeInserted)
   * @param {Element} target - Element to observe
   * @param {Function} callback - Callback when nodes are added
   * @param {Object} options - Observer options
   */
  watchForAddedNodes(target, callback, options = {}) {
    const defaultOptions = {
      childList: true,
      subtree: true,
      ...options,
    };

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          callback(mutation.addedNodes, mutation);
        }
      });
    });

    observer.observe(target, defaultOptions);

    const watcherId = `watcher-${Date.now()}-${Math.random()}`;
    this.observers.set(watcherId, observer);

    return watcherId;
  }

  /**
   * Watch for attribute changes (replaces DOMAttrModified)
   * @param {Element} target - Element to observe
   * @param {Function} callback - Callback when attributes change
   * @param {Array} attributeFilter - Specific attributes to watch
   */
  watchForAttributeChanges(target, callback, attributeFilter = null) {
    const options = {
      attributes: true,
      attributeOldValue: true,
    };

    if (attributeFilter) {
      options.attributeFilter = attributeFilter;
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          callback(mutation.target, mutation.attributeName, mutation.oldValue);
        }
      });
    });

    observer.observe(target, options);

    const watcherId = `attr-watcher-${Date.now()}-${Math.random()}`;
    this.observers.set(watcherId, observer);

    return watcherId;
  }

  /**
   * Stop watching a specific observer
   * @param {string} watcherId - ID returned from watch methods
   */
  stopWatching(watcherId) {
    const observer = this.observers.get(watcherId);
    if (observer) {
      observer.disconnect();
      this.observers.delete(watcherId);
    }
  }

  /**
   * Stop all observers
   */
  stopAll() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Singleton instance
export const domWatcher = new DOMWatcher();

// React hook for DOM watching
export const useDOMWatcher = (
  callback,
  target = document.body,
  dependencies = []
) => {
  const { useEffect, useRef } = require('react');
  const watcherIdRef = useRef(null);

  useEffect(() => {
    if (target && callback) {
      watcherIdRef.current = domWatcher.watchForAddedNodes(target, callback);
    }

    return () => {
      if (watcherIdRef.current) {
        domWatcher.stopWatching(watcherIdRef.current);
      }
    };
  }, [target, ...dependencies]);
};

export default DOMWatcher;
