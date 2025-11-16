<?php
require __DIR__ . "/../logs/log.php"; // Importar el archivo de configuración de registro de errores
require __DIR__ . "/../middleware/auth.php"; // Importar el middleware de autenticación
require __DIR__ . "/../controlador/usuarios.php"; // Importar el controlador que maneja la lógica de usuarios

// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar preflight OPTIONS (para CORS)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Obtener método HTTP de la solicitud
$requestMethod = $_SERVER["REQUEST_METHOD"];

// Listar usuarios (solo admin)
if ($requestMethod === "GET") {
    // requireAuth devuelve payload con info del usuario que hace la petición
    $payload = requireAuth("admin");

    $adminData = $usuarioModel->obtenerPorId($payload['id']); // datos del admin
    $usuarios = $usuarioModel->obtenerTodos(); // todos los usuarios

    echo json_encode([
        "success" => true,
        "admin" => $adminData,   // <--- información del administrador
        "usuarios" => $usuarios
    ]);
}

// Registro o login de usuario
elseif ($requestMethod === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "JSON inválido o vacío"]);
        exit();
    }

    // Registro
    if (isset($data['nombre_usuario'], $data['apellido_usuario'], $data['email'], $data['tipo'], $data['password'])) {
        registrarUsuario($data['nombre_usuario'], $data['apellido_usuario'], $data['email'], $data['tipo'], $data['password']);
    }
    // Login
    elseif (isset($data['nombre_usuario']) && isset($data['password'])) {
        loginUsuario($data['nombre_usuario'], $data['password']);
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Datos insuficientes"]);
    }
}

// Modificar usuario (solo admin)
elseif ($requestMethod === "PUT") {
    requireAuth("admin");
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id_usuario'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID de usuario requerido"]);
        exit();
    }
    modificarUsuario($data); // Llamada al controlador
}

// Eliminar usuario (solo admin)
elseif ($requestMethod === "DELETE") {
    requireAuth("admin");
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id_usuario'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "ID de usuario requerido"]);
        exit();
    }
    eliminarUsuario($data['id_usuario']); // Llamada al controlador
}
// Método no permitido
else {

    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
}
