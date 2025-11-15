<?php

require __DIR__ . "/../logs/log.php"; // Registro de errores

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

require __DIR__ . "/../controlador/pedidos.php"; // Controlador de pedidos

// Obtener el método HTTP de la solicitud
$requestMethod = $_SERVER["REQUEST_METHOD"];

switch ($requestMethod) {

    case "GET":
        // Buscar, obtener por numero, obtener por ID o listar todos
        if (isset($_GET['buscar'])) {
            buscarPedidos($_GET['buscar']);
        } elseif (isset($_GET['numero_pedido'])) {
            obtenerPedidoPorNumero($_GET['numero_pedido']);
        } elseif (isset($_GET['id'])) {
            mostrarPedido($_GET['id']);
        } else {
            listarPedidos();
        }
        break;

    case "POST":
        // Crear pedido (espera JSON en el body)
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit();
        }

        crearPedido($data);
        break;

    case "PUT":
        // Actualizar estado u otros cambios (espera JSON en el body)
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit();
        }

        actualizarEstadoPedido($data);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
