// Replace the existing loadDishData function with this one:
function loadDishData(category) {
    const mainDish = $('.main-dish');
    const relatedDishes = $('.related-dishes');
    const bottomDishes = $('.bottom-suggestions');
    
    // Add loading indicator
    mainDish.css('opacity', '0.6');
    relatedDishes.css('opacity', '0.6');
    bottomDishes.css('opacity', '0.6');
    
    // Make AJAX call to fetch dish data
    $.ajax({
        url: '../controller/CustomerController.php?action=loadDishData', 
        method: 'POST',
        dataType: 'json',
        data: {
            id: category
        },
        success: function(response) {
            mainDish.css('opacity', '1');
            relatedDishes.css('opacity', '1');
            bottomDishes.css('opacity', '1');
            console.log(response);
            if (response.status === 'success') {
                if (response.mainDish) {
                    updateMainDish(response.mainDish);
                }
    
                if (response.relatedDishes && response.relatedDishes.length > 0) {
                    updateRelatedDishes(response.relatedDishes);
                }
    
                if (response.recommendedDishes && response.recommendedDishes.length > 0) {
                    updateRecommendedDishes(response.recommendedDishes);
                }
    
                console.log("Dish data loaded successfully!");
            } else {
                console.error("Error loading dish data:", response.message || "Unknown error");
            }
        },
        error: function(xhr, status, error) {
            mainDish.css('opacity', '1');
            relatedDishes.css('opacity', '1');
            bottomDishes.css('opacity', '1');
            console.error("AJAX error:", error);
        }
    });
    
}

// Helper function to update main dish
function updateMainDish(dishData) {
    const mainDish = $('.main-dish');
    $('.restaurant-name').text(dishData.restaurant);
    $('.restaurant-place').text(dishData.address);
    // Update main dish image
    mainDish.find('.main-dish-img').attr('src', "../../Restaurant/uploads/"+dishData.image_url);
    mainDish.find('.main-dish-img').attr('alt', dishData.name);
    
    // Update dish details
    mainDish.find('.dishName').text(dishData.item_name);
    mainDish.find('.restaurant').text(dishData.restaurant);
    mainDish.find('.rating').text(2 + ' ★');
    mainDish.find('.dish-description').text(dishData.description);
    
    
    // Update views and favorites if available
    if (dishData.views) {
        mainDish.find('.meta-item:nth-child(2)').find('+ span').text(dishData.views + ' views');
    }
    if (dishData.favorites) {
        mainDish.find('.meta-item:nth-child(3)').find('+ span').text(dishData.favorites + ' favorites');
    }
    
    // Update price and cart button
    mainDish.find('.price').text('$' + dishData.price);
    
    // Update add to cart button with dish data
    // const addToCartBtn = mainDish.find('.add-to-cart');
    // addToCartBtn.attr('data-id', dishData.id);
    // addToCartBtn.attr('data-name', dishData.name);
    // addToCartBtn.attr('data-price', dishData.price);
    
    // Reset cart button state (in case it was previously added)
    // addToCartBtn.show();
    // mainDish.find('.qty-selector').hide();
    
    // If this item is already in cart, update the quantity display
    // const cartItem = cart.find(item => item.id === dishData.id);
    // if (cartItem) {
    //     addToCartBtn.hide();
    //     const qtySelector = mainDish.find('.qty-selector');
    //     qtySelector.css('display', 'flex');
    //     qtySelector.find('.qty-input').val(cartItem.quantity);
    // }
}

// Helper function to update related dishes
function updateRelatedDishes(dishes) {
    const relatedDishesContainer = $('.related-dishes');
    relatedDishesContainer.find('.related-dish').remove(); 
    
    dishes.forEach(dish => {
        const dishHtml = `
            <div class="related-dish">
                <img src="${"../../Restaurant/uploads/"+dish.image_url}" alt="${dish.name}" class="related-img">
                <div class="related-details">
                    <div>
                        <div class="related-name">${dish.item_name}</div>
                        <div class="related-restaurant">${dish.restaurant}</div>
                    </div>
                    <div class="related-bottom">
                        <div class="related-price">₹${dish.price}</div>
                        <div class="cart-actions">
                        <button class="related-add" data-id="1" data-name="Butter Chicken" data-price="399">Add to Cart</button>
                        <div class="qty-selector">
                            <button class="qty-btn minus">-</button>
                            <input type="text" class="qty-input" value="1" readonly>
                            <button class="qty-btn plus">+</button>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `;
        // Append after the title
        relatedDishesContainer.append(dishHtml);
    });
}

// Helper function to update recommended dishes
function updateRecommendedDishes(dishes) {
    const bottomDishesContainer = $('.bottom-dishes');
    bottomDishesContainer.empty(); // Clear existing dishes

    dishes.forEach(dish => {
        const dishHtml = `
            <div class="bottom-dish">
                <img src="${"../../Restaurant/uploads/"+dish.image_url}" alt="${dish.name}" class="bottom-img">
                <div class="bottom-details">
                    <div class="bottom-name">${dish.item_name}</div>
                    <div class="bottom-restaurant">${dish.restaurant}</div>
                    <div class="bottom-bottom">
                        <div class="related-price">₹${dish.price}</div>
                        <div class="cart-actions">
                            <button class="related-add" data-id="1" data-name="Butter Chicken" data-price="399">Add to Cart</button>
                            <div class="qty-selector" style="display: none;">
                                <button class="qty-btn minus">-</button>
                                <input type="text" class="qty-input" value="1" readonly>
                                <button class="qty-btn plus">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bottomDishesContainer.append(dishHtml);
    });

    // Call setup for quantity selectors
    // setupQuantitySelectors();
}


function getDishIdFromURL() {
    const path = window.location.pathname;
    const pathParts = path.split('/');  // Split the URL path into parts
    
    // The last part of the URL path will be the ID (e.g., "65" from /menu-listing/65)
    return pathParts[pathParts.length - 1];
}


// Call this function to load dish data when the page loads
$(document).ready(function() {
    const category = getDishIdFromURL();
    //console.log(category);
    loadDishData(category);
});