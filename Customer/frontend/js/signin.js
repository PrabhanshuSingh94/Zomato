$(document).ready(function () {
  // Email validation function
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Show error message for a specific field
  function showError(id, message) {
    $(`#${id}Error`).text(message);
  }

  // Real-time validation for email and password fields
  $('#loginForm input').on('input', function () {
    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val().trim();

    if ($(this).attr('id') === 'loginEmail') {
      showError('loginEmail', !validateEmail(email) ? 'Enter a valid email.' : '');
    }

    if ($(this).attr('id') === 'loginPassword') {
      showError('loginPassword', password.length < 1 ? 'Please enter password.' : '');
    }
  });

  // Form submission
  $('#loginForm').on('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    // Trigger validation for all inputs
    $('#loginForm input').trigger('input');

    // Check if any validation errors exist
    const hasErrors = $('.error-text').filter(function () {
      return $(this).text().trim() !== '';
    }).length > 0;

    if (hasErrors) return;

    // Collect values
    const email = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val().trim();

    // Send AJAX POST request
    console.log("clicked");
    $.ajax({
      url: '../controller/CustomerController.php?action=signin',
      type: 'POST',
      cache:false,
      data: {
        email: email,
        password: password
      },
      dataType: 'json', // Expect JSON response
      success: function (res) {
        if (res.status === 'success') {
          window.location.href = 'index'; // Redirect on success
        } else {
          $('#responseMessage').text(res.message).css('color', 'red');
        }
      },
      error: function () {

        $('#responseMessage').text('An error occurred. Please try again.').css('color', 'red');
      }
    });
  });
});
