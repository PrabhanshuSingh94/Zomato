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
    
    // public function customerRecord() {
    //     $query = "SELECT * FROM customer";
    //     $result = $this->func->selectQuery($query);
    //     echo json_encode($result);
    // }

    public function signup(){
        $name = $_POST['name'];
        $email = $_POST['email'];
        $phone = $_POST['phone'];
        $password = $_POST['password'];
        $address = $_POST['address'];
    
        // Check if email exists
        $query = "SELECT * FROM users WHERE email = '$email'";
        $result = $this->func->selectQuery($query);
        if (!empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'Email is already exists']);
            exit();
        }
    
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $created_at = date('Y-m-d H:i:s');
        $role = 'customer';
    
        $query = "INSERT INTO users (name, email, phone, password, role, address, created_at)
                  VALUES ('$name', '$email', '$phone', '$hashedPassword', '$role', '$address', '$created_at')";
    
        $result = $this->func->inupdel($query);
    
        if ($result) {
            sendMail($email, $name, "Registration Sucess in zomato", "Congratulations.. you have successfully registered to the zomato");
            echo json_encode(['status' => 'success', 'message' => 'Registration success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Something went wrong']);
        }
    }
    
    public function signin() {
        $email = $_POST['email'];
        $password = $_POST['password'];
    
        $query = "SELECT * FROM users WHERE email = '$email' and role = 'customer' and STATUS != 'blocked'";
        $result = $this->func->selectQuery($query);
    
        if (empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid Email or Blocked User']);
            return;
        }
    
        $orgPassword = $result[0]['password'];
    
        if (password_verify($password, $orgPassword)) {
            session_start();
            $_SESSION['email'] = $email;
            echo json_encode(['status' => 'success', 'message' => 'User Valid']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid Password']);
        }
    }

    public function getUserName() {
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

    public function getCategories() {
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $query = "SELECT name, MIN(image) AS image FROM categories GROUP BY name";
            $result = $this->func->selectQuery($query);
            
            if (empty($result)) {
                echo json_encode(['status' => 'error', 'message' => 'No categories found']);
                exit();
            }
    
            echo json_encode(['status' => 'success', 'message' => 'Categories Found', 'categories' => $result]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        }
    }

    public function getBrands(){
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $query = "select name from users where role = 'restaurant' and status = 'approved'";
            $result = $this->func->selectQuery($query);
            if(empty($result)){
                echo json_encode(['status'=>'error','message'=>'Restaurant Not Found']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restaurant Fetched Successfully','brands'=>$result]);
        }
    }

    public function getRestaurantsByCategory(){
        
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $categoryName = $_POST['category'];
            $query = "SELECT 
                        u.name AS restaurant_name,
                        m.id,
                        m.item_name,
                        m.description,
                        m.price,
                        m.image_url,
                        u.address
                      FROM categories c
                      JOIN menus m ON c.id = m.category_id
                      JOIN users u ON u.id = c.user_id
                      WHERE c.name = '$categoryName'";
    
            $result = $this->func->selectQuery($query);
    
            if (empty($result)) {
                echo json_encode(['status' => 'error', 'message' => 'Restaurants not found']);
                exit();
            }
    
            echo json_encode(['status' => 'success', 'message' => $result]);
        }
    }


    public function getRandomMenus() {
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $query = "SELECT 
                        m.id,
                        m.item_name,
                        m.description,
                        m.price,
                        m.image_url,
                        u.name AS restaurant_name,
                        u.address
                      FROM menus m
                      JOIN users u ON m.restaurant_id = u.id
                      WHERE u.status = 'approved' AND u.role = 'restaurant'
                      ORDER BY RAND()
                      LIMIT 12"; 
    
            $result = $this->func->selectQuery($query);
    
            if (empty($result)) {
                echo json_encode(['status' => 'error', 'message' => 'No menus found']);
                exit();
            }
    
            echo json_encode(['status' => 'success', 'data' => $result]);
        }
    }
    
    function loadDishData() {
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {
            $menus_id = intval($_POST['id']); // Always cast to int for safety
    
            $mainDishQuery = "SELECT m.*, u.name AS restaurant, u.address  
                              FROM menus m 
                              JOIN users u ON m.restaurant_id = u.id 
                              WHERE m.id = '$menus_id'";
            $mainDishResult = $this->func->selectQuery($mainDishQuery);
    
            if ($mainDishResult && count($mainDishResult) > 0) {
                $mainDish = $mainDishResult[0]; 
    
                $categoryId = $mainDish['category_id'];
                $restaurantId = $mainDish['restaurant_id'];
    
                // Related dishes (same category and restaurant)
                $relatedSql = "SELECT m.*, u.name AS restaurant 
                               FROM menus m 
                               JOIN users u ON m.restaurant_id = u.id 
                               WHERE m.category_id = '$categoryId' 
                                 AND m.restaurant_id = '$restaurantId' 
                                 AND m.id != '$menus_id'
                               LIMIT 6";
                $relatedDishes = $this->func->selectQuery($relatedSql);
    
                // Recommended dishes (same restaurant, other categories)
                $recommendedSql = "SELECT m.*, u.name AS restaurant 
                                   FROM menus m 
                                   JOIN users u ON m.restaurant_id = u.id 
                                   WHERE m.restaurant_id = '$restaurantId' 
                                     AND m.id != '$menus_id' 
                                     AND m.category_id != '$categoryId' 
                                   ORDER BY RAND() 
                                   LIMIT 5";
                $recommendedDishes = $this->func->selectQuery($recommendedSql);
            } else {
                $mainDish = [];
                $relatedDishes = [];
                $recommendedDishes = [];
            }
    
            echo json_encode([
                'status' => 'success',
                'mainDish' => $mainDish,
                'relatedDishes' => $relatedDishes,
                'recommendedDishes' => $recommendedDishes
            ]);
            exit();
        }
    
        echo json_encode(['status' => 'error', 'message' => 'Something went wrong']);
    }

    public function addToCart() {
        header('Content-Type: application/json');
        session_start();
    
        if (isset($_SESSION['email']) && !empty($_SESSION['email'])) {

            $email = $_SESSION['email'];
            $user_id = $this->func->selectQuery("select id from users where email = '$email'")[0]['id'];
    
            $item_name = $_POST['name'];
            $item_price = $_POST['price'];
            $item_qty = $_POST['quantity'] ?? 1;
            $restaurant = $_POST['restaurant'];
    
            // Check if restaurant is empty
            if (empty($restaurant)) {
                echo json_encode(['status' => 'error', 'message' => 'Restaurant is required']);
                return;
            }
    
            // Check existing restaurant in cart
            $query = "SELECT DISTINCT restaurant FROM cart WHERE user_id = '$user_id'";
            $result = $this->func->selectQuery($query);
    
            if (!empty($result)) {
                $fetchedRestro = $result[0]['restaurant'];
    
                if ($restaurant != $fetchedRestro) {
                    // Clear cart if restaurant is different
                    $deleteQuery = "DELETE FROM cart WHERE user_id = '$user_id'";
                    $this->func->inupdel($deleteQuery);
                }
            }
    
            // Check if item already exists in cart to update quantity
            $checkQuery = "SELECT * FROM cart WHERE user_id = '$user_id' AND dish_name = '$item_name'";
            $existing = $this->func->selectQuery($checkQuery);
    
            if (!empty($existing)) {
                // Update quantity
                $updateQuery = "UPDATE cart SET quantity = quantity + $item_qty WHERE user_id = '$user_id' AND dish_name = '$item_name'";
                $result = $this->func->inupdel($updateQuery);
            } else {
                // Insert new item
                $insertQuery = "INSERT INTO cart (user_id, dish_name, price, quantity, restaurant)
                                VALUES ('$user_id', '$item_name', $item_price, $item_qty, '$restaurant')";
                $result = $this->func->inupdel($insertQuery);
            }
    
            if ($result) {
                echo json_encode(['status' => 'success', 'message' => 'Item added to cart']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Database operation failed']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        }
    }

    public function updateCartItemQuantity() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];
        $item_name = $_POST['name'] ?? '';
        $new_quantity = isset($_POST['quantity']) ? (int)$_POST['quantity'] : 1;
    
        if (empty($item_name)) {
            echo json_encode(['status' => 'error', 'message' => 'Dish name is required']);
            return;
        }
    
        if ($new_quantity < 1) {
            // Optionally delete the item from cart if quantity is set to 0
            $deleteQuery = "DELETE FROM cart WHERE user_id = '$user_id' AND dish_name = '$item_name'";
            $result = $this->func->inupdel($deleteQuery);
            if ($result) {
                echo json_encode(['status' => 'success', 'message' => 'Item removed from cart']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to remove item']);
            }
            return;
        }
    
        $updateQuery = "UPDATE cart SET quantity = $new_quantity WHERE user_id = '$user_id' AND dish_name = '$item_name'";
        $result = $this->func->inupdel($updateQuery);
    
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Cart updated successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update cart']);
        }
    }
    
    function removeFromCart(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];

        $item = $_POST['name'];
        $query = "DELETE FROM cart WHERE user_id = '$user_id' AND dish_name = '$item'";
        $result = $this->func->inupdel($query);

        if($result){
            echo json_encode(['status' => 'success', 'message' => 'Cart updated successfully']);
            exit();
        }
        else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update cart']);
        }
        
    }

    function cartCount(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];

        $query = "Select count(*)as coun from cart where user_id = '$user_id' and STATUS IS NULL";
        $result = $this->func->selectQuery($query);
        
        echo json_encode(['status'=>'success','count'=>$result[0]['coun']]);
    }

    function loadCart(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];

        $query = " SELECT id, dish_name, price, quantity FROM cart WHERE user_id = '$user_id' and status IS NULL";
        $result = $this->func->selectQuery($query);
        if(empty($result)){
            echo json_encode(['status'=>'error','message'=>'no item found in the cart']);
            exit();
        }
        echo json_encode(['status'=>'success','items'=>$result]);

    }

    function updateQuantity(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];

        $item_id = $_POST['item_id'];
        $quantity = $_POST['quantity'];

        if($quantity == '1'){
            $query = "delete from cart where user_id = '$user_id' and id = '$item_id'";
            $result = $this->func->inupdel($query);
            if($result){
                echo json_encode(['status'=>'success','message'=>'cart item deleted']);
                exit();
            }
            echo json_encode(['status'=>'error','message'=>'cart item not deleted']);
            exit();
        }

        $query = "update cart set quantity = '$quantity' where user_id = '$user_id' and id = '$item_id'";
        $result = $this->func->inupdel($query);

        if($result){
            echo json_encode(['status'=>'success','message'=>'cart updated successfully']);
            exit();
        }
        echo json_encode(['status'=>'error','message'=>$quantity]);
    }

    function removeCartItem(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];

        $item_id = $_POST['item_id'];
        $query = "DELETE FROM cart WHERE user_id = '$user_id' AND id = '$item_id'";
        $result = $this->func->inupdel($query);

        if($result){
            echo json_encode(['status' => 'success', 'message' => 'Cart updated successfully']);
            exit();
        }
        else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update cart']);
        }
        
    }

    function getSuggestions(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        // Get the search input from GET or POST
        $searchTerm = isset($_POST['term']) ? $_POST['term'] : '';  
    
        $searchTermLike = "%$searchTerm%";
    
        // $query = "SELECT CONCAT(c.name, ' - ', m.item_name) AS suggestion 
        //           FROM categories c 
        //           CROSS JOIN menus m
        //           WHERE c.name LIKE '$searchTermLike' OR m.item_name LIKE '$searchTermLike'
        //           LIMIT 5";

        $query = "SELECT m.id as id, m.item_name AS suggestion 
                  FROM menus m 
                  
                  WHERE m.item_name LIKE '$searchTermLike'
                  LIMIT 5";
    
        // Use your function with binding
        $result = $this->func->selectQuery($query);
    
        echo json_encode($result);
    }

    function getTotalAmount(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];
    
        $query = "SELECT  price,  quantity  FROM cart WHERE user_id = '$user_id'";
        $result = $this->func->selectQuery($query);
    
    
        echo json_encode(['status' => 'success', 'items' => $result]);
    }

    function getAddress(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT address,phone FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
        echo json_encode(['status'=>'success','address'=>$userResult[0]['address'],'phone'=>$userResult[0]['phone']]);
    }


    function updateOrderStatus() {
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];
    
        if (!isset($_POST['status']) || empty($_POST['status'])) {
            echo json_encode(['status' => 'error', 'message' => 'Status not provided']);
            return;
        }
    
        $status = $_POST['status'];
    
        // Update query
        $updateQuery = "UPDATE cart SET status = '$status' WHERE user_id = '$user_id'";
        $result = $this->func->inupdel($updateQuery); // Assuming you have this method
    
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Cart status updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update cart']);
        }
    }

    function getOrderStatus(){
        header('Content-Type: application/json');
        session_start();
    
        if (!isset($_SESSION['email']) || empty($_SESSION['email'])) {
            echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
            return;
        }
    
        $email = $_SESSION['email'];
        $userResult = $this->func->selectQuery("SELECT id FROM users WHERE email = '$email'");
    
        if (empty($userResult)) {
            echo json_encode(['status' => 'error', 'message' => 'User not found']);
            return;
        }
    
        $user_id = $userResult[0]['id'];
    
        
        
        $query = "select status from cart where user_id = '$user_id'";
        $result = $this->func->selectQuery($query);

        echo json_encode(['status'=>'success','orderStatus'=>$result[0]['status']]);
    }
    
    
    
    
    
    
    public function index() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'signup') {
            $this->signup();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'signin'){
            $this->signin();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getUserName'){
            $this->getUserName();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'logOut'){
            $this->logOut();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getCategories'){
            $this->getCategories();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getBrands'){
            $this->getBrands();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getRestaurantsByCategory'){
            $this->getRestaurantsByCategory();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getRandomMenus'){
            $this->getRandomMenus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'loadDishData'){
            $this->loadDishData();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'addToCart'){
            $this->addToCart();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateCartItemQuantity'){
            $this->updateCartItemQuantity();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'removeFromCart'){
            $this->removeFromCart();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'cartCount'){
            $this->cartCount();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'loadCart'){
            $this->loadCart();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateQuantity'){
            $this->updateQuantity();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'removeCartItem'){
            $this->removeCartItem();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getSuggestions'){
            $this->getSuggestions();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getTotalAmount'){
            $this->getTotalAmount();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getAddress'){
            $this->getAddress();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateOrderStatus'){
            $this->updateOrderStatus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getOrderStatus'){
            $this->getOrderStatus();
        }
        
    }
}

$controller = CustomerController::getInstance();
$controller->index();
?>