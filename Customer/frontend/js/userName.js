$(document).ready(function () {
    userName();
    $('.logout').on('click',function(){
        logOut();
    });
});

function userName() {
    $.ajax({
        url: '../controller/CustomerController.php?action=getUserName', 
        type: 'POST',
        dataType: 'json', 
        success: function (res) {
            if (res.status === 'success') {
                $('.userName').text(res.message);
            } else {
                console.log("Error: " + res.message);
                window.location.href = 'signin';
            }
        },
        error: function(xhr){
            console.log("AJAX error:", xhr.responseText);
            window.location.href = 'signin';

        }
    });
}


function logOut(){
    $.ajax({
        url: '../controller/CustomerController.php?action=logOut', 
        type: 'GET',
        success: function(res) {
            const response = JSON.parse(res); // Parse the JSON response
            if (response.status === 'success') {
                // Redirect to login page after successful logout
                window.location.href = 'signin';
            } else {
                // Handle the case where the user was already logged out
                console.log(response.message);
            }
        },
        error: function() {
            console.log('Error logging out. Please try again later.');
        }
    });
}