
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('registrationForm');
            const successMessage = document.getElementById('successMessage');
            
            // Input fields
            const gstinInput = document.getElementById('gstin');
            const fssaiInput = document.getElementById('fssai');
            const panInput = document.getElementById('pan');
            const shopActInput = document.getElementById('shopAct');
            const tradeLicenseInput = document.getElementById('tradeLicense');
            
            // Error messages
            const gstinError = document.getElementById('gstinError');
            const fssaiError = document.getElementById('fssaiError');
            const panError = document.getElementById('panError');
            const shopActError = document.getElementById('shopActError');
            const tradeLicenseError = document.getElementById('tradeLicenseError');

            // Validation patterns
            const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            const fssaiPattern = /^[0-9]{14}$/;
            const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            
            // Real-time validation
            gstinInput.addEventListener('input', function() {
                validateInput(this, gstinPattern, gstinError, 'Please enter a valid 15-character GSTIN.');
            });
            
            fssaiInput.addEventListener('input', function() {
                validateInput(this, fssaiPattern, fssaiError, 'Please enter a valid 14-digit FSSAI license number.');
            });
            
            panInput.addEventListener('input', function() {
                validateInput(this, panPattern, panError, 'Please enter a valid 10-character PAN number.');
            });
            
            shopActInput.addEventListener('input', function() {
                validateNonEmptyInput(this, shopActError, 'Shop Act License Number cannot be empty if provided.');
            });
            
            tradeLicenseInput.addEventListener('input', function() {
                validateNonEmptyInput(this, tradeLicenseError, 'Trade License Number cannot be empty if provided.');
            });

            // Form submission
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Validate mandatory fields
                let isValid = true;
                
                if (!validateInput(gstinInput, gstinPattern, gstinError, 'Please enter a valid 15-character GSTIN.')) {
                    isValid = false;
                }
                
                if (!validateInput(fssaiInput, fssaiPattern, fssaiError, 'Please enter a valid 14-digit FSSAI license number.')) {
                    isValid = false;
                }
                
                if (!validateInput(panInput, panPattern, panError, 'Please enter a valid 10-character PAN number.')) {
                    isValid = false;
                }
                
                // For non-mandatory fields, only validate if they are not empty
                if (shopActInput.value.trim() !== '' && 
                    !validateNonEmptyInput(shopActInput, shopActError, 'Shop Act License Number cannot be empty if provided.')) {
                    isValid = false;
                }
                
                if (tradeLicenseInput.value.trim() !== '' && 
                    !validateNonEmptyInput(tradeLicenseInput, tradeLicenseError, 'Trade License Number cannot be empty if provided.')) {
                    isValid = false;
                }
                
                if (isValid) {
                    $('#loader').show();
                    $.ajax({
                        url:'controller/RestaurantController.php?action=submitDoc',
                        method:'POST',
                        cache: false,
                        dataType:'json',
                        data:{
                            gstin: gstinInput.value,
                            fssai: fssaiInput.value,
                            pan: panInput.value,
                            shopAct: shopActInput.value,
                            tradeLicense: tradeLicenseInput.value
                        },
                        success: function(response){
                            if(response.status == 'success'){
                                $('#loader').hide();
                                console.log("Response Submitted");
                                window.location.href = 'adminResponse';

                            }
                            else{
                                $('#loader').hide();
                                console.log("Something happend wrong");
                            }
                            
                        },
                        error: function(xhr, status, error){
                            $('#loader').hide();
                            console.log("AJAX error:", status, error);
                            console.log("Response text:", xhr.responseText);
                        }
                    })
                    
                }
            });

            // Validation functions
            function validateInput(inputElement, pattern, errorElement, errorMessage) {
                const value = inputElement.value.trim();
                const isValid = pattern.test(value);
                const validIcon = inputElement.parentElement.querySelector('.valid-icon');
                const invalidIcon = inputElement.parentElement.querySelector('.invalid-icon');
                
                if (value === '') {
                    errorElement.textContent = 'This field is required.';
                    errorElement.style.display = 'block';
                    validIcon.style.display = 'none';
                    invalidIcon.style.display = 'none';
                    return false;
                } else if (!isValid) {
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                    validIcon.style.display = 'none';
                    invalidIcon.style.display = 'block';
                    return false;
                } else {
                    errorElement.style.display = 'none';
                    validIcon.style.display = 'block';
                    invalidIcon.style.display = 'none';
                    return true;
                }
            }
            
            function validateNonEmptyInput(inputElement, errorElement, errorMessage) {
                const value = inputElement.value.trim();
                const validIcon = inputElement.parentElement.querySelector('.valid-icon');
                const invalidIcon = inputElement.parentElement.querySelector('.invalid-icon');
                
                // If the field is optional and empty, it's valid
                if (value === '') {
                    errorElement.style.display = 'none';
                    validIcon.style.display = 'none';
                    invalidIcon.style.display = 'none';
                    return true;
                }
                
                // If the field has a value, it should be valid (you can add more specific validation if needed)
                if (value.length < 3) {
                    errorElement.textContent = errorMessage;
                    errorElement.style.display = 'block';
                    validIcon.style.display = 'none';
                    invalidIcon.style.display = 'block';
                    return false;
                } else {
                    errorElement.style.display = 'none';
                    validIcon.style.display = 'block';
                    invalidIcon.style.display = 'none';
                    return true;
                }
            }
        });