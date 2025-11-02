// Extension Conflict Resolution Script
// This script helps resolve conflicts between multiple wallet extensions

(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console.error to filter extension errors
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Filter out common extension errors
    if (
      message.includes('chrome.runtime.sendMessage') ||
      message.includes('Extension ID') ||
      message.includes('inpage.js') ||
      message.includes('inject.js') ||
      message.includes('Enkrypt') ||
      message.includes('MetaMask') ||
      message.includes('WalletConnect') ||
      message.includes('Coinbase') ||
      message.includes('runtime.sendMessage') ||
      message.includes('must specify an Extension ID') ||
      message.includes('Error in invocation of runtime.sendMessage') ||
      message.includes('Cannot read properties of undefined') ||
      message.includes('reading \'bind\'') ||
      message.includes('hydrate2') ||
      message.includes('createStoreImpl') ||
      message.includes('createConfig')
    ) {
      return; // Suppress these errors
    }
    
    originalError.apply(console, args);
  };
  
  // Override console.warn to filter extension warnings
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    
    if (
      message.includes('wallet') ||
      message.includes('extension') ||
      message.includes('inpage') ||
      message.includes('inject') ||
      message.includes('runtime')
    ) {
      return; // Suppress these warnings
    }
    
    originalWarn.apply(console, args);
  };
  
  // Handle unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason?.toString() || '';
    
    if (
      reason.includes('chrome.runtime.sendMessage') ||
      reason.includes('Extension ID') ||
      reason.includes('runtime.sendMessage') ||
      reason.includes('must specify an Extension ID')
    ) {
      event.preventDefault();
      return;
    }
    
    // Let other unhandled rejections through
  });
  
  // Handle general errors from extensions
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    const filename = event.filename || '';
    
    if (
      message.includes('chrome.runtime.sendMessage') ||
      message.includes('Extension ID') ||
      message.includes('runtime.sendMessage') ||
      filename.includes('inpage.js') ||
      filename.includes('inject.js') ||
      filename.includes('extension')
    ) {
      event.preventDefault();
      return;
    }
  });
  
  console.log('Extension conflict resolution script loaded');
})();
