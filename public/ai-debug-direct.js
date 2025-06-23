// LEAD FIVE AI Component Debug Script
console.log('🔍 LEAD FIVE AI Component Debug Script Loaded');

// Function to add a highlight border to an element
function highlightElement(element, label) {
  // Skip if already highlighted
  if (element.dataset.highlighted === 'true') return;
  
  // Save original styles
  const originalBorder = element.style.border;
  const originalPosition = element.style.position;
  
  // Add highlight styles
  element.style.border = '3px solid red';
  element.style.position = 'relative';
  element.dataset.highlighted = 'true';
  
  // Add label
  const labelElement = document.createElement('div');
  labelElement.textContent = label;
  labelElement.style.position = 'absolute';
  labelElement.style.top = '0';
  labelElement.style.left = '0';
  labelElement.style.backgroundColor = 'red';
  labelElement.style.color = 'white';
  labelElement.style.padding = '2px 5px';
  labelElement.style.fontSize = '10px';
  labelElement.style.zIndex = '9999';
  element.appendChild(labelElement);
  
  console.log(`✅ Highlighted: ${label}`);
  
  // Restore original styles on click
  labelElement.addEventListener('click', () => {
    element.style.border = originalBorder;
    element.style.position = originalPosition;
    element.removeChild(labelElement);
    delete element.dataset.highlighted;
    console.log(`❌ Removed highlight: ${label}`);
  });
}

// Force all AI components to be visible
function forceComponentsVisible() {
  const styleOverrides = `
    [class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"] {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      min-height: 30px !important;
      min-width: 30px !important;
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    
    /* Target specific AI component classes */
    .ai-features-grid,
    .ai-chat-widget,
    .ai-assistant-container,
    .ai-section-header,
    .ai-card,
    .ai-insights-card,
    .ai-success-stories-card,
    .emotion-indicator {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      min-height: 50px !important;
      border: 2px dashed #00D4FF !important;
      background-color: rgba(0, 212, 255, 0.2) !important;
      position: relative !important;
      z-index: 999 !important;
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'ai-force-visible';
  styleElement.textContent = styleOverrides;
  document.head.appendChild(styleElement);
  
  console.log('💪 Forced AI components to be visible');
}

// Search for AI components
function findAIComponents() {
  console.log('🔍 Searching for AI components...');
  
  // Find components by class/id naming convention
  const aiElements = document.querySelectorAll('[class*="ai-"], [id*="ai-"], [class*="AI"], [id*="AI"]');
  console.log(`Found ${aiElements.length} potential AI-related elements by class/id`);
  
  aiElements.forEach((element, index) => {
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList).join('.');
    const label = `AI Element ${index + 1}${id ? ': ' + id : ''}${classes ? ': ' + classes : ''}`;
    highlightElement(element, label);
  });
  
  // Look for specific component classes
  const aiSpecificClasses = [
    '.ai-features-grid',
    '.ai-chat-widget',
    '.ai-assistant-container',
    '.ai-section-header',
    '.ai-card',
    '.ai-insights-card',
    '.ai-success-stories-card',
    '.emotion-indicator'
  ];
  
  aiSpecificClasses.forEach(className => {
    const elements = document.querySelectorAll(className);
    console.log(`Found ${elements.length} "${className}" elements`);
    
    elements.forEach((element, index) => {
      highlightElement(element, `${className} ${index + 1}`);
    });
  });
  
  // Look for specific component names
  const aiComponentNames = [
    'AICoachingPanel',
    'AIEarningsPrediction',
    'AITransactionHelper',
    'AIMarketInsights',
    'AISuccessStories',
    'AIEmotionTracker'
  ];
  
  // First try to find by actual component tag name (unlikely but possible)
  aiComponentNames.forEach(name => {
    const elements = document.getElementsByTagName(name.toLowerCase());
    if (elements.length > 0) {
      console.log(`Found ${elements.length} <${name.toLowerCase()}> elements`);
      Array.from(elements).forEach((element, index) => {
        highlightElement(element, `${name} ${index + 1}`);
      });
    }
  });
  
  // Try to find components by containing text
  aiComponentNames.forEach(name => {
    // Convert camelCase to words with spaces
    const readableName = name.replace(/([A-Z])/g, ' $1').trim();
    
    // Find elements containing the readable name text
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue.includes(readableName) || node.nodeValue.includes(name)) {
        textNodes.push(node);
      }
    }
    
    console.log(`Found ${textNodes.length} elements containing "${readableName}" text`);
    
    textNodes.forEach((textNode, index) => {
      const element = textNode.parentElement;
      const closestCard = element.closest('[class*="card"], [class*="panel"], [class*="container"]');
      if (closestCard) {
        highlightElement(closestCard, `${name} Container ${index + 1}`);
      } else {
        highlightElement(element, `${name} Text ${index + 1}`);
      }
    });
  });
  
  // Also try to find elements with specific AI-related content
  const aiRelatedContent = [
    'AI Assistant',
    'AI Chat',
    'AI Coaching',
    'AI Prediction',
    'AI Market',
    'AI Insights',
    'Success Stories',
    'Emotion Tracker'
  ];
  
  aiRelatedContent.forEach(content => {
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeValue.includes(content)) {
        textNodes.push(node);
      }
    }
    
    console.log(`Found ${textNodes.length} elements containing "${content}" text`);
    
    textNodes.forEach((textNode, index) => {
      const element = textNode.parentElement;
      const closestContainer = element.closest('[class*="card"], [class*="panel"], [class*="container"], [class*="section"]');
      if (closestContainer) {
        highlightElement(closestContainer, `${content} Container ${index + 1}`);
      } else {
        highlightElement(element, `${content} Text ${index + 1}`);
      }
    });
  });
  
  // Create a report
  const totalFound = document.querySelectorAll('[data-highlighted="true"]').length;
  console.log(`✅ Total AI-related elements found and highlighted: ${totalFound}`);
  
  if (totalFound === 0) {
    console.warn('⚠️ No AI components found. They might not be rendered or are deeply hidden in the DOM.');
  }
}

// Create visual indicator for debugging status
function createDebugIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ai-debug-indicator';
  indicator.style.position = 'fixed';
  indicator.style.bottom = '10px';
  indicator.style.right = '10px';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  indicator.style.color = '#00ff00';
  indicator.style.padding = '10px 15px';
  indicator.style.borderRadius = '5px';
  indicator.style.zIndex = '10000';
  indicator.style.fontFamily = 'monospace';
  indicator.style.fontSize = '12px';
  indicator.textContent = '🔍 AI Debug Mode Active';
  document.body.appendChild(indicator);
  
  // Add controls
  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '5px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '5px';
  
  const highlightButton = document.createElement('button');
  highlightButton.textContent = 'Find AI Components';
  highlightButton.style.backgroundColor = '#3498db';
  highlightButton.style.border = 'none';
  highlightButton.style.padding = '3px 5px';
  highlightButton.style.borderRadius = '3px';
  highlightButton.style.color = 'white';
  highlightButton.style.cursor = 'pointer';
  highlightButton.style.fontSize = '10px';
  highlightButton.addEventListener('click', findAIComponents);
  
  const forceVisibleButton = document.createElement('button');
  forceVisibleButton.textContent = 'Force Visible';
  forceVisibleButton.style.backgroundColor = '#e74c3c';
  forceVisibleButton.style.border = 'none';
  forceVisibleButton.style.padding = '3px 5px';
  forceVisibleButton.style.borderRadius = '3px';
  forceVisibleButton.style.color = 'white';
  forceVisibleButton.style.cursor = 'pointer';
  forceVisibleButton.style.fontSize = '10px';
  forceVisibleButton.addEventListener('click', forceComponentsVisible);
  
  buttonContainer.appendChild(highlightButton);
  buttonContainer.appendChild(forceVisibleButton);
  indicator.appendChild(buttonContainer);
  
  // Make draggable
  let isDragging = false;
  let offsetX, offsetY;
  
  indicator.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - indicator.getBoundingClientRect().left;
    offsetY = e.clientY - indicator.getBoundingClientRect().top;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      indicator.style.right = 'auto';
      indicator.style.bottom = 'auto';
      indicator.style.left = `${e.clientX - offsetX}px`;
      indicator.style.top = `${e.clientY - offsetY}px`;
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  console.log('✅ Debug indicator created');
}

// Initialize
createDebugIndicator();
console.log('🚀 AI Debug Tools Ready - Click "Find AI Components" to locate AI features');
console.log('💡 TIP: Navigate to different sections of the dashboard to find all AI features');
