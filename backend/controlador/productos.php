<?php
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../modelo/producto.php';

$productoModel = new Producto($conn);

// Función para listar todos los productos
function listarProductos()
{
    global $productoModel;
    echo json_encode($productoModel->obtenerTodos());
}

// Función para mostrar un producto por ID
function mostrarProducto($id)
{
    global $productoModel;
    $producto = $productoModel->obtenerPorId($id);

    if ($producto) {
        echo json_encode($producto);
    } else {
        echo json_encode(["error" => "Producto no encontrado"]);
    }
}

// Función de búsqueda de productos por nombre, descripción, categoría o ID
function buscarProductos($texto)
{
    global $productoModel;
    echo json_encode($productoModel->buscar($texto));
}

// Función para agregar un producto (con imagen opcional)
function agregarProducto($nombre, $descripcion, $precio, $categoria, $imagen = null)
{
    global $productoModel;
    $id = $productoModel->agregar($nombre, $descripcion, $precio, $categoria, $imagen);

    if ($id) {
        echo json_encode(["mensaje" => "Producto agregado", "id" => $id]);
    } else {
        echo json_encode(["error" => "No se pudo agregar"]);
    }
}

// Función para modificar un producto (con imagen opcional)
function modificarProducto($id, $nombre, $descripcion, $precio, $categoria, $imagen = null)
{
    global $productoModel;
    if ($productoModel->modificar($id, $nombre, $descripcion, $precio, $categoria, $imagen)) {
        echo json_encode(["mensaje" => "Producto modificado", "id" => $id]);
    } else {
        echo json_encode(["error" => "No se pudo modificar"]);
    }
}

// Función para eliminar un producto
function eliminarProducto($id)
{
    global $productoModel;
    if ($productoModel->eliminar($id)) {
        echo json_encode(["mensaje" => "Producto eliminado", "id" => $id]);
    } else {
        echo json_encode(["error" => "No se pudo eliminar"]);
    }
}

// Función auxiliar para procesar imagen (creación o modificación)
function procesarImagen($id)
{
    if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== 0) return null;

    $file = $_FILES['imagen'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $maxSize = 3 * 1024 * 1024;

    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(["error" => "Formato de imagen no permitido (solo JPG, PNG o WEBP)"]);
        exit;
    }

    if ($file['size'] > $maxSize) {
        echo json_encode(["error" => "La imagen supera el tamaño máximo permitido (3MB)"]);
        exit;
    }

    $uploadDir = __DIR__ . "/../img/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = "{$id}." . strtolower($extension);
    $uploadPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        echo json_encode(["error" => "Error al subir la imagen"]);
        exit;
    }

    return $fileName;
}

// Función para manejar la creación de productos (con imagen opcional)
function manejarCreacionProducto()
{
    $nombre = $_POST['nombre'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $precio = $_POST['precio'] ?? null;
    $categoria = $_POST['categoria'] ?? null;

    if (!$nombre || !$descripcion || !$precio || !$categoria) {
        echo json_encode(["error" => "Datos del producto incompletos"]);
        return;
    }

    global $productoModel;
    $id = $productoModel->agregar($nombre, $descripcion, $precio, $categoria, null);

    if (!$id) {
        echo json_encode(["error" => "No se pudo crear el producto"]);
        return;
    }

    $imagen = procesarImagen($id);
    if ($imagen) {
        $productoModel->modificar($id, $nombre, $descripcion, $precio, $categoria, $imagen);
    }

    echo json_encode(["mensaje" => "Producto creado exitosamente", "id" => $id]);
}

// Función para manejar la modificación de productos (con imagen opcional)
function manejarModificacionProducto()
{
    $id = $_POST['id'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    $descripcion = $_POST['descripcion'] ?? null;
    $precio = $_POST['precio'] ?? null;
    $categoria = $_POST['categoria'] ?? null;

    if (!$id || !$nombre || !$descripcion || !$precio || !$categoria) {
        echo json_encode(["error" => "Datos incompletos"]);
        return;
    }

    $imagen = procesarImagen($id);
    modificarProducto($id, $nombre, $descripcion, $precio, $categoria, $imagen);
}
