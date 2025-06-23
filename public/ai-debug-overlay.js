// AI Features Debug Overlay
// This script creates a floating panel to show AI features status and provides direct links

(function() {
  console.log('🔧 AI Features Debug Overlay - Initializing');
  
  // Create the overlay container
  const createOverlay = () => {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('ai-debug-overlay');
    if (existingOverlay) {
      document.body.removeChild(existingOverlay);
    }
    
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.id = 'ai-debug-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '70px';
    overlay.style.right = '20px';
    overlay.style.width = '320px';
    overlay.style.background = 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))';
    overlay.style.borderRadius = '15px';
    overlay.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    overlay.style.padding = '20px';
    overlay.style.zIndex = '9999';
    overlay.style.color = 'white';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.border = '1px solid rgba(0, 212, 255, 0.3)';
    
    // Add header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h3');
    title.textContent = '🤖 AI Features Status';
    title.style.margin = '0';
    title.style.color = '#00D4FF';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    overlay.appendChild(header);
    
    // Add content
    const content = document.createElement('div');
    
    // AI Components Status
    const componentsStatus = document.createElement('div');
    componentsStatus.style.marginBottom = '20px';
    
    const statusTitle = document.createElement('h4');
    statusTitle.textContent = 'Components Status';
    statusTitle.style.color = '#BA55D3';
    statusTitle.style.marginBottom = '10px';
    componentsStatus.appendChild(statusTitle);
    
    // List of AI components
    const aiComponents = [
      { name: 'AI Features Grid', class: '.ai-features-grid' },
      { name: 'AI Coaching Panel', class: '.ai-card' },
      { name: 'AI Earnings Prediction', class: '.ai-card' },
      { name: 'AI Transaction Helper', class: '.ai-card' },
      { name: 'AI Market Insights', class: '.ai-insights-card' },
      { name: 'AI Success Stories', class: '.ai-success-stories-card' },
      { name: 'AI Emotion Tracker', class: '.emotion-indicator' }
    ];
    
    const componentsList = document.createElement('ul');
    componentsList.style.listStyle = 'none';
    componentsList.style.padding = '0';
    componentsList.style.margin = '0';
    
    aiComponents.forEach(comp => {
      const elements = document.querySelectorAll(comp.class);
      const item = document.createElement('li');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.padding = '8px 0';
      item.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      
      const name = document.createElement('span');
      name.textContent = comp.name;
      
      const status = document.createElement('span');
      if (elements.length > 0) {
        status.textContent = '✅ Found';
        status.style.color = '#00D4FF';
      } else {
        status.textContent = '❌ Not Found';
        status.style.color = '#FF6B35';
      }
      
      item.appendChild(name);
      item.appendChild(status);
      componentsList.appendChild(item);
    });
    
    componentsStatus.appendChild(componentsList);
    content.appendChild(componentsStatus);
    
    // Quick Actions
    const actions = document.createElement('div');
    actions.style.marginBottom = '20px';
    
    const actionsTitle = document.createElement('h4');
    actionsTitle.textContent = 'Quick Actions';
    actionsTitle.style.color = '#BA55D3';
    actionsTitle.style.marginBottom = '10px';
    actions.appendChild(actionsTitle);
    
    const actionsGrid = document.createElement('div');
    actionsGrid.style.display = 'grid';
    actionsGrid.style.gridTemplateColumns = '1fr 1fr';
    actionsGrid.style.gap = '10px';
    
    // Test Dashboard Button
    const testDashboardBtn = document.createElement('a');
    testDashboardBtn.textContent = 'AI Test Dashboard';
    testDashboardBtn.href = '/test-ai';
    testDashboardBtn.style.background = 'linear-gradient(45deg, #00D4FF, #7B2CBF)';
    testDashboardBtn.style.color = 'white';
    testDashboardBtn.style.padding = '10px';
    testDashboardBtn.style.borderRadius = '8px';
    testDashboardBtn.style.textDecoration = 'none';
    testDashboardBtn.style.textAlign = 'center';
    testDashboardBtn.style.display = 'block';
    
    // Force Display Button
    const forceDisplayBtn = document.createElement('button');
    forceDisplayBtn.textContent = 'Force AI Display';
    forceDisplayBtn.style.background = 'rgba(255, 107, 53, 0.8)';
    forceDisplayBtn.style.color = 'white';
    forceDisplayBtn.style.padding = '10px';
    forceDisplayBtn.style.borderRadius = '8px';
    forceDisplayBtn.style.border = 'none';
    forceDisplayBtn.style.cursor = 'pointer';
    forceDisplayBtn.onclick = forceAIDisplay;
    
    // Highlight Button
    const highlightBtn = document.createElement('button');
    highlightBtn.textContent = 'Highlight AI Elements';
    highlightBtn.style.background = 'rgba(186, 85, 211, 0.8)';
    highlightBtn.style.color = 'white';
    highlightBtn.style.padding = '10px';
    highlightBtn.style.borderRadius = '8px';
    highlightBtn.style.border = 'none';
    highlightBtn.style.cursor = 'pointer';
    highlightBtn.onclick = highlightAIElements;
    
    // Debug Report Button
    const debugReportBtn = document.createElement('a');
    debugReportBtn.textContent = 'View AI Debug Report';
    debugReportBtn.href = '/ai-verification-report.html';
    debugReportBtn.target = '_blank';
    debugReportBtn.style.background = 'rgba(0, 212, 255, 0.8)';
    debugReportBtn.style.color = 'white';
    debugReportBtn.style.padding = '10px';
    debugReportBtn.style.borderRadius = '8px';
    debugReportBtn.style.textDecoration = 'none';
    debugReportBtn.style.textAlign = 'center';
    debugReportBtn.style.display = 'block';
    
    actionsGrid.appendChild(testDashboardBtn);
    actionsGrid.appendChild(forceDisplayBtn);
    actionsGrid.appendChild(highlightBtn);
    actionsGrid.appendChild(debugReportBtn);
    
    actions.appendChild(actionsGrid);
    content.appendChild(actions);
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.fontSize = '12px';
    footer.style.color = 'rgba(255, 255, 255, 0.6)';
    footer.style.textAlign = 'center';
    footer.style.marginTop = '10px';
    footer.innerHTML = 'AI Features Debug Overlay v1.0<br>Press ESC to close';
    
    // Add keydown event to close on ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    });
    
    overlay.appendChild(content);
    overlay.appendChild(footer);
    
    // Make draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    header.style.cursor = 'move';
    
    const dragStart = (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === header || e.target === title) {
        isDragging = true;
      }
    };
    
    const dragEnd = () => {
      isDragging = false;
    };
    
    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        xOffset = currentX;
        yOffset = currentY;
        
        overlay.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    };
    
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
    
    return overlay;
  };
  
  // Force AI display function
  function forceAIDisplay() {
    const styleElement = document.createElement('style');
    styleElement.id = 'force-ai-display';
    styleElement.textContent = `
      .ai-features-grid, .ai-chat-widget, .ai-assistant-container, 
      .ai-card, .ai-insights-card, .ai-success-stories-card, 
      .emotion-indicator, .ai-section, .ai-section-header {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        min-height: 50px !important;
        background-color: rgba(0, 212, 255, 0.2) !important;
        position: relative !important;
        z-index: 900 !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Update status
    const statusList = document.querySelector('#ai-debug-overlay ul');
    if (statusList) {
      Array.from(statusList.children).forEach(item => {
        const statusSpan = item.querySelector('span:last-child');
        if (statusSpan && statusSpan.textContent.includes('Not Found')) {
          statusSpan.textContent = '⚠️ Forced Visible';
          statusSpan.style.color = '#FFA500';
        }
      });
    }
    
    alert('AI components have been forced to display. If they are still not visible, they may be missing from the DOM entirely.');
  }
  
  // Highlight AI elements function
  function highlightAIElements() {
    const aiSelectors = [
      '.ai-features-grid',
      '.ai-chat-widget',
      '.ai-assistant-container',
      '.ai-card', 
      '.ai-insights-card',
      '.ai-success-stories-card',
      '.emotion-indicator',
      '.ai-section',
      '.ai-section-header'
    ];
    
    const styleElement = document.createElement('style');
    styleElement.id = 'highlight-ai-elements';
    
    let cssRules = '';
    aiSelectors.forEach((selector, index) => {
      const colors = ['red', 'blue', 'green', 'purple', 'orange', 'cyan', 'magenta', 'yellow', 'pink'];
      cssRules += `
        ${selector} {
          border: 3px solid ${colors[index % colors.length]} !important;
          position: relative !important;
        }
        ${selector}::before {
          content: "${selector}" !important;
          position: absolute !important;
          top: -20px !important;
          left: 0 !important;
          background-color: ${colors[index % colors.length]} !important;
          color: white !important;
          padding: 2px 6px !important;
          font-size: 10px !important;
          border-radius: 3px !important;
          z-index: 9999 !important;
        }
      `;
    });
    
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
  }
  
  // Add the overlay to the document
  document.body.appendChild(createOverlay());
  console.log('🔧 AI Features Debug Overlay - Ready');
})();
