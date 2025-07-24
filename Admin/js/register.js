
$(document).ready(function() {
    // Real-time validation for registration form fields
    $("#restaurantName").on("input", validateRestaurantName);
    $("#regEmail").on("input", validateEmail);
    $("#phone").on("input", validatePhone);
    $("#regPassword").on("input", validatePassword);
    $("#confirmPassword").on("input", validateConfirmPassword);
    $("#address").on("input", validateAddress);
    
    // Registration form submission
    $("#registrationFormValidation").on("submit", function(event) {
        event.preventDefault();
        
        // Validate all fields
        let isRestaurantNameValid = validateRestaurantName();
        let isEmailValid = validateEmail();
        let isPhoneValid = validatePhone();
        let isPasswordValid = validatePassword();
        let isConfirmPasswordValid = validateConfirmPassword();
        let isAddressValid = validateAddress();
        
        // If all validations pass
        if (isRestaurantNameValid && isEmailValid && isPhoneValid && 
            isPasswordValid && isConfirmPasswordValid && isAddressValid) {
            processRegistration();
        }
    });
    
    /**
     * Validates the restaurant name field
     * @returns {boolean} True if valid
     */
    function validateRestaurantName() {
        const name = $("#restaurantName").val().trim();
        const errorSpan = $("#restaurantName-error");
        
        if (!name) {
            errorSpan.text("Restaurant name is required").show();
            return false;
        } else if (name.length < 3) {
            errorSpan.text("Restaurant name must be at least 3 characters").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Validates the email field
     * @returns {boolean} True if valid
     */
    function validateEmail() {
        const email = $("#regEmail").val().trim();
        const errorSpan = $("#regEmail-error");
        
        if (!email) {
            errorSpan.text("Email is required").show();
            return false;
        } else if (!isValidEmail(email)) {
            errorSpan.text("Please enter a valid email address").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Validates the phone field
     * @returns {boolean} True if valid
     */
    function validatePhone() {
        const phone = $("#phone").val().trim().replace(/[^0-9]/g, '');
        const errorSpan = $("#phone-error");
        
        if (!phone) {
            errorSpan.text("Phone number is required").show();
            return false;
        } else if (!isValidPhone(phone)) {
            errorSpan.text("Please enter a valid 10-digit phone number").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Validates the password field
     * @returns {boolean} True if valid
     */
    function validatePassword() {
        const password = $("#regPassword").val();
        const errorSpan = $("#regPassword-error");
        
        if (!password) {
            errorSpan.text("Password is required").show();
            return false;
        } else if (password.length < 6) {
            errorSpan.text("Password must be at least 6 characters").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
            
            // Also validate confirm password in case it was already filled
            if ($("#confirmPassword").val()) {
                validateConfirmPassword();
            }
        }
    }
    
    /**
     * Validates the confirm password field
     * @returns {boolean} True if valid
     */
    function validateConfirmPassword() {
        const password = $("#regPassword").val();
        const confirmPassword = $("#confirmPassword").val();
        const errorSpan = $("#confirmPassword-error");
        
        if (!confirmPassword) {
            errorSpan.text("Confirm password is required").show();
            return false;
        } else if (password !== confirmPassword) {
            errorSpan.text("Passwords do not match").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Validates the address field
     * @returns {boolean} True if valid
     */
    function validateAddress() {
        const address = $("#address").val().trim();
        const errorSpan = $("#address-error");
        
        if (!address) {
            errorSpan.text("Address is required").show();
            return false;
        } else if (address.length < 10) {
            errorSpan.text("Please enter complete address").show();
            return false;
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Processes the registration
     */
    function processRegistration() {
        const restaurantName = $("#restaurantName").val().trim();
        const email = $("#regEmail").val().trim();
        const phone = $("#phone").val().trim();
        const password = $("#regPassword").val();
        const address = $("#address").val().trim();
        
        
        // showToast("Registration successful! You can now login.", "success");
        
        $.ajax({
            url: 'controller/RestaurantController.php?action=signup',  
            method: 'POST',
            cache: false,
            dataType: 'json',
            data: {
                name: restaurantName,
                email: email,
                phone: phone,
                password: password,
                address: address
            },
            success: function(response) {
                if (response.status === 'success') {
                    window.location.href = 'login.html';
                } else {
                    console.log(response.message);  
                    $("#regEmailError").text(response.message);  
                }
            },
            error: function(xhr, status, error) {
                console.log("Error details:");
                console.log("Status: " + status);
                console.log("Error: " + error);
                console.log("Response Text: " + xhr.responseText);
            }
        });
        

        
    }
});
