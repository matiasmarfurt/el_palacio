<?php

require_once __DIR__ . "/../config/conexion.php"; // Importar la conexión a la base de datos

// Definición de la clase Usuario que interactúa con la tabla 'usuario' en la base de datos
class Usuario
{
    private $conn; // Propiedad para almacenar la conexión mysqli

    // Constructor que recibe la conexión a la base de datos y la asigna a $this->conn
    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function obtenerTodos()
    {
        $query = "SELECT id_usuario, nombre_usuario, apellido_usuario, email, tipo FROM usuario";
        $result = $this->conn->query($query);
        
        $usuarios = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $usuarios[] = $row;
            }
        }
        
        return $usuarios;
    }

    // Método para registrar un nuevo usuario
    public function registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password)
    {
        // Hashear la contraseña antes de guardarla
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->conn->prepare(
            "INSERT INTO usuario (nombre_usuario, apellido_usuario, email, tipo, password) VALUES (?, ?, ?, ?, ?)"
        );

        if (!$stmt) {
            return [
                "success" => false,
                "message" => "Error al preparar la consulta",
                "error" => $this->conn->error
            ];
        }

        // Bindear parámetros (s = string)
        $stmt->bind_param('sssss', $nombre_usuario, $apellido_usuario, $email, $tipo, $hash);

        if ($stmt->execute()) {
            return [
                "success" => true,
                "message" => "Registro exitoso, ¡bienvenido $nombre_usuario!",
                "insert_id" => $stmt->insert_id
            ];
        } else {
            return [
                "success" => false,
                "message" => "No se pudo registrar el usuario",
                "error" => $stmt->error
            ];
        }
    }

    // Método para obtener usuario por email o nombre y verificar contraseña
    public function logear($usuario, $password)
    {
        $stmt = $this->conn->prepare("SELECT * FROM usuario WHERE email = ? OR nombre_usuario = ?");
        if (!$stmt) {
            die("Error en prepare: " . $this->conn->error);
        }

        $stmt->bind_param('ss', $usuario, $usuario);
        $stmt->execute();

        $resultado = $stmt->get_result()->fetch_assoc();

        // Verificar contraseña y devolver datos (sin password) o null si no coincide
        if ($resultado && password_verify($password, $resultado['password'])) {
            unset($resultado['password']);
            return $resultado;
        }

        return null;
    }
}
