$(document).ready(function () {
    // Function to fetch and update order status
    function fetchOrderStatus() {
        $.ajax({
            url: '../controller/CustomerController.php?action=getOrderStatus',
            type: 'POST',
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    const currentStatus = response.orderStatus;
                    // Update based on status without removing previous ones
                    if (currentStatus === 'ordered') {
                        $('.delivery-place').eq(0).text('Ordered');
                    } else if (currentStatus === 'preparing') {
                        $('.delivery-place').eq(1).text('Cooking at Restaurant');
                    } else if (currentStatus === 'delivered') {
                        $('.delivery-place').eq(2).text('Delivered to Address');
                        
                    }
                } else {
                    console.log('Error: ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', error);
            }
        });
    }

    // Fetch initially
    fetchOrderStatus();

    // Optional: Keep polling every 5 seconds
    setInterval(fetchOrderStatus, 10000);
});