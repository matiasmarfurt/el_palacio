<?php
require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../modelo/usuario.php';

$usuarioModel = new Usuario($conn);

function listarUsuarios() {
    global $usuarioModel;
    $usuarios = $usuarioModel->obtenerTodos();
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ]);
}

function registrarUsuario($nombre_usuario, $apellido_usuario, $email, $tipo, $password)
{
    global $usuarioModel;
    $resultado = $usuarioModel->registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password);
    echo json_encode($resultado);
}

function loginUsuario($usuario, $password)
{
    global $usuarioModel;
    $resultado = $usuarioModel->logear($usuario, $password);

    if ($resultado) {
        echo json_encode(["success" => true, "usuario" => $resultado]);
    } else {
        echo json_encode(["success" => false, "error" => "Usuario o contraseña incorrectos"]);
    }
}
