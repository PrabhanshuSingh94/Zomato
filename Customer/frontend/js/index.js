$(document).ready(function () {
    $('#inputusername').on('keyup', function (e) {
        let query = $(this).val().trim();
        let suggestions = $('#suggestions');

        // Enter key press — ignore because we need ID, not just text
        if (e.key === 'Enter' && query.length > 0) {
            // Optionally show a message like "Please select from suggestions"
            return;
        }

        if (query.length > 1) {
            $.ajax({
                url: '../controller/CustomerController.php?action=getSuggestions',
                method: 'POST',
                data: { term: query },
                dataType: 'json',
                success: function (response) {
                    suggestions.empty();

                    if (response.length > 0) {
                        response.forEach(function (item) {
                            suggestions.append(
                                `<li class="list-group-item suggestion-item" style="cursor:pointer;" data-id="${item.id}">${item.suggestion}</li>`
                            );
                        });

                        // ✅ Redirect on click with ID
                        $('.suggestion-item').on('click', function () {
                            let itemId = $(this).data('id');
                            let itemName = $(this).text();
                            $('#inputusername').val(itemName);
                            suggestions.empty();
                            window.location.href = `menu-listing/${encodeURIComponent(itemId)}`;
                        });
                    } else {
                        suggestions.append('<li class="list-group-item disabled">No matches found</li>');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('AJAX Error:', status, error);
                    console.log('Response Text:', xhr.responseText);
                }
            });
        } else {
            suggestions.empty();
        }
    });

    // Hide suggestions when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#inputusername, #suggestions').length) {
            $('#suggestions').empty();
        }
    });

    $('.search-btn').on('click', function () {
        let query = $('#inputusername').val().trim();
        if (query.length > 0) {
            window.location.href = `menu-listing/${encodeURIComponent(query)}`;  // Updated URL format
        }
    });
});
