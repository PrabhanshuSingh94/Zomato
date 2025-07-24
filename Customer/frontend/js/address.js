$(document).ready(function() {
    $.ajax({
        url: '../controller/CustomerController.php?action=getAddress',
        type: 'POST',
        dataType: 'json',
        success: function(response) {
            if (response.status == 'success') {
                $('.address-details h6:first').text(response.address);
                $('.phone-number').text(response.phone);
            } else {
                console.log(response.message);
            }
        },
        error: function(xhr, status, error) {
            console.log('AJAX Error:', error);
        }
    });
});