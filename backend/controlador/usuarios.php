<?php
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../modelo/usuario.php';
require_once __DIR__ . '/../middleware/auth.php'; // Importar middleware para implementar seguridad con tokens JWT

$usuarioModel = new Usuario($conn);

function listarUsuarios() {
    global $usuarioModel;
    $usuarios = $usuarioModel->obtenerTodos();
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ]);
}

function registrarUsuario($nombre_usuario, $apellido_usuario, $email, $tipo, $password) {
    global $usuarioModel;
    $resultado = $usuarioModel->registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password);
    echo json_encode($resultado);
}

function loginUsuario($usuario, $password) {
    global $usuarioModel;
    $resultado = $usuarioModel->logear($usuario, $password);

    if ($resultado) {
        // Generar token JWT
        $payload = [
            "id" => $resultado['id_usuario'],
            "tipo" => $resultado['tipo'],
            "iat" => time(),
            "exp" => time() + 3600 // 1 hora de expiración
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
