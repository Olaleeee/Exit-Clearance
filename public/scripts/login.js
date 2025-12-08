// login.js (refactored)
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const passwordToggle = document.querySelector('.password-toggle');
  const emailInput = document.querySelector('.email');

  // Restore saved email if exists
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail && emailInput) {
    // emailInput.value = savedEmail;
    console.log(savedEmail);
  }

  // Toggle password visibility
  if (passwordToggle) {
    passwordToggle.addEventListener('click', function () {
      const passwordInput = document.querySelector('.password');
      const icon = this.querySelector('i');

      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Handle form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('.email').value.trim();
  const password = document.querySelector('.password').value.trim();
  const role = document.querySelector('.role').value;
  const rememberMe = document.getElementById('remember')?.checked;

  // Basic validation
  if (!email || !password || !role) {
    AppUtils.showError('Please fill in all fields');
    return;
  }

  if (!AppUtils.isValidEmail(email)) {
    AppUtils.showError('Please enter a valid email address');
    return;
  }

  try {
    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    // Make login request
    const data = await AppUtils.apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    // Store token
    localStorage.setItem('token', data.data.token);

    // Show success message
    AppUtils.showSuccess('Login successful! Redirecting...');

    // Redirect based on role
    setTimeout(() => {
      let redirectPage = 'login.html';

      switch (role) {
        case 'student':
          redirectPage = 'exit.html';
          break;
        case 'admin':
          redirectPage = 'admin.html';
          break;
        case 'security':
          redirectPage = 'Security.html';
          break;
      }

      window.location.href = redirectPage;
    }, 1500);
  } catch (error) {
    AppUtils.showError(error.message || 'Login failed. Please try again.');
  }
}
