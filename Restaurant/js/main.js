

$(document).ready(function() {
    if ($(".main-dashboard")) {
        
        $.ajax({
            url: 'controller/RestaurantController.php?action=getRestroName',
            method:'GET',
            cache: false,
            success: function(response){
                response =  JSON.parse(response);
                if(response.status === 'success'){
                    $('#restaurantNameDisplay').text(response.message);
                    console.log(response.message+" is the name");
                }
                else{
                    console.log('response is : ',response.message);
                    window.location.href = "login";
                }
            }
        });
    }

    // Logout functionality
    $(".logoutBtn").click(function() {
        $.ajax({
            
            url:'controller/RestaurantController.php?action=logOut',
            method:'GET',
            cache:false,
            success: function(response){
                response = JSON.parse(response);
                if(response.status === 'success'){
                    window.location.href = 'login';
                }
                else{
                    window.location.href = "login";
                }
            }
        })
    });

    // Toggle sidebar on mobile
    $("#sidebarToggle").click(function() {
        $(".sidebar").toggleClass("show");
    });

    // Order Management
    if ($("#orderManagement").length > 0) {
        // Load sample orders (in real app, this would fetch from API)
        loadSampleOrders();
    
        // Toggle between order tabs
        $(".order-tab").click(function () {
            const target = $(this).data("target");
    
            $(".order-tab").removeClass("active");
            $(this).addClass("active");
    
            $(".order-container").hide();
            $("#" + target).fadeIn();
        });
    
        // Attach event handlers
        attachOrderEventHandlers();
    }
    
    
    function attachFoodEventHandlers() {
        // Delete food
        $(".delete-food").off().click(function() {
            const foodId = $(this).data("id");
            const foodName = $(this).data("name");
            
            if (confirm(`Are you sure you want to delete ${foodName}?`)) {
                $(`#${foodId}`).fadeOut(function() {
                    $(this).remove();
                    showToast("Food item deleted successfully!", "success");
                });
            }
        });
        
        // Edit food
        $(".edit-food").off().click(function() {
            const foodId = $(this).data("id");
            const foodName = $(this).data("name");
            const foodPrice = $(this).data("price");
            const foodDesc = $(this).data("desc") || "";
            const foodCategory = $(this).data("category");
            const foodImage = $(`#${foodId} img`).attr("src");
            
            $("#editFoodId").val(foodId);
            $("#editFoodName").val(foodName);
            $("#editFoodPrice").val(foodPrice);
            $("#editFoodDesc").val(foodDesc);
            $("#editFoodCategory").val(foodCategory);
            $("#editImagePreview").attr("src", foodImage).show();
            
            $("#editFoodModal").modal("show");
        });
        
        // Edit food image preview
        $("#editFoodImage").change(function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $("#editImagePreview").attr("src", e.target.result).show();
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Save edited food
    $("#saveEditFoodBtn").click(function() {
        const foodId = $("#editFoodId").val();
        const foodName = $("#editFoodName").val();
        const foodPrice = $("#editFoodPrice").val();
        const foodDesc = $("#editFoodDesc").val();
        const foodCategory = $("#editFoodCategory").val();
        const foodCategoryName = $("#editFoodCategory option:selected").text();
        const foodImage = $("#editImagePreview").attr("src");
        
        if (!foodName || !foodPrice  || !foodDesc ||!foodImage) {
            showToast("Please fill in all required fields", "error");
            return;
        }
        
        // Update UI
        $(`#${foodId} .card-title`).text(foodName);
        $(`#${foodId} .food-price`).text(`$${foodPrice}`);
        $(`#${foodId} .food-description`).text(foodDesc);
        $(`#${foodId} .category-badge`).text(foodCategoryName);
        $(`#${foodId} img`).attr("src", foodImage);
        
        // Update data attributes
        $(`#${foodId} .edit-food`).data("name", foodName);
        $(`#${foodId} .edit-food`).data("price", foodPrice);
        $(`#${foodId} .edit-food`).data("desc", foodDesc);
        $(`#${foodId} .edit-food`).data("category", foodCategory);
        $(`#${foodId} .delete-food`).data("name", foodName);
        
        $("#editFoodModal").modal("hide");
        showToast("Food item updated successfully!", "success");
    });

    function attachOrderEventHandlers() {
        // Accept order
        $(".accept-order").off().click(function() {
            const orderId = $(this).data("id");
            updateOrderStatus(orderId, "processing");
        });
        
        // Reject order
        $(".reject-order").off().click(function() {
            const orderId = $(this).data("id");
            updateOrderStatus(orderId, "cancelled");
        });
        
        // Complete order
        $(".complete-order").off().click(function() {
            const orderId = $(this).data("id");
            updateOrderStatus(orderId, "completed");
        });
        
        // View order details
        $(".view-order").off().click(function() {
            const orderId = $(this).data("id");
            const orderDetails = getOrderDetails(orderId);
            
            if (orderDetails) {
                $("#detailsCustomerName").text(orderDetails.customerName);
                $("#detailsOrderId").text(orderDetails.orderId);
                $("#detailsOrderTime").text(orderDetails.orderTime);
                $("#detailsOrderStatus").text(capitalizeFirstLetter(orderDetails.status));
                $("#detailsOrderStatus").removeClass().addClass(`status-badge ${orderDetails.status}`);
                
                // Populate items
                $("#orderItemsList").empty();
                orderDetails.items.forEach(function(item) {
                    $("#orderItemsList").append(`
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `);
                });
                
                $("#detailsSubtotal").text(`$${orderDetails.subtotal.toFixed(2)}`);
                $("#detailsTax").text(`$${orderDetails.tax.toFixed(2)}`);
                $("#detailsTotal").text(`$${orderDetails.total.toFixed(2)}`);
                $("#detailsAddress").text(orderDetails.deliveryAddress);
                $("#detailsPhone").text(orderDetails.phone);
                
                $("#orderDetailsModal").modal("show");
            }
        });
    }
    
    function updateOrderStatus(orderId, newStatus) {
        // Remove from current container
        const orderCard = $(`#${orderId}`);
        orderCard.fadeOut(function() {
            $(this).remove();
            
            // Update card and add to appropriate container
            const updatedCard = $(this);
            updatedCard.removeClass("new processing completed cancelled").addClass(newStatus);
            updatedCard.find(".status-badge").removeClass("new processing completed cancelled").addClass(newStatus);
            updatedCard.find(".status-badge").text(capitalizeFirstLetter(newStatus));
            
            // Hide buttons based on status
            updatedCard.find(".action-buttons button").show();
            
            if (newStatus === "processing") {
                updatedCard.find(".accept-order, .reject-order").hide();
            } else if (newStatus === "completed" || newStatus === "cancelled") {
                updatedCard.find(".action-buttons button").hide();
                updatedCard.find(".view-order").show();
            }
            
            // Add to appropriate container
            $(`#${newStatus}Orders`).prepend(updatedCard);
            updatedCard.fadeIn();
            
            // Update counters
            updateOrderCounters();
            
            showToast(`Order #${orderId.replace("order", "")} has been ${newStatus}!`, "success");
        });
    }
    
    function updateOrderCounters() {
        $("#newOrdersCount").text($("#newOrders .order-card").length);
        $("#processingOrdersCount").text($("#processingOrders .order-card").length);
        $("#completedOrdersCount").text($("#completedOrders .order-card").length);
        $("#cancelledOrdersCount").text($("#cancelledOrders .order-card").length);
    }

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

    // function loadSampleCategories() {
    //     const categories = getSampleCategories();
        
    //     $("#categoriesList").empty();
    //     categories.forEach(function(category) {
    //         const categoryCard = createCategoryCard(category.id, category.name);
    //         $("#categoriesList").append(categoryCard);
    //     });
        
    //     attachCategoryEventHandlers();
    // }

    // function getSampleCategories() {
    //     return [
    //         { id: "cat1", name: "Pizza" },
    //         { id: "cat2", name: "Burgers" },
    //         { id: "cat3", name: "Salads" },
    //         { id: "cat4", name: "Desserts" },
    //         { id: "cat5", name: "Beverages" }
    //     ];
    // }

    // function createCategoryCard(id, name) {
    //     return `
    //         <div class="col-md-4 mb-4" id="${id}">
    //             <div class="card category-card h-100">
    //                 <div class="card-body">
    //                     <h5 class="card-title">${name}</h5>
    //                 </div>
    //                 <div class="card-footer bg-white border-0">
    //                     <div class="d-flex justify-content-end">
    //                         <button class="btn btn-sm btn-outline-primary me-2 edit-category" data-id="${id}" data-name="${name}">
    //                             <i class="fas fa-edit"></i> Edit
    //                         </button>
    //                         <button class="btn btn-sm btn-outline-danger delete-category" data-id="${id}" data-name="${name}">
    //                             <i class="fas fa-trash"></i> Delete
    //                         </button>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     `;
    // }

    // function loadSampleFoods() {
    //     const foods = [
    //         { id: "food1", name: "Margherita Pizza", price: "12.99", desc: "Classic pizza with tomato sauce, mozzarella, and basil", category: "cat1", categoryName: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop" },
    //         { id: "food2", name: "Cheeseburger", price: "9.99", desc: "Juicy beef patty with cheese, lettuce, tomato, and special sauce", category: "cat2", categoryName: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop" },
    //         { id: "food3", name: "Greek Salad", price: "8.49", desc: "Fresh salad with tomatoes, cucumbers, olives, and feta cheese", category: "cat3", categoryName: "Salads", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop" },
    //         { id: "food4", name: "Chocolate Brownie", price: "5.99", desc: "Warm chocolate brownie with vanilla ice cream", category: "cat4", categoryName: "Desserts", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop" }
    //     ];
        
    //     $("#foodsList").empty();
    //     foods.forEach(function(food) {
    //         const foodCard = createFoodCard(food.id, food.name, food.price, food.desc, food.category, food.categoryName, food.image);
    //         $("#foodsList").append(foodCard);
    //     });
        
    //     attachFoodEventHandlers();
    // }

    function createFoodCard(id, name, price, desc, category, categoryName, image) {
        return `
            <div class="col-md-4 mb-4" id="${id}">
                <div class="card food-card h-100">
                    <img src="${image}" class="card-img-top food-image" alt="${name}">
                    <div class="card-body">
                        <span class="category-badge mb-2">${categoryName}</span>
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text food-description">${desc}</p>
                        <p class="food-price fw-bold text-primary">$${price}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-primary me-2 edit-food" 
                                data-id="${id}" 
                                data-name="${name}" 
                                data-price="${price}" 
                                data-desc="${desc}" 
                                data-category="${category}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-food" data-id="${id}" data-name="${name}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function loadSampleOrders() {
        const orders = [
            { id: "order101", customerName: "John Smith", status: "new", time: "12:35 PM", total: 29.98, items: 2 },
            { id: "order102", customerName: "Sarah Johnson", status: "new", time: "12:42 PM", total: 18.99, items: 1 },
            { id: "order103", customerName: "Mike Brown", status: "processing", time: "12:15 PM", total: 45.97, items: 3 },
            { id: "order104", customerName: "Lisa Garcia", status: "processing", time: "11:55 AM", total: 32.49, items: 2 },
            { id: "order105", customerName: "David Wilson", status: "completed", time: "11:30 AM", total: 24.99, items: 2 },
            { id: "order106", customerName: "Emma Taylor", status: "completed", time: "11:20 AM", total: 15.49, items: 1 },
            { id: "order107", customerName: "Robert Martin", status: "cancelled", time: "10:45 AM", total: 22.99, items: 2 }
        ];
        
        orders.forEach(function(order) {
            const orderCard = createOrderCard(order);
            $(`#${order.status}Orders`).append(orderCard);
        });
        
        // Update counters
        updateOrderCounters();
    }

    function createOrderCard(order) {
        let actionButtons = '';
        
        if (order.status === "new") {
            actionButtons = `
                <button class="btn btn-sm btn-success btn-action accept-order" data-id="${order.id}">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn btn-sm btn-danger btn-action reject-order" data-id="${order.id}">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else if (order.status === "processing") {
            actionButtons = `
                <button class="btn btn-sm btn-success btn-action complete-order" data-id="${order.id}">
                    <i class="fas fa-check-double"></i> Complete
                </button>
                <button class="btn btn-sm btn-danger btn-action reject-order" data-id="${order.id}">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        }
        
        return `
            <div class="card order-card ${order.status} mb-3" id="${order.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="mb-0">Order #${order.id.replace("order", "")}</h6>
                            <small class="text-muted">${order.time}</small>
                        </div>
                        <div class="col-md-3">
                            <h6 class="mb-0">${order.customerName}</h6>
                            <small class="text-muted">${order.items} item(s)</small>
                        </div>
                        <div class="col-md-2">
                            <h6 class="mb-0">$${order.total.toFixed(2)}</h6>
                        </div>
                        <div class="col-md-2">
                            <span class="status-badge ${order.status}">
                                ${capitalizeFirstLetter(order.status)}
                            </span>
                        </div>
                        <div class="col-md-2 action-buttons">
                            ${actionButtons}
                            <button class="btn btn-sm btn-outline-primary btn-action view-order" data-id="${order.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getOrderDetails(orderId) {
        // In a real app, this would fetch from API
        // Demo data for now
        const orders = {
            "order101": {
                orderId: "101",
                customerName: "John Smith",
                phone: "555-123-4567",
                orderTime: "Today at 12:35 PM",
                status: "new",
                deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
                items: [
                    { name: "Margherita Pizza", quantity: 1, price: 12.99 },
                    { name: "Greek Salad", quantity: 1, price: 8.49 },
                    { name: "Coke", quantity: 2, price: 2.49 }
                ],
                subtotal: 26.46,
                tax: 2.38,
                total: 28.84
            },
            "order102": {
                orderId: "102",
                customerName: "Sarah Johnson",
                phone: "555-987-6543",
                orderTime: "Today at 12:42 PM",
                status: "new",
                deliveryAddress: "456 Park Ave, New York, NY 10022",
                items: [
                    { name: "Cheeseburger", quantity: 1, price: 9.99 },
                    { name: "French Fries", quantity: 1, price: 3.99 },
                    { name: "Chocolate Shake", quantity: 1, price: 4.99 }
                ],
                subtotal: 18.97,
                tax: 1.71,
                total: 20.68
            }
        };
        
        return orders[orderId] || null;
    }
});
