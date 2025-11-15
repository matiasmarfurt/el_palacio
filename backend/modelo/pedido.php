<?php
// Modelo Pedido - interactúa con tablas pedido y detallepedido

class Pedido
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Obtener todos los pedidos con info de usuario
    public function obtenerTodos()
    {
        $sql = "SELECT p.*, u.nombre_usuario, u.email, u.apellido_usuario
                FROM pedido p
                LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
                ORDER BY p.fecha DESC";
        $result = $this->conn->query($sql);
        $pedidos = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $pedidos[] = $row;
            }
        }
        return $pedidos;
    }

    // Obtener pedido por ID
    public function obtenerPorId($id)
    {
        $sql = "SELECT p.*, u.nombre_usuario, u.email, u.apellido_usuario
                FROM pedido p
                LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE p.id_pedido = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        return $res->fetch_assoc();
    }

    // Obtener detalles (items) de un pedido
    public function obtenerDetalles($id_pedido)
    {
        $sql = "SELECT dp.id_detalle, dp.id_producto, dp.cantidad, dp.subtotal, pr.nombre, pr.precio
                FROM detallepedido dp
                INNER JOIN productos pr ON dp.id_producto = pr.id
                WHERE dp.id_pedido = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id_pedido);
        $stmt->execute();
        $res = $stmt->get_result();
        $detalles = [];
        if ($res && $res->num_rows > 0) {
            while ($row = $res->fetch_assoc()) {
                $detalles[] = $row;
            }
        }
        return $detalles;
    }

    // Crear nuevo pedido (recalcula precios desde productos)
    public function crear($id_usuario, $direccion_entrega, $telefono, $notas, $metodo_pago, $productos)
    {
        // Generar numero de pedido único
        $numero_pedido = 'PED-' . date('Ymd') . rand(1000, 9999);

        $this->conn->begin_transaction();

        try {
            // Insertar encabezado pedido
            $sql = "INSERT INTO pedido (fecha, total, id_usuario, direccion_entrega, estado, telefono, metodo_pago, numero_pedido, notas)
                    VALUES (NOW(), ?, ?, ?, 'recibido', ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error en prepare: " . $this->conn->error);
            }

            // Calculamos total a partir de la tabla productos
            $total_calculado = 0.0;
            $productos_a_insertar = [];

            // Preparar statement para obtener precio real
            $stmt_precio = $this->conn->prepare("SELECT precio FROM productos WHERE id = ?");
            if (!$stmt_precio) {
                throw new Exception("Error en prepare precio: " . $this->conn->error);
            }

            foreach ($productos as $p) {
                $id_producto = $p['id_producto'] ?? $p['id'] ?? null;
                $cantidad = isset($p['cantidad']) ? (int)$p['cantidad'] : 0;

                if (!$id_producto || $cantidad <= 0) {
                    throw new Exception("Producto inválido en carrito");
                }

                $stmt_precio->bind_param("i", $id_producto);
                $stmt_precio->execute();
                $res_precio = $stmt_precio->get_result();
                $row = $res_precio->fetch_assoc();

                if (!$row) {
                    throw new Exception("Producto no encontrado: {$id_producto}");
                }

                $precio_real = (float)$row['precio'];
                $subtotal = $precio_real * $cantidad;
                $total_calculado += $subtotal;

                $productos_a_insertar[] = [
                    'id_producto' => $id_producto,
                    'cantidad' => $cantidad,
                    'subtotal' => $subtotal
                ];
            }

            // Bind para insertar encabezado (total calculado)
            $stmt->bind_param("disssss", $total_calculado, $id_usuario, $direccion_entrega, $telefono, $metodo_pago, $numero_pedido, $notas);

            if (!$stmt->execute()) {
                throw new Exception("Error al ejecutar insert pedido: " . $stmt->error);
            }

            $id_pedido = $this->conn->insert_id;

            // Insertar cada detalle
            $sql_detalle = "INSERT INTO detallepedido (id_pedido, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)";
            $stmt_detalle = $this->conn->prepare($sql_detalle);
            if (!$stmt_detalle) {
                throw new Exception("Error en prepare detalle: " . $this->conn->error);
            }

            foreach ($productos_a_insertar as $item) {
                $stmt_detalle->bind_param("iiid", $id_pedido, $item['id_producto'], $item['cantidad'], $item['subtotal']);
                if (!$stmt_detalle->execute()) {
                    throw new Exception("Error al insertar detalle: " . $stmt_detalle->error);
                }
            }

            $this->conn->commit();

            return [
                'id_pedido' => $id_pedido,
                'numero_pedido' => $numero_pedido
            ];
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    // Actualizar estado del pedido
    public function actualizarEstado($id, $estado)
    {
        $estados_validos = ['recibido', 'preparacion', 'en_camino', 'entregado', 'cancelado', 'pendiente'];
        if (!in_array($estado, $estados_validos)) {
            return false;
        }

        $sql = "UPDATE pedido SET estado = ? WHERE id_pedido = ?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) return false;
        $stmt->bind_param("si", $estado, $id);
        return $stmt->execute();
    }

    // Obtener pedidos por usuario
    public function obtenerPorUsuario($id_usuario)
    {
        $sql = "SELECT * FROM pedido WHERE id_usuario = ? ORDER BY fecha DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $res = $stmt->get_result();
        $pedidos = [];
        if ($res && $res->num_rows > 0) {
            while ($row = $res->fetch_assoc()) {
                $pedidos[] = $row;
            }
        }
        return $pedidos;
    }

    // Obtener pedido por número de pedido
    public function obtenerPorNumeroPedido($numero_pedido)
    {
        $sql = "SELECT p.*, u.nombre_usuario, u.email
                FROM pedido p
                LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE p.numero_pedido = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $numero_pedido);
        $stmt->execute();
        $res = $stmt->get_result();
        return $res->fetch_assoc();
    }

    // Buscar pedidos por numero, usuario, email o estado
    public function buscar($texto)
    {
        $like = "%$texto%";
        $sql = "SELECT p.*, u.nombre_usuario, u.email
                FROM pedido p
                LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE p.numero_pedido LIKE ?
                   OR u.nombre_usuario LIKE ?
                   OR u.email LIKE ?
                   OR p.estado LIKE ?
                ORDER BY p.fecha DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssss", $like, $like, $like, $like);
        $stmt->execute();
        $res = $stmt->get_result();
        $pedidos = [];
        if ($res && $res->num_rows > 0) {
            while ($row = $res->fetch_assoc()) {
                $pedidos[] = $row;
            }
        }
        return $pedidos;
    }
}
