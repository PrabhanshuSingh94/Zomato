if ($("#foodManagement").length > 0) {

    //load categories
    $.ajax({
        url: "controller/RestaurantController.php?action=getCategories",
        method: "GET",
        dataType: "json",
        success: function (response) {
            if (response.status === "success") {
                const categories = response.data;
                
                categories.forEach(function (category) {
                    $('#foodCategory').append(
                        `<option value="${category.id}">${category.name}</option>`
                    );
                });
            } else {
                showToast("Failed to load categories", "error");
            }
        },
        error: function () {
            showToast("Error fetching categories", "error");
        }
    });

    function displayFoods(foods) {
        // Clear any existing content
        let foodList = $('#food-list');
        foodList.empty();
    
        // Check if the food list is empty
        if (foods.length === 0) {
            foodList.append('<p>No foods available.</p>');
            return;
        }
    
        // Loop through the foods and create the food card for each item
        foods.forEach(function(food) {
            console.log(food.Image_url);
            let foodCard = createFoodCard(
                food.food_id, 
                food.food_name, 
                food.food_price, 
                food.food_desc, 
                food.food_category_id, 
                food.category_name, 
                `./uploads/${food.Image_url}`
            );
            foodList.append(foodCard);
        });
        attachFoodEventHandlers();
    }
    
    
      
    
    //load food item
    function loadFoodsForRestaurant() {
        $.ajax({
            url: `controller/RestaurantController.php?action=fetchFoods`,
            method: 'GET',
            success: function(res) {
                const response = JSON.parse(res);
                try {
                    console.log(response.foods);
                    displayFoods(response.foods);
                    
                } catch (e) {
                    showToast("Error in loading food items.", "error");
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                showToast("Something went wrong. Please try again later.", "error");
            }
        });
    }
    
    function createFoodCard(id, name, price, desc, category, categoryName, image) {
        return `
            <div class="food-card-wrapper mb-3 m-2" style="width: 250px;">
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
                            <button class="btn btn-sm btn-outline-danger delete-food" data-id="${id}" data-name="${name}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    //edit button code:
    // <button class="btn btn-sm btn-outline-primary me-2 edit-food" 
    //                             data-id="${id}" 
    //                             data-name="${name}" 
    //                             data-price="${price}" 
    //                             data-desc="${desc}" 
    //                             data-category="${category}">
    //                             <i class="fas fa-edit"></i> Edit
    //                         </button>
    
    
    
    // Attach event handlers for edit and delete buttons
    function attachFoodEventHandlers() {
        $(".delete-food").off().click(function () {
            const foodId = $(this).data("id");
            const foodName = $(this).data("name");
    
            showConfirmationToast(
                `Are you sure you want to delete <strong>${capitalizeFirstLetter(foodName)}</strong>?`,
                function onConfirm() {
                    $.ajax({
                        url: 'controller/RestaurantController.php?action=deleteFood',
                        method: 'POST',
                        cache: false,
                        data: {
                            id: foodId
                        },
                        success: function (response) {
                            try {
                                const res = JSON.parse(response);
                                if (res.status === 'success') {
                                    $(`#${foodId}`).fadeOut(function () {
                                        $(this).remove();
                                        showToast("Food item deleted successfully!", "success");
                                    });
                                } else {
                                    showToast("Failed to delete the food item.", "error");
                                }
                            } catch (e) {
                                showToast("Unexpected error. Try again.", "error");
                            }
                        },
                        error: function () {
                            showToast("Server error. Please try again later.", "error");
                        }
                    });
                },
                function onCancel() {
                    showToast("Deletion cancelled.", "info");
                }
            );
        });
    }
    
    
    
    // Example: Call this function with the restaurant ID
    loadFoodsForRestaurant();  // Fetch foods for restaurant with ID 1
    



    // Image preview
    $("#foodImage").change(function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $("#imagePreview").attr("src", e.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    });

    // Add new food item
    $("#addFoodBtn").click(function () {
        const foodName = $("#foodName").val().trim();
        const foodPrice = $("#foodPrice").val().trim();
        const foodDesc = $("#foodDesc").val().trim();
        const foodCategory = $("#foodCategory").val();
        const foodCategoryName = $("#foodCategory option:selected").text();
        const foodImageFile = $("#foodImage")[0].files[0];
        const foodImageSrc = $("#imagePreview").attr("src");

        // Validation
        if (!foodName || !foodPrice || !foodCategory || !foodDesc || !foodImageFile) {
            let missingFields = [];
            if (!foodName) missingFields.push("Food Name");
            if (!foodPrice) missingFields.push("Price");
            if (!foodCategory) missingFields.push("Category");
            if (!foodDesc) missingFields.push("Description");
            if (!foodImageFile) missingFields.push("Image");

            showToast(`All fields are required`, "error");
            return;
        }

        // Generate unique food ID
        const foodId = "food" + Math.floor(Math.random() * 1000);

        // Create food card (Assumes you have this function defined)
        const foodCard = createFoodCard(
            foodId, foodName, foodPrice, foodDesc,
            foodCategory, foodCategoryName, foodImageSrc
        );
        const formData = new FormData();
        formData.append("item_name", foodName);
        formData.append("description", foodDesc);
        formData.append("price", foodPrice);
        formData.append("category", foodCategory);
        formData.append("image", foodImageFile);
        $.ajax({
            url:'controller/RestaurantController.php?action=addFood',
            method: 'POST',
            cache: false,
            data: formData,
            processData: false, // Important for file upload
            contentType: false,
            success: function(response) {
                const data = JSON.parse(response);
                try {
                    if (data.status === 'success') {
                        showToast(data.message, 'success');
                        $('#addFoodForm')[0].reset();
                        $('#imagePreview').hide(); // Hide the image preview
                        $('#foodImage').val(''); // Reset the file input value

                        // Close the modal (assuming you're using Bootstrap)
                        $('#addFoodModal').modal('hide');
                        loadFoodsForRestaurant();
                    } else {
                        showToast(data.message || 'Failed to add food.', 'error');
                    }
                } catch (e) {
                    showToast("Invalid server response", "error");
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error, xhr.responseText);
                showToast("Something went wrong. Please try again later.", "error");
            }
        });

        
    });
  // Function to show confirmation toast
  function showConfirmationToast(message, onConfirm, onCancel) {
    const toastId = "toast" + new Date().getTime();
    let toastHTML = `
        <div class="toast ${'warning'} mb-3" id="${toastId}" role="alert">
            <div class="toast-header">
                <strong class="me-auto">Confirmation</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
                <div class="toast-footer mt-2">
                    <button type="button" class="btn btn-danger cancel-toast" data-bs-dismiss="toast">Cancel</button>
                    <button type="button" class="btn btn-success confirm-toast" data-bs-dismiss="toast">Confirm</button>
                </div>
            </div>
        </div>
    `;
    
    // Check if toast container exists, if not create it
    if ($(".toast-container").length === 0) {
        $("body").append('<div class="toast-container"></div>');
    }

    // Add toast to container
    $(".toast-container").append(toastHTML);

    // Disable clicks on other parts of the page
    $('body').addClass('no-clicks');

    // Initialize and show toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId));
    toastElement.show();

    // Handle Cancel and Confirm actions
    $(document).on('click', '.cancel-toast', function() {
        // Perform Cancel action (if any)
        $('body').removeClass('no-clicks'); // Re-enable clicks
        if (typeof onCancel === 'function') {
            onCancel();
        }
    });

    $(document).on('click', '.confirm-toast', function() {
        // Perform Confirm action (if any)
        $('body').removeClass('no-clicks'); // Re-enable clicks
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    // Remove toast and re-enable body clicks after it's hidden
    $(`#${toastId}`).on('hidden.bs.toast', function() {
        $(this).remove();
        $('body').removeClass('no-clicks'); // Re-enable clicks
    });
}

// ---------- HELPER FUNCTION ----------
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



        function showToast(message, type = "info") {
            const toastId = "toast" + new Date().getTime();
            let toastHTML = `
                <div class="toast ${type} mb-3" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="1000" data-bs-autohide="true">
                    <div class="toast-header">
                        <strong class="me-auto">${capitalizeFirstLetter(type)}</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        ${message}
                    </div>
                </div>
            `;
            
            if ($(".toast-container").length === 0) {
                $("body").append('<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1055;"></div>');
            }
            
            $(".toast-container").append(toastHTML);
            
            const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
                autohide: true,
                delay: 1000 
            });
            toastElement.show();
        
            $(`#${toastId}`).on('hidden.bs.toast', function () {
                $(this).remove();
            });
            setTimeout(function() {
                $('#' + toastId).fadeOut(300, function() {
                    $(this).remove();
                });
            }, 700);
        }
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }        
}
