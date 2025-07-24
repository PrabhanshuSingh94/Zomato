// Initialize cart data from local storage
document.addEventListener('DOMContentLoaded', function () {
    setupAddToCartButtons();
    //setupFloatingCart();
   // setupHeaderCartRemoveButtons();
    cartCount();
});

cartCountInfo = $('.cart-count');
function cartCount(){
    $.ajax({
        url:'../controller/CustomerController.php?action=cartCount',
        method:'POST',
        dataType:'json',
        cache:false,
        success: function(response){
            if(response.status == 'success'){
                console.log(response.count);
                cartCountInfo.text(response.count);
            }
        }
    })
}

function setupAddToCartButtons() {
    const mainAddToCartBtn = $('.add-to-cart');
    if (mainAddToCartBtn.length > 0) {
        mainAddToCartBtn.on('click', function () {
            const dishContainer = $(this).closest('.main-dish-details');
            const dishName = dishContainer.find('.dish-name h2').text();
            const dishPrice = parseFloat(dishContainer.find('.price').text().replace('$', ''));
            const restaurantName = dishContainer.find('.restaurant').text();
            const dishImg = $('.main-dish-img').attr('src') || '';

            addToCart(dishName, dishPrice, 1, restaurantName, dishImg);

            dishContainer.find('.add-to-cart').hide();
            dishContainer.find('.qty-selector').css('display', 'flex');
        });
    }
}

$(document).on('click', '.qty-btn.plus', function () {
    const qtyInput = $(this).siblings('.qty-input');
    let qty = parseInt(qtyInput.val());
    qty++;
    qtyInput.val(qty);

    const dishDetails = getDishDetailsFromContainer($(this).closest('.qty-selector'));
    // if (dishDetails) {
    //     //updateCartItemQuantity(dishDetails.name, qty);
        
    // }
    cartCount();
});

$(document).on('click', '.qty-btn.minus', function () {
    const qtyInput = $(this).siblings('.qty-input');
    let qty = parseInt(qtyInput.val());

    const container = $(this).closest('.qty-selector');
    const parentContainer = container.parent();

    // Get dish details
    let dishDetails = getDishDetailsFromContainer(container);

    if (qty > 1) {
        qty--;  // Decrease the quantity
        qtyInput.val(qty);  // Update the quantity input value

        if (dishDetails) {
            updateCartItemQuantity(dishDetails.name, qty);  // Update cart
        }
    } else {
        qtyInput.val(0);  // Set the quantity to 0 (not below 0)
        if (dishDetails) {
            removeFromCart(dishDetails.name);  // Remove the item from the cart
        }

        // Hide qty-selector and show Add button
        container.hide();

        // Show the corresponding Add button based on parent container
        if (parentContainer.find('.related-add').length > 0) {
            parentContainer.find('.related-add').show();  // Show Add button for related section
        } else if (parentContainer.find('.add-to-cart').length > 0) {
            parentContainer.find('.add-to-cart').show();  // Show Add button for main dish section
        }
    }
    cartCount();
});

function getDishDetailsFromContainer(container) {
    const mainDishContainer = container.closest('.main-dish-details');
    const relatedDishContainer = container.closest('.related-details');
    const bottomDishContainer = container.closest('.bottom-details');

    let name, price, restaurantName, imgSrc;

    if (mainDishContainer.length > 0) {
        name = mainDishContainer.find('.dish-name h2').text();
        price = parseFloat(mainDishContainer.find('.price').text().replace('$', ''));
        restaurantName = mainDishContainer.find('.restaurant').text();
        imgSrc = $('.main-dish-img').attr('src') || '';
        return { name, price, restaurantName, imgSrc };
    } 
    else if (relatedDishContainer.length > 0) {
        name = relatedDishContainer.find('.related-name').text();
        price = parseFloat(relatedDishContainer.find('.related-price').text().replace('₹', ''));
        restaurantName = relatedDishContainer.find('.related-restaurant').text();
        imgSrc = relatedDishContainer.closest('.related-dish').find('.related-img').attr('src') || '';
        return { name, price, restaurantName, imgSrc };
    } 
    else if (bottomDishContainer.length > 0) {
        name = bottomDishContainer.find('.bottom-name').text();
        const priceElement = bottomDishContainer.closest('.bottom-bottom').find('.related-price');
        price = priceElement.length ? parseFloat(priceElement.text().replace('₹', '')) : 0;
        const restaurantElement = bottomDishContainer.find('.bottom-restaurant');
        restaurantName = restaurantElement.length ? restaurantElement.text() : '';
        imgSrc = bottomDishContainer.closest('.bottom-dish').find('.bottom-img').attr('src') || '';
        return { name, price, restaurantName, imgSrc };
    }

    return null;
}

$(document).on('click', '.related-add', function () {
    const dishContainer = $(this).closest('.related-details');
    const dishName = dishContainer.find('.related-name').text();
    const dishPrice = parseFloat(dishContainer.find('.related-price').text().replace('₹', ''));
    const restaurantName = dishContainer.find('.related-restaurant').text();
    const dishImg = $(this).closest('.related-dish').find('.related-img').attr('src');

    addToCart(dishName, dishPrice, 1, restaurantName, dishImg);
    $(this).hide();
    dishContainer.find('.qty-selector').css('display', 'flex');
});

$(document).on('click', '.bottom-dish .related-add', function () {
    const dishContainer = $(this).closest('.bottom-details');
    const dishName = dishContainer.find('.bottom-name').text();

    let dishPrice = 0;
    const priceElement = $(this).closest('.bottom-bottom').find('.related-price');
    if (priceElement.length) dishPrice = parseFloat(priceElement.text().replace('₹', ''));

    let restaurantName = '';
    const restaurantElement = dishContainer.find('.bottom-restaurant');
    if (restaurantElement.length) restaurantName = restaurantElement.text();

    let dishImg = '';
    const imgElement = $(this).closest('.bottom-dish').find('.bottom-img');
    if (imgElement.length) dishImg = imgElement.attr('src');

    addToCart(dishName, dishPrice, 1, restaurantName, dishImg);
    $(this).hide();
    dishContainer.find('.qty-selector').css('display', 'flex');
});


function addToCart(name, price, quantity, restaurant, imgSrc) {
    $.ajax({
        url: '../controller/CustomerController.php?action=addToCart',
        type: 'POST',
        cache:false,
        data: { name, price, quantity, restaurant, imgSrc },
        dataType:'json',
        success: function (response) {
            console.log(response.message);
            //updateCartCount();
            //updateHeaderCartDisplay();
            //updateFloatingCartDisplay();
            showNotification(`${name} added to cart`);
            cartCount();
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', {
                status: status,
                error: error,
                response: xhr.responseText
            });
            console.log('Error adding item to cart: ' + xhr.responseText);
        }
    });
}

function updateCartItemQuantity(name, newQuantity) {
    $.ajax({
        url: '../controller/CustomerController.php?action=updateCartItemQuantity',
        type: 'POST',
        cache:false,
        data: { name, quantity: newQuantity },
        dataType:'json',
        success: function (response) {
            console.log(response.status);
            //updateCartCount();
           // updateHeaderCartDisplay();
            //updateFloatingCartDisplay();
        },
        error: function () {
            console.log('Error updating quantity.');
        }
    });
}

function removeFromCart(name) {
    console.log("Remove from cart");
    $.ajax({
        url: '../controller/CustomerController.php?action=removeFromCart',
        type: 'POST',
        cache:false,
        data: { name },
        dataType: 'json',
        success: function (response) {
            console.log(response.status);
            //updateCartCount();
            //updateHeaderCartDisplay();
           // updateFloatingCartDisplay();
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:");
            console.error("Status:", status);
            console.error("Error Thrown:", error);
            console.error("Response Text:", xhr.responseText);
        
            console.log('❌ Error removing item from cart:\n' +
                  'Status: ' + status + '\n' +
                  'Error: ' + error + '\n' +
                  'Response: ' + xhr.responseText);
        }
        
    });
}



// function updateCartCount() {
//     $.ajax({
//         url: '/cart/fetch',
//         type: 'GET',
//         success: function (cartItems) {
//             const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
//             const headerCartCount = document.querySelector('.cart-button span');
//             if (headerCartCount) headerCartCount.textContent = cartCount;
//             const floatingCartBadge = document.querySelector('.cart-badge');
//             if (floatingCartBadge) floatingCartBadge.textContent = cartCount;
//         }
//     });
// }

// function updateHeaderCartDisplay() {
//     $.ajax({
//         url: '../controller/CustomerController.php?action=',
//         type: 'GET',
//         success: function (cartItems) {
//             const cartList = document.querySelector('.cart-list');
//             if (!cartList) return;
//             cartList.innerHTML = '';
//             let totalPrice = 0;
//             cartItems.forEach(item => {
//                 const itemTotal = item.price * item.quantity;
//                 totalPrice += itemTotal;
//                 const itemElement = document.createElement('li');
//                 itemElement.className = 'product-box-contain';
//                 itemElement.innerHTML = `
//                     <div class="drop-cart">
//                         <a href="#" class="drop-image">
//                             <img src="${item.imgSrc || 'assets/images/placeholder.png'}" alt="${item.name}">
//                         </a>
//                         <div class="drop-contain">
//                             <a href="#"><h5>${item.name}</h5></a>
//                             <h6><span>${item.quantity} x </span> ₹${item.price.toFixed(2)}</h6>
//                             <button class="close-button close_button" data-item="${item.name}">
//                                 <i class="fa-solid fa-xmark"></i>
//                             </button>
//                         </div>
//                     </div>`;
//                 cartList.appendChild(itemElement);
//             });
//             const totalElement = document.querySelector('.price-box h4');
//             if (totalElement) totalElement.textContent = `₹${totalPrice.toFixed(2)}`;
//             setupHeaderCartRemoveButtons();
//         },
//         error: function () {
//             console.log('Failed to load cart.');
//         }
//     });
// }

// function setupHeaderCartRemoveButtons() {
//     const removeButtons = document.querySelectorAll('.close_button');
//     removeButtons.forEach(button => {
//         button.addEventListener('click', function () {
//             const itemName = this.getAttribute('data-item');
//             removeFromCart(itemName);
//         });
//     });
// }

// function updateFloatingCartDisplay() {
//     // Implement this function based on your specific floating cart UI requirements
// }

// function setupFloatingCart() {
//     // Placeholder for floating cart setup (customize as needed)
//     // You can add DOM rendering for floating cart UI and its event handling
// }

function showNotification(message) {
    console.log(message); // Replace this with a toast or modal for better UX
}