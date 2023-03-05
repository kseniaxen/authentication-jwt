<?php 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once "./Config/Database.php";
include_once "./Objects/User.php";

//Connect DB
$database = new Database();
$db = $database->getConnection();

//Create User
$user = new User($db);

//Get date from JSON
$data = json_decode(file_get_contents("php://input"));

$user->firstname = $data->firstname;
$user->lastname = $data->lastname;
$user->email = $data->email;
$user->password = $data->password;

if(!empty($user->firstname) && !empty($user->email) && !empty($user->password) && $user->create()) {
    http_response_code(200);

    echo json_encode(
        array('message' => 'Пользователь был создан')
    );
} else {
    http_response_code(400);

    echo json_encode(
        array('message' => 'Невозможно создать пользователя')
    );
}

?>