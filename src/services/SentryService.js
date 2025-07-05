// Simplified Sentry service for build compatibility
class SentryService {
  init() {
    console.log('Sentry disabled for production build');
    this.isInitialized = false;
    return true;
  }
  
  captureException(error) {
    console.error('Error:', error);
  }
  
  captureMessage(message) {
    console.log('Message:', message);
  }
  
  addBreadcrumb() {}
  
  setUser() {}
  
  setTag() {}
  
  setContext() {}
  
  startTransaction() {
    return null;
  }
  
  captureWeb3Error(error) {
    console.error('Web3 Error:', error);
  }
}

export default new SentryService();
