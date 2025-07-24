$(document).ready(function() {
    // Function to load cart contents
    function loadCart() {
        $.ajax({
            url: '../controller/CustomerController.php?action=loadCart', 
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.status == 'success') {
                    displayCartItems(response.items);
                    console.log(response.items);
                } else {
                    displayEmptyCart();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error fetching cart data:", error);
                displayEmptyCart();
            }
        });
    }

    // Function to display cart items
    function displayCartItems(items) {
        let cartHTML = `
            <section class="cart-section section-b-space">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="cart-table">
                                <div class="table-responsive">
                                    <table class="table cart-table">
                                        <thead>
                                            <tr>
                                                <th>Dish</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Subtotal</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>`;
        
        let totalAmount = 0;
        
        // Loop through items and create HTML for each
        items.forEach(function(item) {
            const subtotal = parseFloat(item.price) * parseInt(item.quantity);
            totalAmount += subtotal;
            
            cartHTML += `
                <tr class="cart-item" data-id="${item.id}">
                    <td>
                        <div class="cart-info">
                            <div class="cart-details">
                                <h6>${item.dish_name}</h6>
                            </div>
                        </div>
                    </td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                        <div class="qty-box">
                            <div class="input-group">
                                <button class="btn qty-minus" data-id="${item.id}">-</button>
                                <input type="text" name="quantity" class="form-control qty-input" value="${item.quantity}" readonly>
                                <button class="btn qty-plus" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-solid remove-from-cart" data-id="${item.id}">
                            <i class="fa fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>`;
        });
        
        cartHTML += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row cart-buttons">
                        <div class="col-6">
                            <a href="index" class="btn btn-solid">continue shopping</a>
                        </div>
                        <div class="col-6">
                            <div class="cart-total">
                                <h5>Cart Total: <span>$${totalAmount.toFixed(2)}</span></h5>
                                <a href="checkout" class="btn btn-solid">proceed to checkout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`;
        
        $('.empty-cart-section').replaceWith(cartHTML);
        initCartEvents();
    }

    // Function to display empty cart
    function displayEmptyCart() {
        let emptyCartHTML = `
            <section class="empty-cart-section section-b-space">
                <div class="container">
                    <div class="empty-cart-image">
                        <div>
                            <img class="img-fluid img" src="assets/images/empty-cart.svg" alt="empty-cart">
                            <h2>It's empty in your cart</h2>
                            <h5>To browse more restaurants, visit the main page.</h5>
                            <a href="index" class="btn theme-outline restaurant-btn">see restaurant near you</a>
                        </div>
                    </div>
                </div>
            </section>`;
        
        // Replace cart section with empty cart message
        if ($('.cart-section').length) {
            $('.cart-section').replaceWith(emptyCartHTML);
        } else {
            // If cart section doesn't exist yet (first load)
            $('.empty-cart-section').replaceWith(emptyCartHTML);
        }
    }

    // Setup event handlers for cart interactions
    function initCartEvents() {
        // Handle quantity increase
        $('.qty-plus').on('click', function() {
            const itemId = $(this).data('id');
            updateQuantity(itemId, 1);

        });

        // Handle quantity decrease
        $('.qty-minus').on('click', function() {
            const itemId = $(this).data('id');
            updateQuantity(itemId, -1);

        });

        // Handle item removal
        $('.remove-from-cart').on('click', function() {
            const itemId = $(this).data('id');
            removeCartItem(itemId);

        });
    }

    // Function to update quantity
    function updateQuantity(itemId, change) {
        const qtyInput = $(`.cart-item[data-id="${itemId}"] .qty-input`);
        let currentQty = parseInt(qtyInput.val());
        let newQty = currentQty + change;
        
        // Ensure quantity doesn't go below 1
        if (newQty < 1) newQty = 1;
        
        $.ajax({
            url: '../controller/CustomerController.php?action=updateQuantity',
            type: 'POST',
            cache: false,
            data: {
                item_id: itemId,
                quantity: newQty
            },
            dataType: 'json',
            success: function(response) {
                if (response.status == 'success') {
                    // loadCart();
                    window.location.href = "cart";
                    console.log("Load Cart Success");
                } else {
                    console.log(response.message || 'Failed to update quantity');
                }
            },
            error: function(xhr, status, error) {
                console.error("XHR response text:", xhr.responseText);
                console.log('Failed to update quantity');
            }
            
        });

    }

    // Function to remove item from cart
    function removeCartItem(itemId) {
        $.ajax({
            url: '../controller/CustomerController.php?action=removeCartItem',
            type: 'POST',
            data: {
                item_id: itemId
            },
            dataType: 'json',
            success: function(response) {
                if (response.status == 'success') {
                    // Reload cart after removal
                    loadCart();
                } else {
                    console.log(response.message || 'Failed to remove item from cart');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error removing item:", error);
                console.log('Failed to remove item from cart');
            }
        });
        loadCart();

    }

    // Initialize cart on page load
    loadCart();
});