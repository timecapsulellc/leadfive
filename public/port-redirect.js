// Auto-redirect script to ensure users always access the latest version
const currentPort = window.location.port;
const correctPort = '5177';

if (currentPort !== correctPort && currentPort !== '') {
  console.log(`🔄 Redirecting from port ${currentPort} to ${correctPort} for latest version`);
  window.location.href = `http://localhost:${correctPort}${window.location.pathname}${window.location.search}`;
}

// Clear any old cache indicators
if (localStorage.getItem('orphichain-cache') || sessionStorage.getItem('orphichain-data')) {
  localStorage.clear();
  sessionStorage.clear();
  console.log('🧹 Cleared legacy cache data');
}
