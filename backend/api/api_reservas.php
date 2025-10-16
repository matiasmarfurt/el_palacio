<?php

require __DIR__ . "/../logs/log.php"; // Importar el archivo de configuración de registro de errores

// Habilitar CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar preflight OPTIONS
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

require __DIR__ . "/../controlador/reservas.php"; // Importar el controlador

// Obtener el método de la solicitud HTTP (GET, POST, PUT, DELETE)
$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == "GET") {
    listarReservas();
} elseif ($requestMethod == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        $data = $_POST;
    }

    // Crear reserva (validaciones básicas son responsabilidad del controlador)
    if (
        isset($data['nombre']) && isset($data['email']) && isset($data['telefono']) &&
        isset($data['personas']) && isset($data['fecha']) && isset($data['hora'])
    ) {
        crearReserva(
            $data['nombre'],
            $data['email'],
            $data['telefono'],
            $data['personas'],
            $data['fecha'],
            $data['hora'],
            $data['comentarios'] ?? ''
        );
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Datos insuficientes"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "error" => "Método no permitido"
    ]);
}
