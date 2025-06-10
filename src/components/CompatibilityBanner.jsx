import React, { useEffect, useState } from 'react';

const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown', version = 'Unknown', compatible = true, issues = [];

  if (userAgent.indexOf('Chrome') > -1) {
    name = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    if (parseInt(version) < 90) {
      compatible = false;
      issues.push('Chrome version too old (requires 90+)');
    }
  } else if (userAgent.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    if (parseInt(version) < 85) {
      compatible = false;
      issues.push('Firefox version too old (requires 85+)');
    }
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    if (parseInt(version) < 14) {
      compatible = false;
      issues.push('Safari version too old (requires 14+)');
    }
  } else if (userAgent.indexOf('Edg') > -1) {
    name = 'Edge';
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    if (parseInt(version) < 90) {
      compatible = false;
      issues.push('Edge version too old (requires 90+)');
    }
  } else {
    compatible = false;
    issues.push('Browser not identified as Chrome, Firefox, Safari, or Edge');
  }

  // Feature checks
  const requiredFeatures = [
    { name: 'CSS Grid', test: () => window.CSS && CSS.supports && CSS.supports('display', 'grid') },
    { name: 'Flexbox', test: () => window.CSS && CSS.supports && CSS.supports('display', 'flex') },
    { name: 'Fetch API', test: () => typeof fetch === 'function' },
    { name: 'ES6 Promises', test: () => typeof Promise === 'function' },
    { name: 'CSS Variables', test: () => window.CSS && CSS.supports && CSS.supports('--test', '0') }
  ];
  requiredFeatures.forEach(feature => {
    try {
      if (!feature.test()) {
        compatible = false;
        issues.push(`Missing support for ${feature.name}`);
      }
    } catch (e) {
      compatible = false;
      issues.push(`Error testing ${feature.name}: ${e.message}`);
    }
  });

  return { name, version, compatible, issues };
};

const CompatibilityBanner = () => {
  const [visible, setVisible] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    setInfo(getBrowserInfo());
  }, []);

  if (!visible || !info) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '10px',
        background: info.compatible ? '#4CAF50' : '#F44336',
        color: 'white',
        textAlign: 'center',
        zIndex: 9999,
        fontSize: '14px',
      }}
    >
      {info.compatible ? (
        <>✅ Compatible with {info.name} {info.version}</>
      ) : (
        <>⚠️ Compatibility issues detected with {info.name} {info.version}: {info.issues.join(', ')}</>
      )}
      <button
        aria-label="Dismiss compatibility banner"
        style={{
          marginLeft: '10px',
          padding: '3px 8px',
          background: 'white',
          color: info.compatible ? '#4CAF50' : '#F44336',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
        onClick={() => setVisible(false)}
      >
        Dismiss
      </button>
    </div>
  );
};

export default CompatibilityBanner;
