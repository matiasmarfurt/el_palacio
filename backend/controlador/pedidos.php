<?php
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../modelo/pedido.php';

$pedidoModel = new Pedido($conn);

// Listar todos los pedidos
function listarPedidos()
{
    global $pedidoModel;
    echo json_encode($pedidoModel->obtenerTodos());
}

// Mostrar un pedido por ID
function mostrarPedido($id)
{
    global $pedidoModel;
    $pedido = $pedidoModel->obtenerPorId($id);

    if ($pedido) {
        $pedido['detalles'] = $pedidoModel->obtenerDetalles($id);
        echo json_encode($pedido);
    } else {
        echo json_encode(["error" => "Pedido no encontrado"]);
    }
}

// Buscar pedidos por texto (numero, usuario, email, estado)
function buscarPedidos($texto)
{
    global $pedidoModel;
    echo json_encode($pedidoModel->buscar($texto));
}

// Obtener pedido por número de pedido
function obtenerPedidoPorNumero($numero_pedido)
{
    global $pedidoModel;
    $pedido = $pedidoModel->obtenerPorNumeroPedido($numero_pedido);

    if ($pedido) {
        $pedido['detalles'] = $pedidoModel->obtenerDetalles($pedido['id_pedido']);
        echo json_encode($pedido);
    } else {
        echo json_encode(["error" => "Pedido no encontrado"]);
    }
}

// Crear pedido
// $data viene del body (JSON) y debe incluir: id_usuario (o null), total (puede venir, se recalculará), direccion_entrega, telefono, notas (opcional), metodo_pago, productos (array de {id_producto, cantidad})
function crearPedido($data)
{
    global $pedidoModel;

    $required = ['direccion_entrega', 'productos', 'metodo_pago'];
    foreach ($required as $r) {
        if (!isset($data[$r])) {
            echo json_encode(["error" => "Faltan datos requeridos: $r"]);
            return;
        }
    }

    $id_usuario = isset($data['id_usuario']) && $data['id_usuario'] ? $data['id_usuario'] : null;
    $direccion = $data['direccion_entrega'];
    $telefono = $data['telefono'] ?? '';
    $notas = $data['notas'] ?? null;
    $metodo_pago = $data['metodo_pago'];
    $productos = $data['productos'];

    try {
        $resultado = $pedidoModel->crear(
            $id_usuario,
            $direccion,
            $telefono,
            $notas,
            $metodo_pago,
            $productos
        );

        if ($resultado) {
            echo json_encode([
                "mensaje" => "Pedido creado exitosamente",
                "id_pedido" => $resultado['id_pedido'],
                "numero_pedido" => $resultado['numero_pedido']
            ]);
        } else {
            echo json_encode(["error" => "No se pudo crear el pedido"]);
        }
    } catch (Exception $e) {
        echo json_encode(["error" => "Error al crear pedido: " . $e->getMessage()]);
    }
}

// Actualizar estado del pedido (espera JSON con id y estado)
function actualizarEstadoPedido($data)
{
    global $pedidoModel;

    if (!isset($data['id']) || !isset($data['estado'])) {
        echo json_encode(["error" => "Faltan datos requeridos"]);
        return;
    }

    $id = $data['id'];
    $estado = $data['estado'];

    if ($pedidoModel->actualizarEstado($id, $estado)) {
        echo json_encode(["mensaje" => "Estado actualizado", "id" => $id, "estado" => $estado]);
    } else {
        echo json_encode(["error" => "No se pudo actualizar el estado"]);
    }
}
