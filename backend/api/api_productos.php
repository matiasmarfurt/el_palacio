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

require __DIR__ . "/../controlador/productos.php"; // Importar el controlador que maneja la lógica de negocio para productos

// Obtener el método de la solicitud HTTP (GET, POST, PUT, DELETE)
$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == "GET") {
    if (isset($_GET['buscar'])) {
        buscarProductos($_GET['buscar']); // Buscar productos por nombre
    } elseif (isset($_GET['id'])) {
        mostrarProducto($_GET['id']); // Mostrar un producto específico
    } else {
        listarProductos(); // Listar todos los productos
    }
} elseif ($requestMethod == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    agregarProducto($data['nombre'], $data['descripcion'], $data['precio'], $data['categoria']);
} elseif ($requestMethod == "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);
    modificarProducto($data['id'], $data['nombre'], $data['descripcion'], $data['precio'], $data['categoria']);
} elseif ($requestMethod == "DELETE") {
    if (isset($_GET['id'])) {
        eliminarProducto($_GET['id']);
    } else {
        echo json_encode(["error" => "Falta el parámetro id para eliminar"]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
