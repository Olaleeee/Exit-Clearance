// main.js (refactored)
'use strict';

// Global variables
let currentToken = null;
let currentRole = null;

/**
 * Authenticate user and validate token
 * @param {string} requiredRole - Required role for the page
 * @returns {Promise<string>} - Valid token
 */
const authenticate = async function (requiredRole) {
  try {
    const token = localStorage.getItem('token');

    // If no token, redirect to login
    if (!token) {
      window.location.href = 'login.html';
      throw new Error('No authentication token found');
    }

    // Validate JWT token
    if (typeof jwt_decode !== 'undefined') {
      const decoded = jwt_decode(token);
      currentRole = decoded.role;
      currentToken = token;

      // Check role permission
      if (requiredRole && decoded.role !== requiredRole) {
        notyf.error(`Access denied. Required role: ${requiredRole}`);
        window.location.href = 'login.html';
        throw new Error('Insufficient permissions');
      }

      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        notyf.error('Session expired. Please login again.');
        window.location.href = 'login.html';
        throw new Error('Token expired');
      }
    }

    return token;
  } catch (error) {
    console.error('Authentication error:', error);
    window.location.href = 'login.html';
    throw error;
  }
};

/**
 * Make API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
const apiRequest = async function (endpoint, options = {}) {
  try {
    const url = `http://127.0.0.1:5000/api/v1${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (currentToken) {
      defaultHeaders['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Show success notification
 * @param {string} message - Success message
 */
const showSuccess = function (message) {
  if (notyf) {
    notyf.success(message);
  } else {
    alert(message); // Fallback
  }
};

/**
 * Show error notification
 * @param {string} message - Error message
 */
const showError = function (message) {
  if (notyf) {
    notyf.error(message);
  } else {
    alert(message); // Fallback
  }
};

/**
 * Show info notification
 * @param {string} message - Info message
 */
const showInfo = function (message) {
  if (notyf) {
    notyf.open({
      type: 'info',
      message: message,
    });
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
const debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format date for display
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
const formatDate = function (dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Export utilities for use in other files
if (typeof window !== 'undefined') {
  window.AppUtils = {
    authenticate,
    apiRequest,
    showSuccess,
    showError,
    showInfo,
    isValidEmail,
    debounce,
    formatDate,
  };
}
