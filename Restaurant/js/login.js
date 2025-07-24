
$(document).ready(function() {
    // Real-time validation for login form fields
    $("#email").on("input", validateEmail);
    $("#password").on("input", validatePassword);
    
    // Login form submission
    $("#loginFormValidation").on("submit", function(event) {
        event.preventDefault();
        
        // Validate all fields
        let isEmailValid = validateEmail();
        let isPasswordValid = validatePassword();
        
        // If all validations pass
        if (isEmailValid && isPasswordValid) {
            processLogin();
        }
    });
    
    /**
     * Validates the email field
     * @returns {boolean} True if valid
     */
    function validateEmail() {
        const email = $("#email").val().trim();
        const errorSpan = $("#email-error");
        
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
     * Validates the password field
     * @returns {boolean} True if valid
     */
    function validatePassword() {
        const password = $("#password").val();
        const errorSpan = $("#password-error");
        
        if (!password) {
            errorSpan.text("Password is required").show();
            return false;
        
        } else {
            errorSpan.text("").hide();
            return true;
        }
    }
    
    /**
     * Processes the login
     */
    function processLogin() {
        const email = $("#email").val().trim();
        const password = $("#password").val();
        // const rememberMe = $("#rememberMe").is(":checked");
        
        // Demo login - in real app, this would call an API
        
            //showToast("Login successful!", "success");
            $.ajax({
                url:'controller/RestaurantController.php?action=signin',
                method:'POST',
                cache: false,
                dataType:'json',
                data:{
                    email : email,
                    password : password
                },
                success: function(response){
                    if(response.status == 'success'){
                        console.log(response.message);
                         window.location.href = 'dashboard';
                    }
                    else if(response.status == 'pending'){
                        window.location.href = 'submitDoc';
                    }
                    else if(response.status == 'process'){
                        window.location.href = 'adminResponse';
                    }
                    else{
                        console.log(response.message);
                        showToast(response.message,"");
                    }
                },
                error: function(xhr, status, error) {
                    console.error("AJAX Error:", error);
                    console.log("Raw response:", xhr.responseText); // Look here for PHP error messages
                }
            })
            
    }
});
