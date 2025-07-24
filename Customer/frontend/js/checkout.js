savedCart = false;
document.addEventListener('DOMContentLoaded', function() {

    loadCheckoutCartData();
    
    // Set up quantity change buttons
    setupQuantityButtons();
});



// Load cart data from localStorage and display on checkout page
function loadCheckoutCartData() {
    if (!savedCart) {
        showEmptyCartMessage();
        return;
    }
    
    // Parse cart data
    checkoutCartItems = savedCart;
    
    // If cart is empty, show message
    if (!checkoutCartItems) {
        showEmptyCartMessage();
        return;
    }
    
    // Display items in checkout
    displayCheckoutItems();
    
    // Calculate and update totals
    updateCheckoutTotals();
}

// Show empty cart message
function showEmptyCartMessage() {
    const checkoutList = document.querySelector('.checkout-detail ul');
    if (checkoutList) {
        checkoutList.innerHTML = '<li><div class="console.log console.log-info">Your cart is empty. Please add some items.</div></li>';
    }
    
    // Disable checkout button
    const checkoutButton = document.querySelector('.restaurant-btn');
    // if (checkoutButton) {
    //     checkoutButton.classList.add('disabled');
    //     checkoutButton.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         console.log('Please add items to your cart before checkout.');
    //     });
    // }
    
    // Zero out the totals
    updateBillDetailsWithZero();
}

// Zero out bill details
function updateBillDetailsWithZero() {
    const subTotalElement = document.querySelector('.sub-total:first-of-type h6.fw-semibold');
    if (subTotalElement) {
        $.ajax({
            url: '../controller/CustomerController.php?action=getTotalAmount',
            method: 'POST',
            cache: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    let totalAmount = 0;

                    const items = response.items;

                    items.forEach(function(item) {
                        const subtotal = item.price * item.quantity;
                        totalAmount += subtotal;
                    });
                    subTotalElement.textContent = '₹' + totalAmount;
                    if(totalAmount > 0) savedCart = true;
    loadCheckoutCartData();

                } else {
                    console.error("Error: " + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error: " + error);
            }
        });
    }

    // You can update discount and grand total here as well


    
    // Update discount
    // const discountElement = document.querySelector('.sub-total:nth-of-type(3) h6.fw-semibold');
    // if (discountElement) {
    //     discountElement.textContent = '$0.00';
    // }
    
    // Update total to pay
    const totalElement = document.querySelector('.grand-total .amount');
    if (totalElement) {
        $.ajax({
            url: '../controller/CustomerController.php?action=getTotalAmount',
            method: 'POST',
            cache: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    let totalAmount = 0;

                    const items = response.items;

                    items.forEach(function(item) {
                        const subtotal = item.price * item.quantity;
                        totalAmount += subtotal;
                    });
                    totalElement.textContent = '₹' + totalAmount;
                } else {
                    console.error("Error: " + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error: " + error);
            }
        });
    }
}

// Display cart items in checkout
function displayCheckoutItems() {
    const checkoutList = document.querySelector('.checkout-detail ul');
    if (!checkoutList) return;
    
    // Clear existing list items
    checkoutList.innerHTML = '';
    
    // Add each item to the checkout list
    checkoutCartItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="horizontal-product-box">
                <div class="product-content">
                    <div class="d-flex align-items-center justify-content-between">
                        <h5>${item.name}</h5>
                        <h6 class="product-price">$${(item.price * item.quantity).toFixed(2)}</h6>
                    </div>
                    <h6 class="ingredients-text">${item.restaurant || 'Restaurant'}</h6>
                    <div class="d-flex align-items-center justify-content-between mt-md-2 mt-1 gap-1">
                        <h6 class="place">Serve ${item.quantity}</h6>
                        <div class="plus-minus">
                            <i class="ri-subtract-line sub" data-item="${item.name}"></i>
                            <input type="number" value="${item.quantity}" min="1" max="10" data-item="${item.name}">
                            <i class="ri-add-line add" data-item="${item.name}"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        checkoutList.appendChild(listItem);
    });
}

// Setup quantity change buttons
function setupQuantityButtons() {
    // Setup interval to check for new elements
    // This is needed because the DOM might be updated after our initial setup
    setInterval(() => {
        // Setup add buttons
        const addButtons = document.querySelectorAll('.plus-minus .add');
        addButtons.forEach(button => {
            if (!button.hasEventListener) {
                button.hasEventListener = true;
                button.addEventListener('click', function() {
                    const itemName = this.getAttribute('data-item');
                    const inputEl = this.previousElementSibling;
                    let currentValue = parseInt(inputEl.value || 1);
                    
                    // Increase quantity (max 10)
                    if (currentValue < 10) {
                        currentValue++;
                        inputEl.value = currentValue;
                        updateItemQuantity(itemName, currentValue);
                    }
                });
            }
        });
        
        // Setup subtract buttons
        const subtractButtons = document.querySelectorAll('.plus-minus .sub');
        subtractButtons.forEach(button => {
            if (!button.hasEventListener) {
                button.hasEventListener = true;
                button.addEventListener('click', function() {
                    const itemName = this.getAttribute('data-item');
                    const inputEl = this.nextElementSibling;
                    let currentValue = parseInt(inputEl.value || 2);
                    
                    // Decrease quantity (min 1)
                    if (currentValue > 1) {
                        currentValue--;
                        inputEl.value = currentValue;
                        updateItemQuantity(itemName, currentValue);
                    } else {
                        // If trying to go below 1, ask if they want to remove
                        if (confirm('Remove this item from your cart?')) {
                            removeItem(itemName);
                        }
                    }
                });
            }
        });
        
        // Setup input field change
        const inputFields = document.querySelectorAll('.plus-minus input');
        inputFields.forEach(input => {
            if (!input.hasEventListener) {
                input.hasEventListener = true;
                input.addEventListener('change', function() {
                    const itemName = this.getAttribute('data-item');
                    let newValue = parseInt(this.value || 1);
                    
                    // Validate input (between 1 and 10)
                    if (isNaN(newValue) || newValue < 1) {
                        newValue = 1;
                        this.value = 1;
                    } else if (newValue > 10) {
                        newValue = 10;
                        this.value = 10;
                    }
                    
                    updateItemQuantity(itemName, newValue);
                });
            }
        });
    }, 500); // Check every half second
}

// Update item quantity
function updateItemQuantity(itemName, newQuantity) {
    // Find the item in the cart
    const itemIndex = checkoutCartItems.findIndex(item => item.name === itemName);
    
    if (itemIndex !== -1) {
        // Update quantity
        checkoutCartItems[itemIndex].quantity = newQuantity;
        
        // Update the item price display
        updateItemPriceDisplay(itemName);
        
        // Update checkout totals
        updateCheckoutTotals();
        
        // Save to localStorage
        saveCheckoutCartData();
    }
}

// Remove item from cart
function removeItem(itemName) {
    // Filter out the item
    checkoutCartItems = checkoutCartItems.filter(item => item.name !== itemName);
    
    // If cart is now empty, show empty message
    if (checkoutCartItems.length === 0) {
        showEmptyCartMessage();
    } else {
        // Redisplay items (to remove the deleted one)
        displayCheckoutItems();
        
        // Update totals
        updateCheckoutTotals();
        
        // Re-setup buttons (needed after redisplaying items)
        setupQuantityButtons();
    }
    
    // Save to localStorage
    saveCheckoutCartData();
}

// Update item price display after quantity change
function updateItemPriceDisplay(itemName) {
    const item = checkoutCartItems.find(item => item.name === itemName);
    if (!item) return;
    
    // Find the price element for this item
    const inputEl = document.querySelector(`.plus-minus input[data-item="${itemName}"]`);
    if (inputEl) {
        const productBox = inputEl.closest('.horizontal-product-box');
        if (productBox) {
            const priceEl = productBox.querySelector('.product-price');
            if (priceEl) {
                // Update the price display
                priceEl.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
            }
            
            // Update the "Serve" text
            const serveEl = productBox.querySelector('.place');
            if (serveEl) {
                serveEl.textContent = `Serve ${item.quantity}`;
            }
        }
    }
}

// Calculate and update checkout totals
function updateCheckoutTotals() {
    // Calculate subtotal
    const subtotal = checkoutCartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    
    // Calculate discount (10%)
    const discount = subtotal * 0.1;
    
    // Calculate total to pay
    const totalToPay = subtotal - discount;
    
    // Update subtotal display
    const subtotalEl = document.querySelector('.sub-total:first-of-type h6.fw-semibold');
    if (subtotalEl) {
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Update discount display
    const discountEl = document.querySelector('.sub-total:nth-of-type(3) h6.fw-semibold');
    if (discountEl) {
        discountEl.textContent = `$${discount.toFixed(2)}`;
    }
    
    // Update total to pay display
    const totalEl = document.querySelector('.grand-total .amount');
    if (totalEl) {
        totalEl.textContent = `$${totalToPay.toFixed(2)}`;
    }
}

// Save checkout cart data to localStorage
function saveCheckoutCartData() {
    localStorage.setItem('foodCart', JSON.stringify(checkoutCartItems));
}

// Handle checkout button
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.restaurant-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            // Only allow checkout if cart is not empty
            if (checkoutCartItems.length === 0) {
                e.preventDefault();
                console.log('Your cart is empty. Please add some items before checkout.');
            } else {
                // You can add additional checkout logic here if needed
                // For now, just let the normal link navigation happen
            }
        });
    }
});