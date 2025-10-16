<?php
// Se importa el archivo que contiene la configuración de la base de datos, que establece la conexión
require_once __DIR__ . "/../config/conexion.php"; // Importar la conexión a la base de datos

// Definición de la clase Reserva que interactuará con la tabla 'reservas' en la base de datos
class Reserva
{
    private $conn; // Propiedad privada para almacenar la conexión mysqli

    // El constructor recibe el objeto $conn (conexión a la base de datos) y lo asigna a la propiedad $this->conn
    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    // Método para crear una nueva reserva
    public function crear($nombre, $email, $telefono, $personas, $fecha, $hora, $comentarios)
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO reservas (nombre, email, telefono, personas, fecha, hora, comentarios) VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        if (!$stmt) {
            return ["success" => false, "error" => $this->conn->error];
        }

        $stmt->bind_param('sssisss', $nombre, $email, $telefono, $personas, $fecha, $hora, $comentarios);

        if ($stmt->execute()) {
            $insert_id = $stmt->insert_id;
            $stmt->close();
            return ["success" => true, "insert_id" => $insert_id];
        } else {
            $err = $stmt->error;
            $stmt->close();
            return ["success" => false, "error" => $err];
        }
    }

    // Método para obtener todas las reservas ordenadas por fecha y hora
    public function listarTodos()
    {
        $stmt = $this->conn->prepare("SELECT * FROM reservas ORDER BY fecha ASC, hora ASC");
        if (!$stmt) {
            return ["success" => false, "error" => $this->conn->error];
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return ["success" => true, "data" => $rows];
    }
}

