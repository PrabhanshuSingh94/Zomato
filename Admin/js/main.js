

$(document).ready(function() {
    

    // Check if user is logged in (for dashboard pages)
    if ($(".main-dashboard")) {
        
        $.ajax({
            url: 'controller/AdminController.php?action=getRestroName',
            method:'GET',
            cache: false,
            success: function(response){
                response =  JSON.parse(response);
                if(response.status === 'success'){
                    $('.restaurantNameDisplay').text(response.message);
                }
                else{
                    console.log('response is : ',response.message);
                    window.location.href = "login.html";
                }
            }
        });
    }

    // Logout functionality
    $(".logoutBtn").click(function() {
        $.ajax({
            
            url:'controller/AdminController.php?action=logOut',
            method:'GET',
            cache:false,
            success: function(response){
                response = JSON.parse(response);
                if(response.status === 'success'){
                    window.location.href = 'login.html';
                }
                else{
                    window.location.href = "login.html";
                }
            }
        })
    });

    // Toggle sidebar on mobile
    $("#sidebarToggle").click(function() {
        $(".sidebar").toggleClass("show");
    });

    
    
    
    

    // Helper functions
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

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    

        
});
