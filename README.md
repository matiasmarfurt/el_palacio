# Proyecto Final: El Palacio

## Equipo

- Matías Marfurt
- Ian Pucella
- Irenco González
- Mauricio Moreno

## Descripción del Proyecto

Se nos pidió buscar un cliente para ofrecer un software de deliveries. Nuestro equipo ofreció el servicio a un restaurante local llamado **El Palacio**. Se desarrolló una aplicación web completa para la gestión de productos, pedidos, reservas y usuarios.

El proyecto está dividido en **frontend** (HTML5, CSS3, JS, Bootstrap) y **backend** (PHP, MySQL) siguiendo el patrón **MVC procedural**.

---

## Usuarios de prueba

- **Cliente:** `user@gmail.com` / contraseña: `123`
- **Administrador:** `administrador@administrador.com` / contraseña: `admin` (accede directamente al CRUD)

> El administrador tiene acceso completo al panel de gestión de productos, pedidos y usuarios.

---

## Backend y protección

El backend está organizado en múltiples endpoints para **usuarios**, **productos**, **pedidos** y **reservas**. Cada endpoint sigue el patrón MVC y protege las rutas con **tokens JWT**.

### Seguridad de Rutas

- Solo usuarios con rol `admin` pueden acceder a los endpoints de gestión de usuarios y productos.
- El middleware `auth.php` verifica el token JWT y asegura que el usuario tenga permisos adecuados.

### Funciones destacadas de seguridad

- **Registro de usuarios con contraseña encriptada:**

```php
public function registrar($nombre_usuario, $apellido_usuario, $email, $tipo, $password) {
    $hash = password_hash($password, PASSWORD_DEFAULT); // Hashear contraseña
    ...
}
```

- **Login seguro con verificación de hash:**

```php
public function logear($usuario, $password) {
    ...
    if (password_verify($password, $stored)) {
        // Verificación exitosa
    }
}
```

- **Actualización automática de hash si es necesario:**

```php
private function actualizarPasswordPorId($idUsuario, $newHash) {
    ...
}
```

### Búsquedas seguras con `LIKE`

Para permitir búsqueda flexible de pedidos, productos o usuarios:

```php
public function buscar($texto) {
    $like = "%$texto%";
    $sql = "SELECT ... WHERE campo1 LIKE ? OR campo2 LIKE ? ...";
    ...
}
```

Esto permite que el administrador encuentre fácilmente información parcial en distintos campos.

---

## Estructura de Carpetas

```bash
/backend                 # Backend MVC procedural
/backend/config/config.php  # Conexión a MySQL
/backend/logs/             # Registro de errores del servidor
/backend/bbdd/             # Base de datos .sql
/backend/api/              # Endpoints para usuarios, productos, pedidos y reservas
/backend/middleware/auth.php # Tokens JWT para usuarios
/backend/modelo/          # Modelos
/backend/controlador/     # Controladores
/backend/img/             # Imágenes dinámicas de productos
/backend/img/static/      # Imágenes estáticas
/frontend/                # Frontend HTML + CSS + JS + Bootstrap
/frontend/page/           # Páginas .html
/frontend/css/            # Estilos
/frontend/js/             # Scripts
```

---

## Base de datos (resumen)

Usuarios: id, nombre, apellido, email, tipo, password.

Productos: id, nombre, descripción, precio, categoría, imagen.

Pedidos: id, fecha, total, usuario, dirección, estado, teléfono, método de pago, número de pedido, notas.

DetallePedido: id, id_pedido, id_producto, cantidad, subtotal.

Reservas: id, fecha, hora, cantidad de personas, usuario, notas.

- La base de datos se encuentra en /backend/bbdd/el_palacio.sql y contiene tablas con relaciones adecuadas para manejar pedidos, detalles de pedidos, productos, usuarios y reservas.

## Notas importantes

- Se aplicó encriptado de contraseñas con `password_hash` y verificación con `password_verify`.
- El administrador puede crear, modificar y eliminar usuarios y productos, así como visualizar y gestionar pedidos y reservas.
- El cliente puede registrarse, iniciar sesión y realizar pedidos o reservas.
