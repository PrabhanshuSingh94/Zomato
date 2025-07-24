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
    
        $query = "SELECT * FROM users WHERE email = '$email'";
        $result = $this->func->selectQuery($query);
    
        if (empty($result)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid Email']);
            return;
        }
    
        $orgPassword = $result[0]['password'];
    
        if (password_verify($password, $orgPassword)) {
            session_start();
            $_SESSION['email'] = $email;
            $_SESSION['id'] = $this->get_user_id();
            echo json_encode(['status' => 'success', 'message' => 'User Valid']);
            // echo json_encode(['status' => 'success', 'message' => 'User Valid with ID: ' . $_SESSION['id']]);

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

    //update code:
    public function fetchRequests(){
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $query = "SELECT * FROM restaurant_details where STATUS = 'pending'";
            $result = $this->func->selectQuery($query);
            
            if (empty($result)) {
                echo json_encode(["status" => "error", "message" => "No pending requests found."]);
            } else {
                echo json_encode(["status" => "success", "data" => $result]);
            }
        }
    } 

    public function updateStatus(){
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $email = $_POST['email'];
            $status = $_POST['status'];

            $query = "update users set STATUS =  '$status' where email = '$email'";
            $result = $this->func->inupdel($query);
            $query = "update restaurant_details set STATUS =  '$status' where email = '$email'";
            $result = $this->func->inupdel($query);

            if($result > 0){
                sendMail($email,"Restaurant Admin","Regarding Document Verification","Dear Restaurant Admin, We are glad to inform you that your restaurant listing is approved on zomato and now you can sell your dishes in our platform. Thanks");
                echo json_encode(['status'=>'success','message'=>'Status Updated Successfully']);
                exit();
            }
            else{
                echo json_encode(['status'=>'error','message'=>'Status Not Updated']);
            }
        }
    }

    public function getAllResto(){
        header('Content-Type: application/json');
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $query = "SELECT name, email, phone, address, created_at from users where role = 'restaurant' status != 'pending'";
            $result = $this->func->selectQuery($query);

            if(empty($result)){
                echo json_encode(['status'=>'error','message'=>'No Restro Found']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restro Found','restroList'=>$result]);
        }
    }

    public function loadRestroData(){
        header('Content-Type: application/json');
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $query = "SELECT name, email, phone, address, created_at,STATUS from users where role = 'restaurant' and STATUS != 'pending'";
            $result = $this->func->selectQuery($query);

            if(empty($result)){
                echo json_encode(['status'=>'error','message'=>'No Restro Found']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restro Found','restroList'=>$result]);
        }
    }

    public function updateRestroStatus(){
        header('Content-Type: application/json');
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $status = $_POST['status'];
            $userEmail = $_POST['email'];
            $query = "update users set STATUS = '$status' where email = '$userEmail'";
            $result = $this->func->inupdel($query);

            if($result == 0){
                echo json_encode(['status'=>'error','message'=>'Something went wrong']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restro Updated']);
        }
    }
    
    public function loadUsersData(){
        header('Content-Type: application/json');
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $query = "SELECT name, email, phone, address, created_at,STATUS from users where role = 'customer'";
            $result = $this->func->selectQuery($query);

            if(empty($result)){
                echo json_encode(['status'=>'error','message'=>'No Restro Found']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restro Found','restroList'=>$result]);
        }
    }

    public function updateUserStatus(){
        header('Content-Type: application/json');
        session_start();
        if($_SESSION['email'] &&  !empty($_SESSION['email'])){
            $status = $_POST['status'];
            $userEmail = $_POST['email'];
            $query = "update users set STATUS = '$status' where email = '$userEmail'";
            $result = $this->func->inupdel($query);

            if($result == 0){
                echo json_encode(['status'=>'error','message'=>'Something went wrong']);
                exit();
            }
            echo json_encode(['status'=>'success','message'=>'Restro Updated']);
        }
    }
    
    function getBasicData(){
        header('Content-Type: application/json');
        session_start();
        if ($_SESSION['email'] && !empty($_SESSION['email'])) {
    
            // Total restaurants
            $query = "SELECT COUNT(name) AS totalRestro FROM users WHERE role = 'restaurant'";
            $totalRestro = $this->func->selectQuery($query)[0]['totalRestro'];
    
            // Recent customers (last 24 hrs)
            $query = "SELECT COUNT(*) AS recentCustomers 
                      FROM users 
                      WHERE role = 'customer' AND created_at >= NOW() - INTERVAL 1 DAY";
            $recentCustomers = $this->func->selectQuery($query)[0]['recentCustomers'];
    
            // Total users (customers)
            $query = "SELECT COUNT(name) AS totalUsers FROM users WHERE role = 'customer'";
            $totalUsers = $this->func->selectQuery($query)[0]['totalUsers'];
    
            // Recent restaurants (last 24 hrs)
            $query = "SELECT COUNT(*) AS recentRestaurants 
                      FROM users 
                      WHERE role = 'restaurant' AND created_at >= NOW() - INTERVAL 1 DAY";
            $recentRestaurants = $this->func->selectQuery($query)[0]['recentRestaurants'];
    
            // Pending approval restaurants
            $query = "SELECT COUNT(name) AS restroApproval FROM users WHERE role = 'restaurant' AND STATUS = 'pending'";
            $restroApproval = $this->func->selectQuery($query)[0]['restroApproval'];
    
            // Recent pending requests (last 24 hrs)
            $query = "SELECT COUNT(*) AS recentPending 
                      FROM users 
                      WHERE role = 'restaurant' AND STATUS = 'pending' AND created_at >= NOW() - INTERVAL 1 DAY";
            $recentRequest = $this->func->selectQuery($query)[0]['recentPending'];
    
            $date = date('Y-m-d');
    
            echo json_encode([
                'status' => 'success',
                'totalRestro' => $totalRestro,
                'recentCustomers' => $recentCustomers,
                'totalUsers' => $totalUsers,
                'recentRestaurants' => $recentRestaurants,
                'restroApproval' => $restroApproval,
                'recentRequest' => $recentRequest,
                'date' => $date
            ]);
        }
    }
    
    public function getBasicGraph(){
        // Last 7 days customer & restaurant joins
        header('Content-Type: application/json');
        session_start();
        if ($_SESSION['email'] && !empty($_SESSION['email'])) {
            $labels = [];
            $customersPerDay = [];
            $restaurantsPerDay = [];
            
            for ($i = 6; $i >= 0; $i--) {
                $day = date('Y-m-d', strtotime("-$i days"));
                $labels[] = date('l', strtotime($day)); // Monday, Tuesday, etc.
            
                $query = "SELECT COUNT(*) AS count FROM users WHERE role = 'customer' AND DATE(created_at) = '$day'";
                $customersPerDay[] = $this->func->selectQuery($query)[0]['count'];
            
                $query = "SELECT COUNT(*) AS count FROM users WHERE role = 'restaurant' AND DATE(created_at) = '$day'";
                $restaurantsPerDay[] = $this->func->selectQuery($query)[0]['count'];
            }
            echo json_encode(['status'=>'success','chartLabels' => $labels,
            'chartCustomers' => $customersPerDay,
            'chartRestaurants' => $restaurantsPerDay,
            ]);
        }

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
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'fetchRequests'){
            $this->fetchRequests();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateStatus'){
            $this->updateStatus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getAllResto'){
            $this->getAllResto();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'loadRestroData'){
            $this->loadRestroData();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['action']) && $_GET['action'] === 'loadUsersData'){
            $this->loadUsersData();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateRestroStatus'){
            $this->updateRestroStatus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'updateUserStatus'){
            $this->updateUserStatus();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getBasicData'){
            $this->getBasicData();
        }
        else if($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['action']) && $_GET['action'] === 'getBasicGraph'){
            $this->getBasicGraph();
        }
        
    }
}

$controller = CustomerController::getInstance();
$controller->index();
?>