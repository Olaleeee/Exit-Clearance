// security.js (refactored)
'use strict';

let securityToken = null;
let securityForms = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeSecurityPage();
});

/**
 * Initialize security page
 */
async function initializeSecurityPage() {
  try {
    // Authenticate as security
    securityToken = await AppUtils.authenticate('security');

    // Load exit forms
    await loadSecurityForms();

    // Setup search functionality
    setupSearch();

    // Setup logout
    setupLogout();
  } catch (error) {
    console.error('Security page initialization failed:', error);
    AppUtils.showError('Failed to load security page');
  }
}

/**
 * Load forms for security view
 */
async function loadSecurityForms() {
  try {
    const data = await AppUtils.apiRequest('/users/forms');
    securityForms = data.data.forms;

    // Render forms
    renderSecurityForms();
  } catch (error) {
    AppUtils.showError('Failed to load forms: ' + error.message);
  }
}

/**
 * Render forms in security view
 */
function renderSecurityForms(filteredForms = null) {
  const formsToRender = filteredForms || securityForms;
  const container = document.getElementById('exitFormsTable');

  if (!container) return;

  // Clear existing content (except header)
  const existingRows = container.querySelectorAll('.new-row');
  existingRows.forEach((row) => row.remove());

  if (formsToRender.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No forms found';
    container.appendChild(noResults);
    return;
  }

  // Add form rows
  formsToRender.forEach((form) => {
    const row = createSecurityFormRow(form);
    container.appendChild(row);
  });
}

/**
 * Create security form row
 */
function createSecurityFormRow(form) {
  const row = document.createElement('div');
  const reasonCol = document.querySelector('.reason-col');
  row.className = 'new-row';
  row.dataset.id = form.form.email || '';

  const formData = form.form;
  const isShowReason = formData.status.toLowerCase() === 'rejected';

  if (reasonCol) {
  }
  reasonCol.style.display = `${isShowReason ? 'block' : 'none'}`;

  console.log(formData.reason);

  row.innerHTML = `
        <p>${formData.email || 'N/A'}</p>
        <p>${formData.fullName || 'N/A'}</p>
        <p>${formData.hostel || 'N/A'}</p>
        <p>${formData.roomNo || 'N/A'}</p>
        <p>${formData.purpose || 'N/A'}</p>
        <p>${AppUtils.formatDate(formData.date) || 'N/A'}</p>
        <p class="status status-${formData.status?.toLowerCase() || 'pending'}">
            ${formData.status || 'Pending'}
        </p>
       ${isShowReason ? `<p>${formData.reason}</p>` : ''}
        <p>${formData.parentNo ? '0' + formData.parentNo : 'N/A'}</p>
    `;

  return row;
}

/**
 * Setup search functionality
 */
function setupSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  const debouncedSearch = AppUtils.debounce(handleSearch, 300);
  searchInput.addEventListener('input', debouncedSearch);
}

/**
 * Handle search input
 */
function handleSearch(event) {
  const searchTerm = event.target.value.trim().toLowerCase();

  if (!searchTerm) {
    renderSecurityForms(); // Show all forms
    return;
  }

  const filteredForms = securityForms.filter((form) => {
    const email = form.form.email?.toLowerCase() || '';
    const name = form.form.fullName?.toLowerCase() || '';

    return email.includes(searchTerm) || name.includes(searchTerm);
  });

  renderSecurityForms(filteredForms);
}

/**
 * Setup logout functionality
 */
function setupLogout() {
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        AppUtils.showSuccess('Logged out successfully');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      }
    });
  }
}
