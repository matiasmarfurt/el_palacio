<?php
require_once __DIR__ . "/../config/conexion.php"; // Conexión a la base de datos

// Clase Usuario que maneja consultas a la tabla 'usuario'
class Usuario
{
    private $conn; // Propiedad para la conexión

    // Constructor que recibe la conexión
    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    // Obtener todos los usuarios
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

    // Obtener usuario por ID
    public function obtenerPorId($id)
    {
        $stmt = $this->conn->prepare("SELECT id_usuario, nombre_usuario, apellido_usuario, email, tipo FROM usuario WHERE id_usuario=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    // Registrar nuevo usuario
    public function registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password)
    {
        $hash = password_hash($password, PASSWORD_DEFAULT); // Hashear contraseña

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

    // Login: buscar por nombre o email y verificar contraseña
    public function logear($usuario, $password)
    {
        $stmt = $this->conn->prepare(
            "SELECT * FROM usuario WHERE email = ? OR nombre_usuario = ? LIMIT 1"
        );
        if (!$stmt) {
            error_log("[Usuario::logear] Error prepare: " . $this->conn->error);
            return null;
        }

        $stmt->bind_param('ss', $usuario, $usuario);
        if (!$stmt->execute()) {
            error_log("[Usuario::logear] Error execute: " . $stmt->error);
            return null;
        }

        $resultado = $stmt->get_result()->fetch_assoc();

        if (!$resultado) return null; // No existe el usuario

        $stored = $resultado['password'];

        // Contraseña hasheada
        if (password_verify($password, $stored)) {
            if (password_needs_rehash($stored, PASSWORD_DEFAULT)) {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $this->actualizarPasswordPorId($resultado['id_usuario'], $newHash);
            }
            unset($resultado['password']);
            return $resultado;
        }

        // Migración: contraseña en texto plano
        if ($stored === $password) {
            $newHash = password_hash($password, PASSWORD_DEFAULT);
            $this->actualizarPasswordPorId($resultado['id_usuario'], $newHash);
            unset($resultado['password']);
            return $resultado;
        }

        return null; // No coincide contraseña
    }

    // Actualizar password por id
    private function actualizarPasswordPorId($idUsuario, $newHash)
    {
        $stmt = $this->conn->prepare("UPDATE usuario SET password = ? WHERE id_usuario = ?");
        if (!$stmt) {
            error_log("[Usuario::actualizarPasswordPorId] Error prepare: " . $this->conn->error);
            return false;
        }

        $stmt->bind_param('si', $newHash, $idUsuario);
        if (!$stmt->execute()) {
            error_log("[Usuario::actualizarPasswordPorId] Error execute: " . $stmt->error);
            return false;
        }

        return true;
    }

    // Modificar usuario (recibe array $data con id_usuario y campos a modificar)
    public function modificar($data)
    {
        $campos = [];
        $params = [];
        $tipos = '';

        foreach ($data as $key => $value) {
            if ($key === 'id_usuario') continue;
            $campos[] = "$key=?";
            $params[] = $value;
            $tipos .= 's';
        }
        $params[] = $data['id_usuario'];
        $tipos .= 'i';

        $sql = "UPDATE usuario SET " . implode(',', $campos) . " WHERE id_usuario=?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) return ["success" => false, "error" => $this->conn->error];

        $stmt->bind_param($tipos, ...$params);
        if ($stmt->execute()) return ["success" => true, "message" => "Usuario modificado correctamente"];
        return ["success" => false, "error" => $stmt->error];
    }

    public function eliminar($id_usuario)
    {
        $stmt = $this->conn->prepare("DELETE FROM usuario WHERE id_usuario=?");
        if (!$stmt) return ["success" => false, "error" => $this->conn->error];
        $stmt->bind_param('i', $id_usuario);
        if ($stmt->execute()) return ["success" => true, "message" => "Usuario eliminado correctamente"];
        return ["success" => false, "error" => $stmt->error];
    }
}
