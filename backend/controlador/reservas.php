<?php
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../modelo/reserva.php';

$reservaModel = new Reserva($conn);

// Función para crear una reserva: valida campos básicos y delega al modelo
function crearReserva($nombre, $email, $telefono, $personas, $fecha, $hora, $comentarios)
{
    global $reservaModel;

    // Validación mínima de campos requeridos
    if (empty($nombre) || empty($email) || empty($telefono) || empty($personas) || empty($fecha) || empty($hora)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Faltan campos obligatorios"]);
        return;
    }

    // Validación básica de formato
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Email inválido"]);
        return;
    }

    $personas = (int)$personas;
    if ($personas <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Número de personas inválido"]);
        return;
    }

    $resultado = $reservaModel->crear($nombre, $email, $telefono, $personas, $fecha, $hora, $comentarios);

    if ($resultado['success']) {
        http_response_code(201);
        echo json_encode(["success" => true, "insert_id" => $resultado['insert_id']]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $resultado['error'] ?? 'Error interno']);
    }
}

// Función para listar todas las reservas
function listarReservas()
{
    global $reservaModel;
    $resultado = $reservaModel->listarTodos();
    if ($resultado['success']) {
        echo json_encode([
            "success" => true,
            "reservas" => $resultado['data']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $resultado['error'] ?? 'Error al obtener reservas']);
    }
}
