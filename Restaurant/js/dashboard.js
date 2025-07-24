
    $(document).ready(function() {
        $.ajax({
            url: 'controller/RestaurantController.php?action=getDashboardData',
            method: 'GET',
            dataType:'json',
            success: function (res) {
                try {
                    let data = res;
                    if (data.error) {
                        console.error('Error:', data.error);
                        return;
                    }
    
                    $('.orderRequest').text(data.orderRequest);
                    $('.totalCategories').text(data.totalCategories);
                    $('.totalMenu').text(data.totalMenu);
                    $('.date').text(data.date);
                } catch (e) {
                    console.error('Parsing error:', e);
                    console.log('Raw response:', res);
                }
            },
            error: function (xhr, status, err) {
                console.error('AJAX Error:', err);
            }
        });

        $.ajax({
            url: 'controller/RestaurantController.php?action=getRestaurantGraph',
            dataType: 'json',
            method: 'POST',
            success: function(response) {
                if (response.status == 'success') {
                    console.log(response.chartLabels+" is the response");
                    const ctx = document.getElementById('revenueChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: response.chartLabels,
                            datasets: [{
                                label: 'Revenue',
                                data: response.chartRevenue,
                                fill: true,
                                backgroundColor: 'rgba(203, 32, 45, 0.1)',
                                borderColor: '#CB202D',
                                tension: 0.4
                            }, {
                                label: 'Orders',
                                data: response.chartOrders,
                                fill: true,
                                backgroundColor: 'rgba(255, 126, 31, 0.1)',
                                borderColor: '#FF7E1F',
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
                    console.error("Server error:", response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                console.log("Full response:", xhr.responseText);
            }
        });

        $.ajax({
            url: 'controller/RestaurantController.php?action=getCategoryChartData',
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    const ctx = document.getElementById('categoryChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: response.labels,
                            datasets: [{
                                data: response.data,
                                backgroundColor: [
                                    '#CB202D', '#FF7E1F', '#4CAF50', '#9C27B0',
                                    '#2196F3', '#FFC107', '#3F51B5', '#E91E63'
                                ],
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const index = context.dataIndex;
                                            const items = response.tooltips[index];
                                            return `${context.label}: ${context.formattedValue} items\n(${items})`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    console.error(response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
            }
        });
                 
    });
