/**
 * Browser Extension Compatibility Layer
 * Prevents extension-related console noise and conflicts
 */

// Disable deprecated mutation events for third-party scripts
(function() {
  'use strict';
  
  // Override deprecated mutation event methods to prevent console warnings
  if (typeof Document !== 'undefined' && Document.prototype) {
    const originalAddEventListener = Document.prototype.addEventListener;
    
    Document.prototype.addEventListener = function(type, listener, options) {
      // Block deprecated mutation events from extensions
      if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved' || type === 'DOMAttrModified') {
        console.warn(`[LeadFive] Blocked deprecated mutation event: ${type} (likely from browser extension)`);
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Similar protection for Element
  if (typeof Element !== 'undefined' && Element.prototype) {
    const originalElementAddEventListener = Element.prototype.addEventListener;
    
    Element.prototype.addEventListener = function(type, listener, options) {
      if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved' || type === 'DOMAttrModified') {
        console.warn(`[LeadFive] Blocked deprecated mutation event: ${type} (likely from browser extension)`);
        return;
      }
      return originalElementAddEventListener.call(this, type, listener, options);
    };
  }
  
  // Log successful initialization
  console.log('🛡️ [LeadFive] Extension compatibility layer initialized');
})();
