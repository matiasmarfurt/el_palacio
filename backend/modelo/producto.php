<?php
// Se importa el archivo que contiene la configuración de la base de datos, que establece la conexión
require_once __DIR__ . "/../config/conexion.php"; // Importar la conexión a la base de datos

// Definición de la clase Producto que interactuará con la tabla 'productos' en la base de datos
class Producto
{
    private $conn; // Propiedad privada para almacenar la conexión mysqli

    // El constructor recibe el objeto $conn (conexión a la base de datos) y lo asigna a la propiedad $this->conn
    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    // Método para obtener todos los productos de la base de datos
    public function obtenerTodos()
    {
        $stmt = $this->conn->prepare("SELECT * FROM productos");
        if (!$stmt) {
            die("Error en prepare: " . $this->conn->error);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Método para obtener un producto por ID
    public function obtenerPorId($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM productos WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    // Método para agregar un producto
    public function agregar($nombre, $descripcion, $precio, $categoria, $imagen = null)
    {
        $stmt = $this->conn->prepare("INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssdss", $nombre, $descripcion, $precio, $categoria, $imagen);
        if ($stmt->execute()) return $this->conn->insert_id;
        return false;
    }

    // Método para modificar un producto existente
    public function modificar($id, $nombre, $descripcion, $precio, $categoria, $imagen = null)
    {
        if ($imagen) {
            $stmt = $this->conn->prepare("UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=?, imagen=? WHERE id=?");
            $stmt->bind_param("ssdssi", $nombre, $descripcion, $precio, $categoria, $imagen, $id);
        } else {
            $stmt = $this->conn->prepare("UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria=? WHERE id=?");
            $stmt->bind_param("ssdsi", $nombre, $descripcion, $precio, $categoria, $id);
        }
        return $stmt->execute();
    }

    // Método para eliminar un producto
    public function eliminar($id)
    {
        $stmt = $this->conn->prepare("SELECT imagen FROM productos WHERE id=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        $producto = $res->fetch_assoc();

        // Eliminar la imagen del servidor si existe
        if ($producto && !empty($producto['imagen'])) {
            $ruta = __DIR__ . "/../img/" . $producto['imagen'];
            if (file_exists($ruta)) unlink($ruta);
        }

        $stmt = $this->conn->prepare("DELETE FROM productos WHERE id=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    // Método para buscar productos por nombre, categoría o descripción
    public function buscar($texto)
    {
        $like = "%$texto%";
        $stmt = $this->conn->prepare("SELECT * FROM productos WHERE nombre LIKE ? OR categoria LIKE ? OR descripcion LIKE ? OR CAST(id AS CHAR) LIKE ?");
        $stmt->bind_param("ssss", $like, $like, $like, $like);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
