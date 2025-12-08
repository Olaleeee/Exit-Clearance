// admin.js (refactored)
'use strict';

let adminToken = null;
let exitForms = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeAdminPage();
});

/**
 * Initialize admin page
 */
async function initializeAdminPage() {
  try {
    // Authenticate as admin
    adminToken = await AppUtils.authenticate('admin');

    // Load exit forms
    await loadExitForms();
  } catch (error) {
    console.error('Admin page initialization failed:', error);
    AppUtils.showError('Failed to load admin page');
  }
}

/**
 * Load exit forms from API
 */
async function loadExitForms() {
  try {
    const data = await AppUtils.apiRequest('/users/forms');
    exitForms = data.data.forms;

    // Render forms table
    renderExitFormsTable();
  } catch (error) {
    AppUtils.showError('Failed to load exit forms: ' + error.message);

    // Retry after 5 seconds if failed
    setTimeout(loadExitForms, 5000);
  }
}

/**
 * Render exit forms table
 */
function renderExitFormsTable() {
  const tableBody = document
    .getElementById('exitFormsTable')
    ?.querySelector('tbody');
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = '';

  if (exitForms.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML =
      '<td colspan="10" class="text-center">No exit forms found</td>';
    tableBody.appendChild(emptyRow);
    return;
  }

  // Create rows for each form
  exitForms.forEach((form, index) => {
    const row = createFormRow(form, index);
    tableBody.appendChild(row);
  });
}

/**
 * Create table row for a form
 */
function createFormRow(form, index) {
  const row = document.createElement('tr');
  const formData = form.form;

  row.innerHTML = `
        <td>${formData.email || 'N/A'}</td>
        <td>${formData.fullName || 'N/A'}</td>
        <td>${formData.hostel || 'N/A'}</td>
        <td>${formData.roomNo || 'N/A'}</td>
        <td>${formData.purpose || 'N/A'}</td>
        <td>${AppUtils.formatDate(formData.date) || 'N/A'}</td>
        <td class="status status-${
          formData.status?.toLowerCase() || 'pending'
        }">
            ${formData.status || 'Pending'}
        </td>
        <td>${formData.reason || '—'}</td>
        <td>${formData.parentNo ? '0' + formData.parentNo : 'N/A'}</td>
        <td class="action-buttons">
            <button onclick="approveForm('${formData.email}')" 
                    class="btn-approve"
                    ${formData.status === 'Rejected' ? 'disabled' : ''}
                    ${formData.status === 'Approved' ? 'disabled' : ''}>
                Approve
            </button>
            <button onclick="showRejectDialog('${formData.email}')" 
                    class="btn-reject"
                    ${formData.status === 'Rejected' ? 'disabled' : ''}
                    ${formData.status === 'Approved' ? 'disabled' : ''}>
                Reject
            </button>
        </td>
    `;

  return row;
}

/**
 * Approve an exit form
 */
async function approveForm(email) {
  if (!email) {
    AppUtils.showError('Invalid form selection');
    return;
  }

  try {
    await updateFormStatus(email, 'Approved', '');
    AppUtils.showSuccess('Form approved successfully');
    await loadExitForms(); // Refresh the table
  } catch (error) {
    AppUtils.showError('Failed to approve form: ' + error.message);
  }
}

/**
 * Show reject reason dialog
 */
function showRejectDialog(email) {
  const reason = prompt('Please enter the reason for rejection:');

  if (reason === null) {
    return; // User cancelled
  }

  if (!reason || reason.trim().length < 5) {
    AppUtils.showError('Please provide a valid reason (minimum 5 characters)');
    return;
  }

  rejectForm(email, reason.trim());
}

/**
 * Reject an exit form
 */
async function rejectForm(email, reason) {
  try {
    await updateFormStatus(email, 'Rejected', reason);
    AppUtils.showSuccess('Form rejected successfully');
    await loadExitForms(); // Refresh the table
  } catch (error) {
    AppUtils.showError('Failed to reject form: ' + error.message);
  }
}

/**
 * Update form status via API
 */
async function updateFormStatus(email, status, reason) {
  if (!adminToken) {
    await AppUtils.authenticate('admin');
  }

  await AppUtils.apiRequest('/users/form-status', {
    method: 'PATCH',
    body: JSON.stringify({ email, status, reason }),
  });
}

// Make functions available globally
window.approveForm = approveForm;
window.showRejectDialog = showRejectDialog;
