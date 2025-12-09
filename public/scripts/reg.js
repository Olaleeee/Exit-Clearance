// reg.js (refactored)
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initializeRegistrationPage();
});

/**
 * Initialize registration page
 */
function initializeRegistrationPage() {
  const registerForm = document.querySelector('.registration-form');

  // Setup registration form
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }

  // Setup form validation
  setupFormValidation();
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  if (passwordInput && confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function () {
      if (this.value !== passwordInput.value) {
        this.setCustomValidity('Passwords do not match');
      } else {
        this.setCustomValidity('');
      }
    });
  }
}

/**
 * Handle registration form submission
 */
async function handleRegistration(event) {
  event.preventDefault();
  
  const btnSignup = document.querySelector('button.submit');
  const makeVisible = function (isVisible) {
  if(!btnSignup) return;
  if (!isVisible) {
    btnSignup.style.pointerEvents = 'none';
    btnSignup.innerHTML = '...loading';
  }
  if (isVisible) {
    btnSignup.style.pointerEvents = 'none';
    btnSignup.innerHTML = 'login';
  }
};

  // Collect form data
  const formData = {
    firstName: document.getElementById('Fn').value.trim(),
    lastName: document.getElementById('Ln').value.trim(),
    email: document.getElementById('email').value.trim(),
    number: document.getElementById('no').value.trim(),
    password: document.getElementById('password').value.trim(),
    passwordConfirm: document.getElementById('confirmPassword').value.trim(),
    role: document.getElementById('role').value,
  };

  // Validate form data
  if (!validateRegistrationData(formData)) {
    return;
  }

  try {
     //disable btn
    makeVisible(false);
    
    // Make registration request
    const data = await AppUtils.apiRequest('/users/signup', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

     //activate btn
    makeVisible(true);
    
    // Show success message
    const redirectRole = formData.role.toLowerCase();
    AppUtils.showSuccess(
      `Registration successful! Redirecting to ${redirectRole} portal...`
    );

    // Redirect based on role
    setTimeout(() => {
      let redirectPage = 'login.html';

      if (redirectRole === 'student') {
        redirectPage = 'login.html'; // Students go to login
      } else if (redirectRole === 'admin') {
        redirectPage = 'admin.html';
      } else if (redirectRole === 'security') {
        redirectPage = 'Security.html';
      }

      window.location.href = redirectPage;
    }, 1500);
  } catch (error) {
      //activate btn
    makeVisible(true);
    AppUtils.showError(error.message || 'Registration failed');
  }
}

/**
 * Validate registration data
 */
function validateRegistrationData(data) {
  // Check required fields
  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'password',
    'passwordConfirm',
    'role',
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      AppUtils.showError(
        `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      );
      return false;
    }
  }

  // Validate email
  if (!AppUtils.isValidEmail(data.email)) {
    AppUtils.showError('Please enter a valid email address');
    return false;
  }

  // Validate password match
  if (data.password !== data.passwordConfirm) {
    AppUtils.showError('Passwords do not match');
    return false;
  }

  // Validate password strength
  if (data.password.length < 8) {
    AppUtils.showError('Password must be at least 8 characters long');
    return false;
  }

  // Validate phone number (if provided)
  if (data.number && !/^\d{10,15}$/.test(data.number)) {
    AppUtils.showError('Please enter a valid phone number (10-15 digits)');
    return false;
  }

  return true;
}


