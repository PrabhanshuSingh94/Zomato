$(document).ready(function () {
    let userData = [];

    // Load user data
    function loadUsers() {
        $.ajax({
            url: 'controller/AdminController.php?action=loadRestroData',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                userData = response.restroList;
                displayUsers(userData);  
            },
            error: function (xhr, status, error) {
                console.error('Error loading data:', error);
                alert('Failed to load user data.');
            }
        });
    }

    // Display users in table
    function displayUsers(data) {
        const tableBody = $('#userData tbody');
        tableBody.empty();

        data.forEach((user, index) => {
            const statusBtn = `
                <button class="btn btn-sm ${user.STATUS === 'approved' ? 'btn-danger' : 'btn-success'} toggle-status"
                    data-id="${user.id}" data-email="${user.email}" data-status="${user.STATUS}">
                    ${user.STATUS === 'approved' ? 'Block' : 'Approve'}
                </button>
            `;
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.address}</td>
                    <td>${user.gstin}</td>
                    <td>${statusBtn}</td>
                </tr>
            `;

            tableBody.append(row);
        });
    }

    // Toggle status: approved ↔ blocked
    $(document).on('click', '.toggle-status', function () {
        const userId = $(this).data('id');
        const email = $(this).data('email');
        const currentStatus = $(this).data('status');
        const newStatus = currentStatus === 'approved' ? 'blocked' : 'approved';

        $.ajax({
            url: 'controller/AdminController.php?action=updateRestroStatus',
            type: 'POST',
            data: { status: newStatus, email: email },
            success: function (response) {
                if (response.status === 'success') {
                    loadUsers(); // Reload data after update
                } else {
                    alert(response.message || 'Status update failed.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating status:', error);
                alert('Failed to update status.');
            }
        });
    });

    // Event listener for the search bar
    $('#searchBar').on('input', function () {
        const query = $(this).val().toLowerCase();
        const filteredData = userData.filter(user => 
            user.name.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query)
        );
        displayUsers(filteredData);  // Display filtered data using the correct function
    });

    // Initial call to load users
    loadUsers();
});
