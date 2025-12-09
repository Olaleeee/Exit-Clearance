// exit.js (refactored)
'use strict';

let userToken = null;
let userProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  initializePage();
  setupEventListeners();
});

/**
 * Initialize the exit form page
 */
async function initializePage() {
  try {
    // Authenticate user
    userToken = await AppUtils.authenticate('student');

    // Load user profile
    await loadUserProfile();

    // Setup form
    setupForm();
  } catch (error) {
    console.error('Page initialization failed:', error);
    AppUtils.showError('Failed to load page. Redirecting to login...');
    setTimeout(() => (window.location.href = 'login.html'), 2000);
  }
}

/**
 * Load user profile from API
 */
async function loadUserProfile() {
  try {
    const data = await AppUtils.apiRequest('/users/profile');
    userProfile = data.data.user;

    // Update UI with user data
    updateUserDisplay();
  } catch (error) {
    AppUtils.showError('Failed to load profile: ' + error.message);
    throw error;
  }
}

/**
 * Update user information in the UI
 */
function updateUserDisplay() {
  if (!userProfile) return;

  const nameElement = document.querySelector('.js-name');
  const emailElement = document.querySelector('.js-email');
  const statusElement = document.querySelector('.js-status');
  const emailInput = document.querySelector('.input-email');

  if (nameElement) {
    nameElement.textContent = `${userProfile.firstName} ${userProfile.lastName}`;
  }

  if (emailElement) {
    emailElement.textContent = userProfile.email;
  }

  if (statusElement) {
    statusElement.textContent = userProfile?.formStatus || 'Not Submitted';
    // Update status color
    console.log(userProfile);
    statusElement.className = `js-status status-${
      userProfile.formStatus?.toLowerCase() || 'pending'
    }`;
  }

  if (emailInput) {
    emailInput.value = userProfile.email;
  }
}

/**
 * Setup form event listeners
 */
function setupEventListeners() {
  const exitForm = document.getElementById('exitForm');
  const logoutButton = document.querySelector('.logout');
  const popup = document.querySelector('.popup');
  const yesButton = document.querySelector('.yes');
  const noButton = document.querySelector('.no');

  if (exitForm) {
    exitForm.addEventListener('submit', handleFormSubmit);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      popup?.classList.remove('hidden');
    });
  }

  if (yesButton) {
    yesButton.addEventListener('click', handleLogout);
  }

  if (noButton) {
    noButton.addEventListener('click', () => {
      popup?.classList.add('hidden');
    });
  }
}

/**
 * Setup form with today's date as default
 */
function setupForm() {
  const dateInput = document.querySelector('.date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today; // Can't select past dates
  }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
  event.preventDefault();

const btnSubmit = document.querySelector('button.exit-submit');
const makeVisible = function (isVisible) {
  if(!btnSubmit) return;
  if (!isVisible) {
    btnSubmit.style.pointerEvents = 'none';
    btnSubmit.style.opacity = '0.4';
    btnSubmit.innerHTML = 'Submitting...';
  }
  if (isVisible) {
    btnSubmit.style.pointerEvents = 'auto';
    btnSubmit.style.opacity = '1'
    btnSubmit.innerHTML = 'Submit';
  }
};
  
  if (!userToken) {
    AppUtils.showError('Please login again');
    window.location.href = 'login.html';
    return;
  }

  // Collect form data
  const formData = {
    email: document.querySelector('.input-email').value,
    fullName: document.querySelector('.fname').value.trim(),
    hostel: document.querySelector('.hostel').value.trim(),
    roomNo: document.querySelector('.room').value.trim(),
    whoseRequest: document.querySelector('.whose').value.trim(),
    destination: document.querySelector('.destination').value.trim(),
    purpose: document.querySelector('.Purpose').value.trim(),
    date: document.querySelector('.date').value,
    parentNo: document.querySelector('.number').value.trim(),
    status: 'Pending',
    locale: navigator.language
  };

  // Validate required fields
  const requiredFields = [
    'fullName',
    'hostel',
    'roomNo',
    'destination',
    'purpose',
    'date',
  ];
  for (const field of requiredFields) {
    if (!formData[field]) {
      AppUtils.showError(
        `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      );
      return;
    }
  }

  // Validate date is not in the past
  const selectedDate = new Date(formData.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    AppUtils.showError('Please select today or a future date');
    return;
  }

  try {
    // Submit form
      //disable btn
    makeVisible(false);
    const data = await AppUtils.apiRequest('/users/submit-form', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    makeVisible(true);
    AppUtils.showSuccess(data.message || 'Form submitted successfully!');

    // Refresh user profile to update status
    await loadUserProfile();

    // Reset form except email
    document.querySelector('.fname').value = '';
    document.querySelector('.hostel').value = '';
    document.querySelector('.room').value = '';
    document.querySelector('.whose').value = '';
    document.querySelector('.destination').value = '';
    document.querySelector('.Purpose').value = '';
    document.querySelector('.number').value = '';
  } catch (error) {
    makeVisible(true);
    AppUtils.showError(error.message || 'Failed to submit form');
  }
}

/**
 * Handle user logout
 */
function handleLogout() {
  localStorage.removeItem('token');
  AppUtils.showSuccess('Logged out successfully');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}




