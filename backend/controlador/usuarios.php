<?php
require_once __DIR__ . '/../config/conexion.php'; // Conexión a la base de datos
require_once __DIR__ . '/../modelo/usuario.php'; // Modelo de usuario
require_once __DIR__ . '/../middleware/auth.php'; // Middleware JWT

$usuarioModel = new Usuario($conn); // Instanciar modelo

// Función para listar todos los usuarios
function listarUsuarios()
{
    global $usuarioModel;

    // Obtener info del admin desde JWT
    $payload = requireAuth("admin"); // ahora devuelve el payload con id y tipo

    $adminData = $usuarioModel->obtenerPorId($payload['id']); // nueva función en modelo
    $usuarios = $usuarioModel->obtenerTodos(); // Llama al modelo
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ]);
}

// Función para registrar un usuario
function registrarUsuario($nombre_usuario, $apellido_usuario, $email, $tipo, $password)
{
    global $usuarioModel;
    $resultado = $usuarioModel->registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password);
    echo json_encode($resultado);
}

// Función para login (acepta nombre o email)
function loginUsuario($usuario, $password)
{
    global $usuarioModel;
    $resultado = $usuarioModel->logear($usuario, $password);

    if ($resultado) {
        // Generar token JWT con datos del usuario
        $payload = [
            "id" => $resultado['id_usuario'],
            "tipo" => $resultado['tipo'],
            "iat" => time(),          // Fecha de emisión
            "exp" => time() + 3600    // Expira en 1 hora
        ];
        $token = generarJWT($payload);

        echo json_encode([
            "success" => true,
            "token" => $token,
            "usuario" => $resultado
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Usuario o contraseña incorrectos"]);
    }
}

// Modificar usuario (recibe array $data con id_usuario y campos a modificar)
function modificarUsuario($data)
{
    global $usuarioModel;
    $resultado = $usuarioModel->modificar($data);
    echo json_encode($resultado);
}

// Eliminar usuario por ID
function eliminarUsuario($id_usuario)
{
    global $usuarioModel;
    $resultado = $usuarioModel->eliminar($id_usuario);
    echo json_encode($resultado);
}
