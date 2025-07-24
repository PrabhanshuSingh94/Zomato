$(document).ready(function () {
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
  }

  function validatePasswords(pass, confirmPass) {
    return pass === confirmPass;
  }

  function showError(id, message) {
    $(`#${id}Error`).text(message);
  }

  function clearErrors() {
    $('.error-text').text('');
  }

  // Input event listener to validate only the specific field being typed in
  $('#signupForm input').on('input', function () {
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const phone = $('#phone').val().trim();
    const password = $('#password').val().trim();
    const confirmPassword = $('#confirmPassword').val().trim();

    // Validate specific field based on which field is being typed into
    if ($(this).attr('id') === 'name') {
      showError('name', name.length < 3 ? 'Name must be at least 3 characters.' : '');
    }
    if ($(this).attr('id') === 'email') {
      showError('email', !validateEmail(email) ? 'Enter a valid email.' : '');
    }
    if ($(this).attr('id') === 'phone') {
      showError('phone', !validatePhone(phone) ? 'Phone must be 10 digits.' : '');
    }
    if ($(this).attr('id') === 'password') {
      showError('password', password.length < 6 ? 'Password must be at least 6 characters.' : '');
    }
    if ($(this).attr('id') === 'confirmPassword') {
      showError('confirmPassword', !validatePasswords(password, confirmPassword) ? 'Passwords do not match.' : '');
    }
  });

  // Form submission event
  $('#signupForm').on('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Clear any previous errors and validate all fields
    clearErrors();
    $('#signupForm input').trigger('input');

    // Check if there are any validation errors
    const errorsExist = $('.error-text').filter(function () {
      return $(this).text().trim() !== '';  // If error message is not empty
    }).length > 0;

    // If no errors exist, proceed with AJAX form submission
    if (!errorsExist) {
      const formData = {
        name: $('#name').val().trim(),
        email: $('#email').val().trim(),
        phone: $('#phone').val().trim(),
        password: $('#password').val().trim(),
        address:"hello"
      };
      $('#loader').show();

      $.ajax({
        
        url: '../controller/CustomerController.php?action=signup',
        type: 'POST',
        cache: false,
        data: formData,
        dataType: 'json',
        success: function (response) {
            if (response.status === 'success') {
              $('#loader').hide();

              console.log(response.message);

                window.location.href = 'signin'; 
            } else {
              $('#loader').hide();

                $('#responseMessage').text(response.message).css('color', 'red');
                console.log("Error msg"+response.message);
                //showToast(response.message);
            }
        },
        error: function (xhr, status, error) {
          $('#loader').hide();

            console.error("AJAX Error:", error);
            // $('#responseMessage').text('Something went wrong. Please try again.').css('color', 'red');
            // console.log(response.message);
            console.log("Full response:", xhr.responseText); 

        }
    });
    
    }
  });

});
