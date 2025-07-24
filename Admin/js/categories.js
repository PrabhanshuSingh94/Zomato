$(document).ready(function() {
    $.ajax({
        url: 'controller/AdminController.php?action=fetchRequests',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // Check if 'data' exists and is an array
            if (data.status === 'success' && data.data.length > 0) {
                let tableHTML = `
                    <table class="table table-bordered table-hover">
                        <thead class="thead-dark">
                            <tr>
                                <th>Email</th>
                                <th>GSTIN</th>
                                <th>FSSAI License</th>
                                <th>PAN Number</th>
                                <th>Shop License</th>
                                <th>Trade License</th>
                                <th>Created Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
    
                data.data.forEach((restaurant) => {
                    tableHTML += `
                        <tr>
                            <td>${restaurant.email}</td>
                            <td>${restaurant.gstin}</td>
                            <td>${restaurant.fssai_license}</td>
                            <td>${restaurant.pan_number}</td>
                            <td>${restaurant.shop_license}</td>
                            <td>${restaurant.trade_license}</td>
                            <td>${restaurant.created_at}</td>
                            <td>
                                <i class="fas fa-check text-success approveBtn" data-email="${restaurant.email}" title="Approve" style="cursor:pointer; margin-right:10px;"></i>
                                <i class="fas fa-times text-danger rejectBtn" data-email="${restaurant.email}" title="Reject" style="cursor:pointer;"></i>
                            </td>
                        </tr>
                    `;
                });
    
                tableHTML += `</tbody></table>`;
                $('#categoriesList').html(tableHTML);
            } else {
                $('#categoriesList').html('<p>No pending requests found.</p>');
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.error("AJAX Error Details:");
            console.error("Status: " + textStatus);
            console.error("Error: " + errorThrown);
            console.error("Response: " + xhr.responseText);
            $('#categoriesList').html('<p>Error fetching data.</p>');
        }
    });
    
    // Event delegation for dynamically created buttons
    $(document).on('click', '.approveBtn', function () {
        const email = $(this).data('email');
        updateStatus(email, 'approved');
    });
    
    $(document).on('click', '.rejectBtn', function () {
        const email = $(this).data('email');
        updateStatus(email, 'rejected');
    });
    
    function updateStatus(email, status) {
        $.ajax({
            url: 'controller/AdminController.php?action=updateStatus',
            method: 'POST',
            dataType: 'json',
            data: { email: email, status: status },
            success: function (response) {
                if(response.status == 'success'){
                    showToast(`Request ${status} successfully.`);
                    setTimeout(function() {
                        location.reload();
                    }, 2000);
                    
                }
                else{
                    console.log("Unable to update the status: "+response.message);
                }
                
            },
            error: function () {
                alert('Error updating status.');
            }
        });
    }
    


    // ---------- SHOW TOAST ----------
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

    // ---------- HELPER FUNCTIONS ----------
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});