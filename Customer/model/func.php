<?php
require_once('database.php');

class Func {
    private static $instance = null;
    private $db;
    
    private function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Func();
        }
        return self::$instance;
    }
    
    public function selectQuery($query) {
        $stmt = $this->db->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function inupdel($query) {
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->rowCount();
    }
}
?>
