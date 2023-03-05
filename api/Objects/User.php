<?php

class User
{
    private $conn;
    private $table_name = "users";

    public $id;
    public $firstname;
    public $lastname;
    public $email;
    public $password;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create()
    {

        try {
            $query = "INSERT INTO " . $this->table_name . "
                    SET
                        firstname = :firstname,
                        lastname = :lastname,
                        email = :email,
                        password = :password";

            //Prepare
            $stmt = $this->conn->prepare($query);

            //Inject
            $this->firstname = htmlspecialchars(strip_tags($this->firstname));
            $this->lastname = htmlspecialchars(strip_tags($this->lastname));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->password = htmlspecialchars(strip_tags($this->password));

            //Bind
            $stmt->bindParam(":firstname", $this->firstname);
            $stmt->bindParam(":lastname", $this->lastname);
            $stmt->bindParam(":email", $this->email);

            //Hash password
            $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
            $stmt->bindParam(":password", $password_hash);

            //Create request
            if ($stmt->execute()) {
                return true;
            }
        } catch (Exception $ex) {
            echo 'Message: ' . $ex->getMessage();
        }
        return false;
    }

    public function emailExists()
    {
        try {
            $query = "SELECT id, firstname, lastname, password
                FROM " . $this->table_name . " 
                WHERE email = ? 
                LIMIT 0,1";

            $stmt = $this->conn->prepare($query);

            $this->email = htmlspecialchars(strip_tags($this->email));

            $stmt->bindParam(1, $this->email);

            $stmt->execute();

            $num = $stmt->rowCount();

            if ($num > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                $this->id = $row['id'];
                $this->firstname = $row['firstname'];
                $this->lastname = $row['lastname'];
                $this->password = $row['password'];

                return true;
            }
        } catch (Exception $ex) {
            echo 'Message: ' . $ex->getMessage();
        }
        return false;
    }

    public function update()
    {
        try {
            $password_set = !empty($this->password) ? ", password = :password" : "";

            $query = "UPDATE " . $this->table_name . " 
                    SET
                        firstname = :firstname,
                        lastname = :lastname,
                        email = :email
                        {$password_set}
                    WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            $this->firstname = htmlspecialchars(strip_tags($this->firstname));
            $this->lastname = htmlspecialchars(strip_tags($this->lastname));
            $this->email = htmlspecialchars(strip_tags($this->email));

            $stmt->bindParam(":firstname", $this->firstname);
            $stmt->bindParam(":lastname", $this->lastname);
            $stmt->bindParam(":email", $this->email);

            if (!empty($this->password)) {
                $this->password = htmlspecialchars(strip_tags($this->password));
                $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
                $stmt->bindParam(":password", $password_hash);
            }

            $stmt->bindParam(":id", $this->id);

            if ($stmt->execute()) {
                return true;
            }
        } catch (Exception $ex) {
            echo 'Message: ' . $ex->getMessage();
        }

        return false;
    }
}
