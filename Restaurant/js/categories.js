$(document).ready(function() {
    // Check if we're on the category management page
    if ($("#categoryManagement").length > 0) {
        // Load categories (in a real app, this would fetch from API)
        loadCategories();
    }

    // ---------- IMAGE PREVIEW ----------
    function previewImage(inputSelector, previewSelector) {
        const file = $(inputSelector)[0].files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $(previewSelector).attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        } else {
            $(previewSelector).hide();
        }
    }

    // ---------- SHOW IMAGE PREVIEWS ----------
    $('#customCategoryImage').on('change', function () {
        previewImage('#customCategoryImage', '#imagePreview');
    });

    $('#editCategoryImage').on('change', function () {
        previewImage('#editCategoryImage', '#editImagePreview');
    });

    // ---------- VALIDATION FOR NAME ----------
    $('#customCategoryName').on('input', function () {
        const name = $(this).val().trim();
        $('#nameError').toggleClass('d-none', name !== '');
    });

    $('#editCategoryName').on('input', function () {
        const name = $(this).val().trim();
        $('#editNameError').toggleClass('d-none', name !== '');
    });

     // ---------- VALIDATION FOR Image ----------
     $('#customCategoryImage').on('input', function () {
        const name = $(this).val().trim();
        $('#imageError').toggleClass('d-none', name !== '');
    });

    $('#editCategoryImage').on('input', function () {
        const name = $(this).val().trim();
        $('#editNameError').toggleClass('d-none', name !== '');
    });

    // ---------- ADD CATEGORY ----------
    $('#addCategoryBtn').on('click', function (e) {
        e.preventDefault();
        const name = $('#customCategoryName').val().trim();
        const imageFile = $('#customCategoryImage')[0].files[0];

        let valid = true;

        if (name === '') {
            $('#nameError').removeClass('d-none').addClass('text-danger');
            valid = false;
        }

        if (!imageFile || !imageFile.type.startsWith('image/')) {
            $('#imageError').removeClass('d-none').addClass('text-danger');
            valid = false;
        }

        if (!valid) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', imageFile);

        $.ajax({
            url: 'controller/RestaurantController.php?action=addCategory',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (res) {
                const data = JSON.parse(res);
                if (data.status === 'success') {
                    $('#addCategoryModal').modal('hide');
                    $('#customCategoryForm')[0].reset();
                    $('#imagePreview').hide();
                    showToast('Category added successfully!', 'success');
                    // const card = createCategoryCard(data.id, data.name, data.image);
                    // $('#categoriesList').prepend(card);
                    // attachCategoryEventHandlers();
                    loadCategories();
                    
                } else {
                    showToast(data.message, 'error');
                }
            },
            error: function () {
                showToast('Something went wrong.', 'error');
            }
        });
    });

    // ---------- EDIT CATEGORY ----------
    $(document).on('click', '.edit-category', function () {
        const categoryId = $(this).data('id');
        const categoryName = $(this).data('name');
    
        // Get the image src from the nearest card's image tag
        const imageSrc = $(this).closest('.card').find('img').attr('src');
    
        // Set values into modal
        $('#editCategoryId').val(categoryId);
        $('#editCategoryName').val(categoryName);
    
        // Show preview if image exists
        if (imageSrc) {
            $('#editImagePreview').attr('src', imageSrc).show();
        } else {
            $('#editImagePreview').hide();
        }
    
        // Show the modal
        $('#editCategoryModal').modal('show');
    });
     

    // ---------- UPDATE CATEGORY ----------
    // $('#saveEditCategoryBtn').on('click', function (e) {
    //     e.preventDefault();
    //     const name = $('#editCategoryName').val().trim();
    //     const imageFile = $('#editCategoryImage')[0].files[0];
    //     const id = $('#editCategoryId').val();
    //     let valid = true;
        
    //     $('#editNameError').addClass('d-none');
    //     $('#imageError').addClass('d-none');
    //     if (name === '') {
    //         $('#editNameError').removeClass('d-none').addClass('text-danger');
    //         valid = false;
    //     }
    //     if (!imageFile || !imageFile.type.startsWith('image/')) {
    //         $('#imageError').removeClass('d-none').addClass('text-danger');
    //         valid = false;
    //     }

    //     if (!valid) return;

    //     const formData = new FormData();
    //     formData.append('id',id);
    //     formData.append('name', name);
    //     if (imageFile) {
    //         formData.append('image', imageFile);
    //     }

    //     $.ajax({
    //         url: 'controller/RestaurantController.php?action=updateCat',
    //         type: 'POST',
    //         data: formData,
    //         cache: false,
    //         contentType: false,   // required for FormData
    //         processData: false,
    //         success: function (res) {
    //             console.log("Raw response:", res); // Log full response
                
    //             // Try to parse if response is string
    //             let response;
    //             if (typeof res === 'string') {
    //                 try {
    //                     response = JSON.parse(res);
    //                 } catch (e) {
    //                     console.error("JSON parse error:", e, res);
    //                     showToast("Invalid server response. Check console for details.", 'error');
    //                     return;
    //                 }
    //             } else {
    //                 response = res;
    //             }
        
    //             if (response.status === 'success') {
    //                 $('#editCategoryModal').modal('hide');
    //                 showToast('Category updated successfully!', 'success');
    //                 // updateCategoryCard(response.id, response.name, response.image); // if needed
    //             } else {
    //                 console.warn("Server returned error:", response.message);
    //                 showToast(response.message || 'Update failed.', 'error');
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.error("AJAX Error:", status, error, xhr.responseText);
    //             showToast('Error updating category. Check console.', 'error');
    //         }
    //     });
        
    // });

    // // ---------- DELETE CATEGORY ----------
    $(document).on('click', '.delete-category', function() {
        const categoryId = $(this).data('id');
        const categoryName = $(this).data('name');
        
        // Show a confirmation toast instead of the alert
        showConfirmationToast(`Are you sure you want to delete "${categoryName}"?`, function() {
            // Proceed with the deletion if confirmed
            $.ajax({
                url: 'controller/RestaurantController.php?action=deleteCat',
                type: 'POST',
                data: { id: categoryId },
                success: function(response) {
                    // if (response.status == 'success') {
                        $(`#${categoryId}`).fadeOut(function() {
                            $(this).remove();
                            showToast("Category deleted successfully!", "success");
                        });
                    // } else {
                    //     showToast(response.message || "Failed to delete category.", "error");
                    // }
                },
                error: function() {
                    showToast("Error deleting category.", "error");
                }
            });
        });
    });
    
    // Function to show general toast messages (existing)
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
        const toastElement = new bootstrap.Toast(document.getElementById(toastId), { delay: 1500 });

        toastElement.show();
        
        // Remove toast after it's hidden
        $(`#${toastId}`).on('hidden.bs.toast', function() {
            $(this).remove();
        });

    }
    
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
    
    

    // ---------- LOAD CATEGORIES ----------
    function loadCategories() {
        $.ajax({
            url: 'controller/RestaurantController.php?action=getAllCat',
            type: 'GET',
            success: function(res) {
                const data = JSON.parse(res);
                if (data.status === 'success') {
                    $("#categoriesList").empty();
                    
                    if (data.categories && data.categories.length > 0) {
                        data.categories.forEach(function(category) {
                            // Create category card with image path and category name
                            const categoryCard = createCategoryCard(category.id,category.name, category.image);
                            $("#categoriesList").append(categoryCard);
                        });
                    } else {
                        $("#categoriesList").html('<div class="col-12 text-center py-5"><p>No categories found. Add your first category!</p></div>');
                    }
                    
                    attachCategoryEventHandlers();
                } 
            }
        
        });

    }

    // ---------- CREATE CATEGORY CARD ----------
    function createCategoryCard(id, name, imageUrl = '') {
        const imageHtml = imageUrl ? 
            `<img src="${imageUrl}" class="card-img-top category-image" alt="${name}">` : '';
            
        return `
            <div class="col-md-3 mb-2" id="${id}">
                <div class="card category-card h-100">
                    ${imageHtml}
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-end">
                            
                            <button class="btn btn-sm btn-outline-danger delete-category" data-id="${id}" data-name="${name}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // <button class="btn btn-sm btn-outline-primary me-2 edit-category" data-id="${id}" data-name="${name}">
                            //     <i class="fas fa-edit"></i> Edit
                            // </button>
    }
    

    // ---------- UPDATE CATEGORY CARD ----------
    // function updateCategoryCard(id, name, imageUrl) {
    //     const categoryCard = $(`#${id}`);
    //     categoryCard.find('.card-title').text(name);
        
    //     // Update image if provided
    //     if (imageUrl) {
    //         if (categoryCard.find('.category-image').length) {
    //             categoryCard.find('.category-image').attr('src', imageUrl);
    //         } else {
    //             // If image doesn't exist, add it
    //             categoryCard.find('.card-body').before(`<img src="${imageUrl}" class="card-img-top category-image" alt="${name}">`);
    //         }
    //     }
        
    //     // Update data attributes
    //     categoryCard.find('.edit-category').data('name', name);
    //     categoryCard.find('.delete-category').data('name', name);
    // }

    // ---------- ATTACH EVENT HANDLERS ----------
    function attachCategoryEventHandlers() {
        // Event handlers are already attached using $(document).on()
        // This function can be extended if additional handlers are needed
    }

    // ---------- SHOW TOAST ----------
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

    // ---------- HELPER FUNCTIONS ----------
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $('#addCategoryModal').on('hidden.bs.modal', function () {
        $('#customCategoryForm')[0].reset();
        $('#imagePreview').hide();
        $('#nameError').addClass('d-none');
        $('#imageError').addClass('d-none');
    });
    
});