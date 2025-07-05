/**
 * Mobile Performance Optimizer Utilities
 * Advanced mobile optimization functions
 */

// Bundle size analyzer
export const analyzeBundleSize = () => {
  const scripts = Array.from(document.scripts);
  let totalSize = 0;
  
  scripts.forEach(script => {
    if (script.src && script.src.includes('assets')) {
      // Estimate size based on typical chunk sizes
      totalSize += 50000; // ~50KB average per chunk
    }
  });
  
  const stylesheets = Array.from(document.styleSheets);
  stylesheets.forEach(() => {
    totalSize += 10000; // ~10KB average per stylesheet
  });
  
  return {
    estimatedSize: totalSize,
    isOptimal: totalSize < 500000, // Target: <500KB
    recommendation: totalSize > 500000 ? 'Consider code splitting' : 'Bundle size is optimal'
  };
};

// Memory usage monitor
export const monitorMemory = () => {
  if (!performance.memory) {
    return { available: false };
  }
  
  const memory = performance.memory;
  const usedPercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
  
  return {
    available: true,
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    usedPercent,
    isLowMemory: usedPercent > 80,
    recommendation: usedPercent > 80 ? 'High memory usage detected' : 'Memory usage is normal'
  };
};

// Connection quality detector
export const detectConnectionQuality = () => {
  if (!navigator.connection) {
    return { available: false, quality: 'unknown' };
  }
  
  const connection = navigator.connection;
  const effectiveType = connection.effectiveType;
  
  const qualityMap = {
    'slow-2g': { quality: 'poor', recommendation: 'Enable data saver mode' },
    '2g': { quality: 'poor', recommendation: 'Enable data saver mode' },
    '3g': { quality: 'good', recommendation: 'Standard loading' },
    '4g': { quality: 'excellent', recommendation: 'Full features enabled' }
  };
  
  return {
    available: true,
    effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    ...qualityMap[effectiveType] || { quality: 'unknown', recommendation: 'Unable to determine' }
  };
};

// Device capability detector
export const detectDeviceCapabilities = () => {
  const capabilities = {
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    deviceMemory: navigator.deviceMemory || 1,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    language: navigator.language,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
  };
  
  // Device classification
  const isLowEnd = capabilities.hardwareConcurrency <= 2 || capabilities.deviceMemory <= 2;
  const isMidRange = capabilities.hardwareConcurrency <= 4 || capabilities.deviceMemory <= 4;
  const isHighEnd = capabilities.hardwareConcurrency > 4 && capabilities.deviceMemory > 4;
  
  return {
    ...capabilities,
    classification: isLowEnd ? 'low-end' : isMidRange ? 'mid-range' : 'high-end',
    recommendation: {
      'low-end': 'Reduce animations, lazy load components',
      'mid-range': 'Standard optimizations',
      'high-end': 'Full features enabled'
    }[isLowEnd ? 'low-end' : isMidRange ? 'mid-range' : 'high-end']
  };
};

// Performance metrics collector
export const collectPerformanceMetrics = () => {
  if (!performance.timing) {
    return { available: false };
  }
  
  const timing = performance.timing;
  const navigation = performance.navigation;
  
  const metrics = {
    // Page load metrics
    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
    domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
    firstByteTime: timing.responseStart - timing.navigationStart,
    
    // Network metrics
    dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnectTime: timing.connectEnd - timing.connectStart,
    requestTime: timing.responseEnd - timing.requestStart,
    
    // Parse metrics
    domParseTime: timing.domInteractive - timing.responseEnd,
    resourceLoadTime: timing.loadEventEnd - timing.domContentLoadedEventEnd,
    
    // Navigation type
    navigationType: navigation.type,
    redirectCount: navigation.redirectCount
  };
  
  // Performance assessment
  const assessment = {
    pageLoadTime: metrics.pageLoadTime < 3000 ? 'good' : metrics.pageLoadTime < 5000 ? 'average' : 'poor',
    firstByteTime: metrics.firstByteTime < 200 ? 'good' : metrics.firstByteTime < 500 ? 'average' : 'poor',
    overall: 'good' // Will be calculated based on individual metrics
  };
  
  // Calculate overall score
  const scores = Object.values(assessment).filter(score => score !== 'good').length;
  assessment.overall = scores === 0 ? 'excellent' : scores <= 2 ? 'good' : 'needs improvement';
  
  return {
    available: true,
    metrics,
    assessment,
    recommendations: generatePerformanceRecommendations(assessment)
  };
};

// Generate performance recommendations
const generatePerformanceRecommendations = (assessment) => {
  const recommendations = [];
  
  if (assessment.pageLoadTime !== 'good') {
    recommendations.push('Optimize bundle size and implement code splitting');
  }
  
  if (assessment.firstByteTime !== 'good') {
    recommendations.push('Optimize server response time');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance is optimal');
  }
  
  return recommendations;
};

// Comprehensive mobile audit
export const runMobileAudit = () => {
  const audit = {
    timestamp: new Date().toISOString(),
    bundleSize: analyzeBundleSize(),
    memory: monitorMemory(),
    connection: detectConnectionQuality(),
    device: detectDeviceCapabilities(),
    performance: collectPerformanceMetrics()
  };
  
  // Overall score calculation
  let score = 100;
  
  if (!audit.bundleSize.isOptimal) score -= 20;
  if (audit.memory.available && audit.memory.isLowMemory) score -= 15;
  if (audit.connection.quality === 'poor') score -= 10;
  if (audit.device.classification === 'low-end') score -= 10;
  if (audit.performance.assessment?.overall === 'needs improvement') score -= 15;
  
  audit.overallScore = Math.max(0, score);
  audit.grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  
  return audit;
};

// Mobile optimization recommendations
export const getMobileOptimizationTips = (auditResults) => {
  const tips = [];
  
  if (auditResults.device.classification === 'low-end') {
    tips.push({
      priority: 'high',
      category: 'Performance',
      tip: 'Reduce animations and heavy visual effects',
      implementation: 'Add reduce-motion class to disable animations'
    });
  }
  
  if (auditResults.connection.quality === 'poor') {
    tips.push({
      priority: 'high',
      category: 'Network',
      tip: 'Enable data saver mode and reduce image quality',
      implementation: 'Implement lazy loading and image compression'
    });
  }
  
  if (!auditResults.bundleSize.isOptimal) {
    tips.push({
      priority: 'medium',
      category: 'Bundle Size',
      tip: 'Implement code splitting and lazy loading',
      implementation: 'Use React.lazy() for heavy components'
    });
  }
  
  if (auditResults.memory.available && auditResults.memory.isLowMemory) {
    tips.push({
      priority: 'high',
      category: 'Memory',
      tip: 'Clean up unused components and reduce memory footprint',
      implementation: 'Implement component cleanup and garbage collection'
    });
  }
  
  return tips;
};

// Apply mobile optimizations automatically
export const applyMobileOptimizations = (auditResults) => {
  const optimizations = [];
  
  // Low-end device optimizations
  if (auditResults.device.classification === 'low-end') {
    document.body.classList.add('low-end-device');
    optimizations.push('Applied low-end device optimizations');
  }
  
  // Poor connection optimizations
  if (auditResults.connection.quality === 'poor') {
    document.body.classList.add('poor-connection');
    optimizations.push('Applied poor connection optimizations');
  }
  
  // High memory usage optimizations
  if (auditResults.memory.available && auditResults.memory.isLowMemory) {
    document.body.classList.add('low-memory-mode');
    optimizations.push('Applied low memory optimizations');
  }
  
  // Touch optimization
  if (auditResults.device.maxTouchPoints > 0) {
    document.body.classList.add('touch-device');
    optimizations.push('Applied touch device optimizations');
  }
  
  return optimizations;
};

// Export all functions
export default {
  analyzeBundleSize,
  monitorMemory,
  detectConnectionQuality,
  detectDeviceCapabilities,
  collectPerformanceMetrics,
  runMobileAudit,
  getMobileOptimizationTips,
  applyMobileOptimizations
};