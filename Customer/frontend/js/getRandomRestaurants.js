$(document).ready(function () {
    $.ajax({
        url: '../controller/CustomerController.php?action=getRandomMenus',
        method: 'POST',
        dataType: 'json',
        success: function (response) {
            if (response.status === 'success') {
                writeRandomRestaurant(response.data);
            } else {
                console.log(response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("AJAX Error:", status, error);
        }
    });

    function writeRandomRestaurant(response){
        const container = $(".menu-container"); 
                response.forEach(item => {
                    const html = `
                    <div class="col-xl-3 col-lg-4 col-md-6 ">
                        <div class="vertical-product-box">
                            <div class="vertical-product-box-img">
                            <a href="menu-listing/${item.id}">
                                    <img class="product-img-top w-100 bg-img" 
                                        src="../../Restaurant/uploads/${item.image_url}" 
                                        style="height: 100%; object-fit: cover;" 
                                        alt="${item.item_name}">
                                </a>
                                <div class="offers">
                                    <h6>upto $${item.price}</h6>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <h4>50% OFF</h4>
                                    </div>
                                </div>
                            </div>
                            <div class="vertical-product-body">
                                <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                    <a href="menu-listing/${item.id}">
                                        <h4 class="vertical-product-title">${item.restaurant_name}</h4>
                                    </a>
                                    <h6 class="rating-star">
                                        <span class="star"><i class="ri-star-s-fill"></i></span>${item.rating || '4.0'}
                                    </h6>
                                </div>
                                <h5 class="product-items">${item.item_name}, ${item.description.slice(0, 30)}...</h5>
                                <div class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                    <h5 class="place">${item.address || 'City'}</h5>
                                    <ul class="distance">
                                        <li><i class="ri-map-pin-fill icon"></i> 3.2 km</li>
                                        <li><i class="ri-time-fill icon"></i> 25 min</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    container.append(html);
                
                    })
            }
});
