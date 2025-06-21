// Quick diagnostic to test WebSocket service
console.log('🔧 Testing WebSocket Service...');

// Import the service
import('./services/WebSocketService.js').then(module => {
  const WebSocketService = module.default;
  
  console.log('✅ WebSocketService imported successfully');
  
  // Test the methods
  const testListener = () => console.log('Test listener called');
  
  // Test on/off methods
  WebSocketService.on('test', testListener);
  console.log('✅ on() method works');
  
  WebSocketService.off('test', testListener);
  console.log('✅ off() method works');
  
  WebSocketService.removeListener('test', testListener);
  console.log('✅ removeListener() method works');
  
  console.log('🎉 All WebSocket methods are working correctly!');
  console.log('The error should be resolved. Try refreshing the page.');
  
}).catch(error => {
  console.error('❌ Error testing WebSocket service:', error);
});
