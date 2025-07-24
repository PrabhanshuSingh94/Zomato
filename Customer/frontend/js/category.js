$(document).ready(function() {
   
        getCategories();
        getBrands();

        function getCategories(){
            $.ajax({
                url: '../controller/CustomerController.php?action=getCategories',
                method: 'POST',
                cache: false,
                dataType:'json',
                success: function(response) {
                    try {
                    
                        //console.log(response.status + response.message+ response.categories[0]['name']+response.categories[0]['image']);
                       displayCategories(response.categories);
                    } catch (e) {
                        console.log("Error parsing JSON:", e);
                        console.log("Response: ", response);  
                    }
                },
                error: function(xhr, status, error) {
                    console.log("AJAX Error:", status, error);
                }
            });
        }

        function displayCategories(categories ){
            const container = $('.categoryContainer');
            container.empty(); 

            categories.forEach(category => {
                const categoryParam = encodeURIComponent(category.name);
                const html = `
                    <div class="swiper-slide">
                        <a href="restaurant-listing/${categoryParam}" class="food-categories">
                            <span class="categories-img">
                                <img src="../../Restaurant/${category.image}" alt="${category.image}" class="img-fluid categories-img">
                            </span>
                            <h4 class="dark-text">${category.name}</h4>
                        </a>
                    </div>
                `;
                container.append(html);
            });
        }


        function getBrands(){
            $.ajax({
                url:'../controller/CustomerController.php?action=getBrands',
                method:'POST',
                cache:false,
                dataType:'json',
                success: function(response){
                    if(response.status == 'success'){
                        displayBrands(response.brands);
                    }
                    else{
                        console.log(response.status);
                    }
                },
                error: function(xhr, status, error) {
                    console.error("AJAX Error:", error);
                }
            })
        }

        function getInitials(name) {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase();
        }
    
        function displayBrands(brands) {
            const container = $('.brand-container'); 
            container.empty();
    
            brands.forEach(brand => {
                const initials = getInitials(brand.name);
                const brandHTML = `
                    <div class="swiper-slide">
                        <div class="brand-box text-center">
                            <a  class="food-brands">
                                <div class="brand-initial bg-primary text-white mx-auto">
                                    ${initials}
                                </div>
                            </a>
                            <a >
                                <h4>${brand.name}</h4>
                            </a>
                        </div>
                    </div>
                `;
                container.append(brandHTML);
            });
        }
    
    
});
