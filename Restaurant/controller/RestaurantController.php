<?php
require_once('../model/func.php');
require_once('../model/sendMail.php');

class CustomerController {
    private static $instance = null;
    private $func;
    
    private function __construct() {
        $this->func = Func::getInstance();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new CustomerController();
        }
        return self::$instance;
    }
    
    public function customerRecord() {
        $query = "SELECT * FROM customer";
        $result = $this->func->selectQuery($query);
        echo json_encode($result);
    }

    public function createFolder($id) {
        // Define the folder path
        $folderPath = '../uploads/' . $id; // Assuming you want to save the folder inside an 'uploads' directory
    
        // Check if the folder already exists
        if (!file_exists($folderPath)) {
            // Create the folder with permissions (0755 allows read/write/execute for owner and read/execute for others)
            mkdir($folderPath, 0755);
        }
           
    }

    function saveImageToUserFolder($imageFile, $id, $categoryName) {
        $uploadDir = "../uploads/" . $id . "/";
        
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return false;
            }
        }
    
        $imageExtension = strtolower(pathinfo($imageFile['name'], PATHINFO_EXTENSION));
        $targetFile = $uploadDir . $categoryName . '.' . $imageExtension;
    
        if (getimagesize($imageFile["tmp_name"]) !== false) {
            if (move_uploaded_file($imageFile["tmp_name"], $targetFile)) {
                return true;
            }
        }
    
        return false;
    }
    
    
    

    public function signup() {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $password = $_POST['password'];
        $address = $_POST['address'];
    
        // Check if email already exists
        $query = "SELECT * FROM users WHERE email = '$email'";
        $result = $this->func->selectQuery($query);
        if (!empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
            return;
        }
    
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $create_at = date('Y-m-d H:i:s');
        $role = 'restaurant';
    
        // Insert into users table
        $query = "INSERT INTO users (name, email, phone,address, password, role, created_at) 
                  VALUES ('$name', '$email', '$phone', '$address','$hashedPassword', '$role', '$create_at')";
        $result = $this->func->inupdel($query);
    
        if ($result) {
            // Get inserted user ID
            $query = "SELECT id FROM users WHERE email = '$email'";
            $userData = $this->func->selectQuery($query);
    

            if (!empty($userData)) {
                $user_id = $userData[0]['id'];
                
                //create folder for the user
                $msg = $this->createFolder($user_id);

                
                // Insert into restaurant table
                $query = "INSERT INTO restaurants (user_id, name, address, phone) 
                          VALUES ('$user_id', '$name', '$address', '$phone')";
                $result = $this->func->inupdel($query);

                $mailInfo = sendMail($email,$name,'Registration Success on Zomato', 'Your registration in zomato as restaurant is successful. Please wait for the admin aproval. Thank you for signing up!');
    
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Registration Success '.$msg]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to create restaurant']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to fetch user ID']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User registration failed']);
        }
    }

   
    public function get_user_id(){
        session_start();
        $email = $_SESSION['email'];
        $query = "Select id from users where email = '$email'";
        $result = $this->func->selectQuery($query);
        return $result[0]['id'];
    }

    public function signin() {
        error_reporting(0);
        header('Content-Type: application/json');
    
        $email = $_POST['email'];
        $password = $_POST['password'];
    
        $query = "SELECT * FROM users WHERE email = '$email' and role = 'restaurant' and STATUS != 'blocked'";
        $result = $this->func->selectQuery($query);
    
        if (empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid Email or Blocked User']);
            return;
        }
    
        $orgPassword = $result[0]['password'];
    
        if (password_verify($password, $orgPassword)) {
            session_start();
            $_SESSION['email'] = $email;
            $_SESSION['id'] = $this->get_user_id();
            if($result[0]['STATUS'] == 'pending') {
                echo json_encode(['status' => 'pending', 'message' => 'User Valid']);
            }
            else if($result[0]['STATUS'] == 'process'){
                echo json_encode(['status' => 'process', 'message' => 'User Valid']);
            }
            else{
                echo json_encode(['status' => 'success', 'message' => 'User Valid']);
            }

        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid Password']);
        }
    }

    public function getRestroName() {
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $email = $_SESSION['email'];
            $query = "SELECT name FROM users WHERE email = '{$email}'";
            $result = $this->func->selectQuery($query);
    
            if (!empty($result)) {
                echo json_encode(['status' => 'success', 'message' => $result[0]['name']]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'User not found']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Session Not Active']);
        }
    }

    public function addCategory() {
        session_start();
    
        if (isset($_SESSION['email'], $_SESSION['id']) && !empty($_SESSION['email']) && !empty($_SESSION['id'])) {
            $name = $_POST['name'];
            $user_id = $_SESSION['id'];
    
            // Check if category already exists
            $query = "SELECT * FROM categories WHERE user_id = '$user_id' AND name = '$name'";
            $result = $this->func->selectQuery($query);
            if (!empty($result)) {
                echo json_encode(['status' => 'error', 'message' => 'Category Already Registered']);
                return;
            }
    
            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                $image = $_FILES['image'];
                $imgext = $image['name'];
                $ext = pathinfo($imgext, PATHINFO_EXTENSION);
                $safe_name = strtolower(str_replace(" ", "_", $name));
                $image_url = 'uploads/'.$user_id . '/' . $safe_name . '.' . $ext;
    
                if ($this->saveImageToUserFolder($image, $user_id, $safe_name)) {
                    $query = "INSERT INTO categories (name, user_id, image) VALUES ('$name', '$user_id', '$image_url')";
                    $result = $this->func->inupdel($query);
    
                    if (empty($result)) {
                        echo json_encode(['status' => 'error', 'message' => 'Category Not Updated']);
                    } else {
                        echo json_encode(['status' => 'success', 'message' => 'Category Updated Successfully']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Image Not Saved']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No Image Uploaded']);
            }
        }
    }
    

    
    public function deleteCat(){
        
        session_start();
        $user_id = $_SESSION['id'];
        if (isset($_SESSION['email']) && !empty($_SESSION['email']) && isset($_SESSION['id']) && !empty($_SESSION['id'])) {
            $id = $_POST['id'];
            $query = "DELETE FROM categories WHERE id = '$id'";
            $result = $this->func->inupdel($query);
            if($result > 0){
                echo json_encode(['status'=>'success','message'=>'Category deleted successfully']);
                exit();
            }
            else{
                echo json_encode(['status'=>'error','message'=>'Something went wrong while deleting category']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Category deleted successfully']);

        }
    }
    
    

    public function getAllCat() {
        session_start();
    
        if (isset($_SESSION['email'], $_SESSION['id']) && !empty($_SESSION['email']) && !empty($_SESSION['id'])) {
            $user_id = $_SESSION['id'];
    
            // Fetch categories with image
            $categories = $this->func->selectQuery("SELECT id, name, image FROM categories WHERE user_id = '$user_id'");
    
            if ($categories) {
                $categoryData = [];
                foreach ($categories as $category) {
                    $categoryData[] = [
                        'id' => $category['id'],
                        'name' => $category['name'],
                        'image' => $category['image'] // e.g., '2/category_name.png'
                    ];
                }
    
                echo json_encode(['status' => 'success', 'categories' => $categoryData]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No categories found']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        }
    }
    
    

    // Function to fetch categories from the database
    private function getCategoriesFromDatabase() {


        $query = "SELECT name FROM categories";
        $result = $this->func->selectQuery($query);

        if ($result && $result->num_rows > 0) {
            $categories = [];
            
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row['name'];  
            }
            return $categories;  
        } else {
            return false;  
        }
    }


    public function logOut() {
        session_start();
    
        if (isset($_SESSION['email'])) {
            session_unset();
            session_destroy();
            echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
        } else {
            echo json_encode(['status' => 'info', 'message' => 'Already logged out']);
        }
    }
    
    public function submitDoc(){
        session_start();
        if (isset($_SESSION['email']) && !empty($_SESSION['email']) && isset($_SESSION['id']) && !empty($_SESSION['id'])) {
            $email = $_SESSION['email']??'';
            $id = $_SESSION['id']??'';
            $gstin = $_POST['gstin']??'';
            $fssai = $_POST['fssai']??'';
            $pan = $_POST['pan']??'';
            $shopAct = $_POST['shopAct']??'';
            $tradeLicense = $_POST['tradeLicense']??'';
            $created_at = date('Y-m-d H:i:s');
            $updated_at = date('Y-m-d H:i:s');
            $query = "Insert into restaurant_details (user_id,email,gstin,fssai_license,pan_number,shop_license,trade_license,created_at,updated_at)
                        values
                        ('$id','$email','$gstin','$fssai','$pan','$shopAct','$tradeLicense','$created_at','$updated_at')";

            $result = $this->func->inupdel($query);
            if(!empty($result)){
                $query = "UPDATE users SET status = 'process' WHERE email = '$email'";
                $this->func->inupdel($query);
                sendMail($email,'RESTAURANT ADMIN','Registration Success on Zomato', 'Your application in zomato as restaurant is successful. Please wait for the admin aproval. Thank you for signing up!');
                echo json_encode(["status"=>"success","message"=>"Application Submitted. Wait for admin approval"]);
                exit();
            }
            else{
                echo json_encode(['status'=>'error','message'=>'Something went wrong']);
                exit();
            }
        }
    }

    //food.html
    public function getCategories() {
        session_start();
        if (isset($_SESSION['email']) && !empty($_SESSION['id'])) {
            $user_id = $_SESSION['id'];
            $query = "SELECT id, name FROM categories where user_id = '$user_id'";
            $result = $this->func->selectQuery($query); 
    
            if ($result) {
                echo json_encode(['status' => 'success', 'data' => $result]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No categories found']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        }
        exit();
    }

    public function addFood(){
        session_start();
        if (isset($_SESSION['email']) && !empty($_SESSION['id']) && isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $restaurant_id = $_SESSION['id'];
            $item_name = $_POST['item_name'];
            $description = $_POST['description']; 
            $price = $_POST['price'];
            $image = $_FILES['image'];
            $category = $_POST['category'];
        
            $imgext = $_FILES['image']['name'];
            $ext = pathinfo($imgext, PATHINFO_EXTENSION);    
            $image_url = $restaurant_id.'/'.strtolower(str_replace(" ", "_", $item_name)).'.'.$ext;

            $this->saveImageToUserFolder($image, $restaurant_id,strtolower(str_replace(" ", "_", $item_name)));
            

            $query = "Insert into menus (restaurant_id,item_name,description,price,image_url,category_id) 
                        values
                      ('$restaurant_id','$item_name','$description','$price','$image_url','$category')";
            $result = $this->func->inupdel($query);

            if($result > 0){
                echo json_encode(['status' => 'success','message' => 'Food Added Successfully']);
            }
            else{
                echo json_encode(['status' => 'error', 'message'=>'Something went wrong while adding the food']);
            }
            exit();
        }
        else{
            echo json_encode(['status' =>'error','message'=>'Else part']);
        }
    }

    public function fetchFoods(){
        session_start();
        if (isset($_SESSION['email']) && !empty($_SESSION['id'])){
            $id = $_SESSION['id'];

            // SQL query to fetch food items from the menus table along with category name
            $sql = "
                SELECT 
                    m.id AS food_id,
                    m.item_name AS food_name,
                    m.price AS food_price,
                    m.description AS food_desc,
                    m.category_id AS food_category_id,
                    m.image_url as Image_url,
                    c.name AS category_name
                FROM 
                    menus m
                INNER JOIN 
                    categories c ON m.category_id = c.id
                WHERE 
                    m.restaurant_id = '$id'"; 

            $result = $this->func->selectQuery($sql);
            if ($result && count($result) > 0) {
                // Send the response with food items
                echo json_encode([
                    'status' => 'success',
                    'foods' => $result
                ]);
            } else {
                // No foods found, send an appropriate response
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No food items found for this restaurant.'
                ]);
            }
        } else {
            // Session is not valid, return an error response
            echo json_encode([
                'status' => 'error',
                'message' => 'User is not logged in or session expired.'
            ]);
        }
        
     }

     function deleteFood(){
        session_start();
        if(isset($_SESSION['email']) && !empty($_SESSION['id'])){
            $id = $_POST['id'];
            $query = "delete from menus where id = '$id'";
            $result = $this->func->inupdel($query);
            if($result > 0){
                echo json_encode(['status'=>'success','message'=>'Food Item Deleted Successfully']);
                exit();
            }
            else{
                echo json_encode(['status'=>'error','message'=>'Something Happend Wrong']);
                exit();
            }
        }
     }


     function getOrders() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $restroQuery = "SELECT name AS restro FROM users WHERE email = '$email'";
        $restroResult = $this->func->selectQuery($restroQuery);
    
        if (empty($restroResult)) {
            echo json_encode(['status' => 'error', 'message' => 'Restro not found']);
            return;
        }
    
        $restro = $restroResult[0]['restro'];
    
        $query = "SELECT 
                    MIN(c1.id) AS cart_id,
                    c1.user_id,
                    u.name AS customer_name,
                    c1.status,
                    MIN(c1.price) AS price,
                    MIN(c1.created_at) AS order_time,
                    (SELECT dish_name 
                    FROM cart AS c2 
                    WHERE c2.user_id = c1.user_id 
                    AND c2.restaurant = '$restro' 
                    ORDER BY c2.created_at ASC 
                    LIMIT 1) AS first_product,
                    (SELECT COUNT(*) 
                    FROM cart AS c3 
                    WHERE c3.user_id = c1.user_id 
                    AND c3.restaurant = '$restro') AS items_count
                FROM cart AS c1
                JOIN users AS u ON c1.user_id = u.id
                WHERE c1.restaurant = '$restro'
                GROUP BY c1.user_id, c1.status, u.name
                ORDER BY 
                    CASE 
                        WHEN c1.status = 'ordered' THEN 1
                        WHEN c1.status = 'preparing' THEN 2
                        WHEN c1.status = 'delivered' THEN 3
                        WHEN c1.status = 'cancelled' THEN 4
                        ELSE 5
                    END,
                    MIN(c1.created_at) DESC;
                
                            ";
    
        $result = $this->func->selectQuery($query);
    
        echo json_encode([
            'status' => 'success',
            'orders' => $result
        ]);
    }

    function updateOrderStatus() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $restroQuery = "SELECT name AS restro FROM users WHERE email = '$email'";
        $restroResult = $this->func->selectQuery($restroQuery);
    
        if (empty($restroResult)) {
            echo json_encode(['status' => 'error', 'message' => 'Restro not found']);
            return;
        }
    
        $order_id = $_POST['order_id'];
        $status = $_POST['status'];
    
        $query = "SELECT user_id FROM cart WHERE id = '$order_id'";
        $result = $this->func->selectQuery($query);
        
        if (empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $result[0]['user_id'];
    
        $query = "Select email,name from users where id = '$user_id'";
        $result = $this->func->selectQuery($query);

        $custEmail = $result[0]['email'];
        $custName = $result[0]['name'];


        $updateQuery = "UPDATE cart SET status = '$status' WHERE user_id = '$user_id'";
        $updateResult = $this->func->inupdel($updateQuery);
    
        if ($updateResult) {
            sendMail($custEmail,$custName,'Order Status', "Thanks for waiting, your order is '$status'. Thanks for choosing Us. Team Zomato");

            echo json_encode(['status' => 'success', 'message' => 'Status updated']);
            exit();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update status']);
        }
    }

    function getOrderDetails(){
        header('Content-Type: application/json');
        $order_id = $_POST['order_id'];
    
        // Step 1: Get the user_id using cart_id
        $query = "SELECT user_id, restaurant FROM cart WHERE id = '$order_id' LIMIT 1";
        $orderInfo = $this->func->selectQuery($query);
    
        if (empty($orderInfo)) {
            echo json_encode(['success' => false, 'message' => 'Order not found']);
            return;
        }
    
        $user_id = $orderInfo[0]['user_id'];
        $restaurant = $orderInfo[0]['restaurant'];
    
        // Step 2: Get user details
        $userQuery = "SELECT name AS customer_name, phone, address AS delivery_address FROM users WHERE id = '$user_id'";
        $userData = $this->func->selectQuery($userQuery);
    
        // Step 3: Get all items from the cart for this user & restaurant
        $cartQuery = "SELECT dish_name, quantity, price, created_at, status FROM cart 
                      WHERE user_id = '$user_id' AND restaurant = '$restaurant'";
        $cartItems = $this->func->selectQuery($cartQuery);
    
        if (empty($cartItems) || empty($userData)) {
            echo json_encode(['success' => false, 'message' => 'Cart or user data not found']);
            return;
        }
    
        // Step 4: Calculate totals
        $subtotal = 0;
        foreach ($cartItems as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
    
        $tax = $subtotal; 
        $total = $subtotal;
    
        // Step 5: Build response
        $response = [
            'order' => [
                'order_id' => $order_id,
                'order_time' => $cartItems[0]['created_at'],
                'status' => $cartItems[0]['status'],
                'customer_name' => $userData[0]['customer_name'],
                'phone' => $userData[0]['phone'],
                'delivery_address' => $userData[0]['delivery_address'],
                'items' => $cartItems,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total
            ],
            'success' => true
        ];
    
        echo json_encode($response);
        return;
    }

    public function getRestaurantGraph() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $restroQuery = "SELECT name AS restaurant FROM users WHERE email = '$email'";
        $restroResult = $this->func->selectQuery($restroQuery);
    
        if (empty($restroResult)) {
            echo json_encode(['status' => 'error', 'message' => 'Restro not found']);
            return;
        }
    
            $restaurant = $restroResult[0]['restaurant'];
    
            $labels = [];
            $dailyRevenue = [];
            $dailyOrders = [];
    
            for ($i = 6; $i >= 0; $i--) {
                $day = date('Y-m-d', strtotime("-$i days"));
                $labels[] = date('l', strtotime($day));
    
                // Revenue
                $query = "SELECT SUM(price * quantity) AS total FROM cart 
                          WHERE restaurant = '$restaurant' AND DATE(created_at) = '$day' AND status != 'cancel'";
                $total = $this->func->selectQuery($query)[0]['total'];
                $dailyRevenue[] = $total ? (float)$total : 0;
    
                // Orders
                $query = "SELECT COUNT(*) AS orders FROM cart 
                          WHERE restaurant = '$restaurant' AND DATE(created_at) = '$day' AND status != 'cancel'";
                $count = $this->func->selectQuery($query)[0]['orders'];
                $dailyOrders[] = $count ? (int)$count : 0;
            }
    
            echo json_encode([
                'status' => 'success',
                'chartLabels' => $labels,
                'chartRevenue' => $dailyRevenue,
                'chartOrders' => $dailyOrders
            ]);
    }

    public function getCategoryChartData() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
    
        // Get restaurant ID
        $userQuery = "SELECT id FROM users WHERE email = '$email'";
        $userResult = $this->func->selectQuery($userQuery);
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'Restaurant not found']);
            return;
        }
        $userId = $userResult[0]['id'];
    
        // Get category distribution
        $query = "SELECT c.name AS category, GROUP_CONCAT(m.item_name SEPARATOR ', ') AS items, COUNT(m.id) AS total
                  FROM categories c
                  LEFT JOIN menus m ON m.category_id = c.id AND m.restaurant_id = '$userId'
                  WHERE c.user_id = '$userId'
                  GROUP BY c.name";
    
        $result = $this->func->selectQuery($query);
    
        $labels = [];
        $data = [];
        $tooltips = [];
    
        foreach ($result as $row) {
            $labels[] = $row['category'];
            $data[] = (int)$row['total'];
            $tooltips[] = $row['items'] ?: 'No items';
        }
    
        echo json_encode([
            'status' => 'success',
            'labels' => $labels,
            'data' => $data,
            'tooltips' => $tooltips
        ]);
    }
    
    public function getDashboardData(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
    
        // Get restaurant ID
        $userQuery = "SELECT id FROM users WHERE email = '$email'";
        $userResult = $this->func->selectQuery($userQuery);
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'Restaurant not found']);
            return;
        }
        $user_id = $userResult[0]['id'];

        $today = date('Y-m-d');

        $query1 = "SELECT COUNT(*) AS orderCount FROM cart WHERE user_id = '$user_id' AND DATE(created_at) = '$today'";
        $query2 = "SELECT COUNT(*) AS categoryCount FROM categories WHERE user_id = '$user_id'";
        $query3 = "SELECT COUNT(*) AS menuCount FROM menus WHERE restaurant_id = '$user_id '";

        $orderCount = $this->func->selectQuery($query1);
        $categoryCount = $this->func->selectQuery($query2);
        $menuCount = $this->func->selectQuery($query3);

        $response = [
            'orderRequest' => $orderCount[0]['orderCount'] ?? 0,
            'totalCategories' => $categoryCount[0]['categoryCount'] ?? 0,
            'totalMenu' => $menuCount[0]['menuCount'] ?? 0,
            'date' => date('d M Y')
        ];

        echo json_encode($response);
    }
    
    
    
    
    
    public function index() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'signup') {
            $this->signup();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'signin'){
            $this->signin();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'getRestroName'){
            $this->getRestroName();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'logOut'){
            $this->logOut();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'addCategory'){
            $this->addCategory();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'deleteCat'){
            $this->deleteCat();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'getAllCat'){
            $this->getAllCat();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'submitDoc'){
            $this->submitDoc();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'getCategories'){
            $this->getCategories();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'addFood'){
            $this->addFood();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'fetchFoods'){
            $this->fetchFoods();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'deleteFood'){
            $this->deleteFood();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'getOrders'){
            $this->getOrders();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateOrderStatus'){
            $this->updateOrderStatus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getOrderDetails'){
            $this->getOrderDetails();
        }
        else if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getRestaurantGraph') {
            $this->getRestaurantGraph();
        }
        else if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getCategoryChartData') {
            $this->getCategoryChartData();
        }
        else if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'getDashboardData') {
            $this->getDashboardData();
        }
        
    }
}

$controller = CustomerController::getInstance();
$controller->index();
?>