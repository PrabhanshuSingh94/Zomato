$(document).ready(function () {
    const totalRestro = $('.totalRestro');
    const recentCustomers = $('.recentCustomers');
    const recentRestaurants = $('.recentRestaurants');
    const recentRequest = $('.recentRequest');
    const totalUsers = $('.totalUsers');
    const restroApproval = $('.restroApproval');
    const date = $('.date');

    $.ajax({
        url:'controller/AdminController.php?action=getBasicData',
        dataType:'json',
        cache:false,
        method:'POST',
        success: function(response){
            if(response.status == 'success'){
                totalRestro.text(response.totalRestro);
                recentCustomers.text(response.recentCustomers+" new today");
                recentRestaurants.text(response.recentRestaurants+" new today");
                recentRequest.text(response.recentRequest+" new today");
                totalUsers.text(response.totalUsers);
                restroApproval.text(response.restroApproval);
                date.text(response.date);
            }
            else{
                console.log(response.message+" get the error");
            }
        }
    })

    $.ajax({
        url: 'controller/AdminController.php?action=getBasicGraph',
        dataType: 'json',
        cache: false,
        method: 'POST',
        success: function(response) {
            if (response.status == 'success') {
                
    
                // Render the customer & restaurant join chart
                const revenueCtx = document.getElementById('revenueChart').getContext('2d');
                new Chart(revenueCtx, {
                    type: 'line',
                    data: {
                        labels: response.chartLabels,
                        datasets: [{
                            label: 'Customers Joined',
                            data: response.chartCustomers,
                            fill: true,
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            borderColor: '#2196F3',
                            tension: 0.4
                        }, {
                            label: 'Restaurants Joined',
                            data: response.chartRestaurants,
                            fill: true,
                            backgroundColor: 'rgba(203, 32, 45, 0.1)',
                            borderColor: '#CB202D',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                console.log(response.message + " get the error");
            }
        },error: function(xhr, status, error) {
            console.error("AJAX Error:", status, error);
            console.log("Full response:", xhr.responseText);
            alert("AJAX request failed. Check the console for more details.");
        }
    });
    
});