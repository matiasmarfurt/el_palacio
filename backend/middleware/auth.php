<?php

// Middleware para autenticación usando JWT

// Token generada usando el comando: "php -r "echo bin2hex(random_bytes(32));"
$JWT_SECRET = "c0580059f4a2c7ad6986679eaa1800f0851cd0e3383498621bbb1effe16ca70c";

// Crea un JWT manualmente con header, payload y firma.
function generarJWT($payload)
{
    global $JWT_SECRET;

    // Header: tipo de token + algoritmo de firma
    $header = json_encode(["typ" => "JWT", "alg" => "HS256"]);

    /* Payload: datos del usuario (id, email, tipo, etc).
       El controlador se encarga de incluir exp (expiración) */
    $payload = json_encode($payload);

    // Codificar ambos en Base64URL (sin caracteres que puedan causar conflictos)
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

    // Estructura: header.payload.signature
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Valida el token recibido desde headers.
function verificarJWT($jwt)
{
    global $JWT_SECRET;

    // Dividir token en 3 partes
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    // Recalcular firma para comprobar integridad
    $sigCheck = hash_hmac('sha256', $header . "." . $payload, $JWT_SECRET, true);
    $sigCheck = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($sigCheck));

    // Si las firmas no coinciden → token manipulado
    if ($signature !== $sigCheck) return false;

    // Decodificar payload para leer su contenido
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);

    // Verificar expiración
    if ($payload['exp'] < time()) return false;

    // Token válido → devolver datos del usuario
    return $payload;
}

// Middleware que protege rutas segun tipo (usuario tipo public/admin).
function requireAuth($type = "public")
{
    $headers = getallheaders();

    // Si no hay header Authorization → sin token → no autenticado
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "No autenticado"]);
        exit();
    }

    // Extraer token (formato: "Bearer TOKEN...")
    $token = str_replace("Bearer ", "", $headers['Authorization']);
    $payload = verificarJWT($token);

    // Extraer token (formato: "Bearer TOKEN...")
    if (!$payload) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Token inválido o expirado"]);
        exit();
    }

    // Si la ruta requiere admin, verificar tipo
    if ($type === "admin" && $payload['tipo'] !== "admin") {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "Acceso denegado. Solo administradores."]);
        exit();
    }

    // Si llega hasta acá → autenticado correctamente
    return $payload; // info del usuario disponible en el controlador
}
