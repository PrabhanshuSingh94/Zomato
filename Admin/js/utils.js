
/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info, warning)
 */
function showToast(message, type = "info") {
    const toastId = "toast" + new Date().getTime();
    let toastHTML = `
        <div class="toast ${type} mb-3" id="${toastId}" role="alert">
            <div class="toast-header">
                <strong class="me-auto">${capitalizeFirstLetter(type)}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    // Check if toast container exists, if not create it
    if ($(".toast-container").length === 0) {
        $("body").append('<div class="toast-container"></div>');
    }
    
    // Add toast to container
    $(".toast-container").append(toastHTML);
    
    // Initialize and show toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId));
    toastElement.show();
    
    // Remove toast after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates a phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if phone is valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}
