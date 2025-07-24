$(document).ready(function () {
    const category = getCategoryFromURL();
    $('.title-category').text(category);
    if (category) {
        $.ajax({
            url: '../controller/CustomerController.php?action=getRestaurantsByCategory',
            method: 'POST',
            cache:false,
            data: { category: category },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    //console.log(response.message); 
                    renderRestaurantCards(response.message);
                } else {
                    console.log("No restaurants found."+response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX error:", status, error);
            }
        });
    }

    function getCategoryFromURL() {
        // const params = new URLSearchParams(window.location.search);
        // return params.get('action'); 
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];

    }

    function renderRestaurantCards(data) {
        const container = $(".restaurantCards");
    
        data.forEach(item => {
            const html = `
            <div class="col-xl-3 col-lg-4 col-sm-6">
                <div class="vertical-product-box">
                    <div class="vertical-product-box-img">
                        <a href="menu-listing/${item.id}">
                            <img class="product-img-top w-100 bg-img" src="../../Restaurant/uploads/${item.image_url}" alt="${item.item_name}" style="height: 100%; width: 100%; object-fit: cover;">
                        </a>
                        <div class="offers">
                            <h6>upto ₹${item.price}</h6>
                            <div class="d-flex align-items-center justify-content-between">
                                <h4>Special</h4>
                            </div>
                        </div>
                    </div>
                    <div class="vertical-product-body">
                        <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                            <a href="menu-listing/${item.id}">
                                <h4 class="vertical-product-title">${item.restaurant_name}</h4>
                            </a>
                            <h6 class="rating-star">
                                <span class="star"><i class="ri-star-s-fill"></i></span>4.2
                            </h6>
                        </div>
                        <h5 class="product-items">${item.item_name}, ${item.description}</h5>
                        <div class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                            <h5 class="place">${item.address}</h5>
                            <ul class="distance">
                                <li><i class="ri-map-pin-fill icon"></i> 2.5 km</li>
                                <li><i class="ri-time-fill icon"></i> 20 min</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`;
            container.append(html);
        });
    }
    
    
});
