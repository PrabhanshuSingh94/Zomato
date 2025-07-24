$(document).ready(function() {
    // Load orders when page loads
    loadOrders();
    
    // Toggle between order tabs
    $(".order-tab").click(function() {
        const target = $(this).data("target");
        
        $(".order-tab").removeClass("active");
        $(this).addClass("active");
        
        $(".order-container").hide();
        $("#" + target).fadeIn();
    });
    
    // Function to load orders from server
    function loadOrders() {
        $.ajax({
            url: 'controller/RestaurantController.php?action=getOrders',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status == 'success') {
                    // Clear existing orders
                    $("#newOrders").empty();
                    $("#processingOrders").empty();
                    $("#completedOrders").empty();
                    $("#cancelledOrders").empty();
                    // Add orders to respective containers
                    response.orders.forEach(function(order) {
                        let statusContainer;
                        let orderStatus = order.status;
                        
                        // Map backend status to frontend container
                        switch(orderStatus) {
                            case 'ordered':
                                statusContainer = "#newOrders";
                                break;
                            case 'preparing':
                                statusContainer = "#processingOrders";
                                break;
                            case 'delivered':
                                statusContainer = "#completedOrders";
                                break;
                            case 'cancelled':
                                statusContainer = "#cancelledOrders";
                                break;
                            default:
                                statusContainer = "#newOrders";
                        }
                        
                        const orderCard = createOrderCard(order);
                        $(statusContainer).append(orderCard);
                    });
                    
                    // Attach event handlers to new elements
                    attachOrderEventHandlers();
                    
                    // Update counters
                    updateOrderCounters();
                } else {
                    showToast("Failed to load orders: " + response.message, "error");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading orders:", error);
                showToast("Failed to load orders. Please try again.", "error");
            }
        });
    }
    
    // Function to attach event handlers to order elements
    function attachOrderEventHandlers() {
        // Accept order (change from ordered to preparing)
        $(".accept-order").off().click(function() {
            const orderId = $(this).data("id");
            
            updateOrderStatus(orderId, "preparing");
        });
        
        // Reject/Cancel order
        $(".reject-order").off().click(function() {
            const orderId = $(this).data("id");
            updateOrderStatus(orderId, "cancelled");
        });
        
        // Complete order (change from preparing to delivered)
        $(".complete-order").off().click(function() {
            const orderId = $(this).data("id");
            updateOrderStatus(orderId, "delivered");
        });
        
        // View order details
        $(".view-order").off().click(function() {
            const orderId = $(this).data("id");
            getOrderDetailsFromServer(orderId);
        });
    }
    
    // Update order status function using AJAX
    function updateOrderStatus(orderId, newStatus) {
        // Display loading indicator
        $.ajax({
            url: 'controller/RestaurantController.php?action=updateOrderStatus',
            type: 'POST',
            data: {
                order_id: orderId,
                status: newStatus
            },
            dataType: 'json',
            success: function(response) {
                if (response.status == 'success') {
                    // Remove from current container
                    const orderCard = $(`#${orderId}`);
                    orderCard.fadeOut(function() {
                        $(this).remove();
                        
                        // Update card and add to appropriate container
                        const updatedCard = createOrderCard(response.order);
                        
                        // Add to appropriate container based on status
                        let targetContainer;
                        switch(newStatus) {
                            case 'preparing':
                                targetContainer = "#processingOrders";
                                break;
                            case 'delivered':
                                targetContainer = "#completedOrders";
                                break;
                            case 'cancelled':
                                targetContainer = "#cancelledOrders";
                                break;
                            default:
                                targetContainer = "#newOrders";
                        }
                        
                        $(targetContainer).prepend(updatedCard);
                        $(updatedCard).hide().fadeIn();
                        
                        // Reattach event handlers
                        attachOrderEventHandlers();
                        
                        // Update counters
                        updateOrderCounters();
                        
                        showToast(`Order #${orderId.replace("order", "")} has been ${getStatusDisplayName(newStatus)}!`, "success");
                    });
                } else {
                    console.log(response.message);
                    showToast("Failed to update order: " + response.message, "error");
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error Response:", xhr.responseText);  // Full raw response
                console.error("Status:", status);                         // e.g., "error"
                console.error("Error thrown:", error);                    // Specific error string
                showToast("Failed to update order. Please try again.", "error");
            }
            
        });
    }
    
    // Get order details from server
    function getOrderDetailsFromServer(orderId) {
        $.ajax({
            url: 'controller/RestaurantController.php?action=getOrderDetails',
            type: 'POST',
            data: {
                order_id: orderId
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    displayOrderDetails(response.order);
                } else {
                    showToast("Failed to get order details: " + response.message, "error");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error getting order details:", error);
                showToast("Failed to get order details. Please try again.", "error");
            }
        });
    }
    
    // Display order details in modal
    function displayOrderDetails(orderDetails) {
        $("#detailsCustomerName").text(orderDetails.customer_name);
        $("#detailsOrderId").text(orderDetails.order_id);
        $("#detailsOrderTime").text(orderDetails.order_time);
        $("#detailsOrderStatus").text(getStatusDisplayName(orderDetails.status));
        $("#detailsOrderStatus").removeClass().addClass(`status-badge ${getStatusClass(orderDetails.status)}`);
        
        // Populate items
        $("#orderItemsList").empty();
        orderDetails.items.forEach(function(item) {
            $("#orderItemsList").append(`
                <tr>
                    <td>${item.dish_name}</td>
                    <td>${item.quantity}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>$${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                </tr>
            `);
        });
        
        $("#detailsSubtotal").text(`$${parseFloat(orderDetails.subtotal).toFixed(2)}`);
        $("#detailsTax").text(`$${parseFloat(orderDetails.tax).toFixed(2)}`);
        $("#detailsTotal").text(`$${parseFloat(orderDetails.total).toFixed(2)}`);
        $("#detailsAddress").text(orderDetails.delivery_address);
        $("#detailsPhone").text(orderDetails.phone);
        
        $("#orderDetailsModal").modal("show");
    }
    
    // Update order counter badges
    function updateOrderCounters() {
        $("#newOrdersCount").text($("#newOrders .order-card").length);
        $("#processingOrdersCount").text($("#processingOrders .order-card").length);
        $("#completedOrdersCount").text($("#completedOrders .order-card").length);
        $("#cancelledOrdersCount").text($("#cancelledOrders .order-card").length);
    }
    
    // Create order card HTML
    function createOrderCard(order) {
        let actionButtons = '';
        let statusClass = getStatusClass(order.status);
        let displayStatus = getStatusDisplayName(order.status);
        
        if (order.status === "ordered") {
            actionButtons = `
                <button class="btn btn-sm btn-success btn-action accept-order" data-id="${order.cart_id}">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn btn-sm btn-danger btn-action reject-order" data-id="${order.cart_id}">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else if (order.status === "preparing") {
            actionButtons = `
                <button class="btn btn-sm btn-success btn-action complete-order" data-id="${order.cart_id}">
                    <i class="fas fa-check-double"></i> Complete
                </button>
                <button class="btn btn-sm btn-danger btn-action reject-order" data-id="${order.cart_id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        }
        
        return `
            <div class="card order-card ${statusClass} mb-3" id="${order.cart_id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="mb-0">Order #${order.cart_id}</h6>
                            <small class="text-muted">${order.order_time}</small>
                        </div>
                        <div class="col-md-3">
                            <h6 class="mb-0">${order.customer_name}</h6>
                            <small class="text-muted">${order.items_count} item(s)</small>
                        </div>
                        <div class="col-md-2">
                            <h6 class="mb-0">$${parseFloat(order.total).toFixed(2)}</h6>
                        </div>
                        <div class="col-md-2">
                            <span class="status-badge ${statusClass}">
                                ${displayStatus}
                            </span>
                        </div>
                        <div class="col-md-2 action-buttons">
                            ${actionButtons}
                            <button class="btn btn-sm btn-outline-primary btn-action view-order" data-id="${order.cart_id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper function for toast notifications
    function showToast(message, type = "info") {
        const toastId = "toast" + new Date().getTime();
        let toastHTML = `
            <div class="toast ${type} mb-3" id="${toastId}" role="alert">
                <div class="toast-header">
                    <strong class="me-auto">Happy Customer</strong>
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
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper function to get proper status class for CSS
    function getStatusClass(status) {
        switch(status) {
            case 'ordered':
                return 'new';
            case 'preparing':
                return 'processing';
            case 'delivered':
                return 'completed';
            case 'cancelled':
                return 'cancelled';
            default:
                return status;
        }
    }
    
    // Helper function to get display name for status
    function getStatusDisplayName(status) {
        switch(status) {
            case 'ordered':
                return 'New Order';
            case 'preparing':
                return 'Preparing';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return capitalizeFirstLetter(status);
        }
    }
    
    // Refresh orders every 10 seconds
    setInterval(loadOrders, 10000);
});