<?php

class Database {
    private $host = "localhost";
    private $db_name = "authentication_jwt";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $ex) {
            echo "Ошибка соединения с БД: " . $ex->getMessage();
        }
        return $this->conn;
    }

}

?>